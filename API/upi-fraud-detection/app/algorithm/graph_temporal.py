import logging
import networkx as nx
import numpy as np
from datetime import datetime, timedelta
from app.models.transaction import Transaction
from app import db

class GraphTemporalAnalyzer:
    """
    A class to perform graph-based and temporal analysis on transactions.
    Builds a transaction graph and analyzes patterns to detect anomalies.
    """
    
    def __init__(self):
        """Initialize the analyzer"""
        self.graph = nx.DiGraph()  # Directed graph for transactions
    
    def _build_transaction_graph(self, sender_id, receiver_id):
        """
        Build a transaction graph for the given sender and receiver.
        
        Args:
            sender_id (str): Sender's ID
            receiver_id (str): Receiver's ID
            
        Returns:
            nx.DiGraph: Transaction graph
        """
        # Get transactions from the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Query transactions
        transactions = Transaction.query.filter(
            ((Transaction.sender_id == sender_id) | 
             (Transaction.receiver_id == sender_id) |
             (Transaction.sender_id == receiver_id) | 
             (Transaction.receiver_id == receiver_id)) &
            (Transaction.timestamp >= thirty_days_ago)
        ).all()
        
        # Build graph from transactions
        for tx in transactions:
            # Add nodes if they don't exist
            if not self.graph.has_node(tx.sender_id):
                self.graph.add_node(tx.sender_id)
                
            if not self.graph.has_node(tx.receiver_id):
                self.graph.add_node(tx.receiver_id)
                
            # Add edge with transaction properties
            self.graph.add_edge(
                tx.sender_id, 
                tx.receiver_id, 
                amount=tx.amount,
                timestamp=tx.timestamp,
                transaction_id=tx.id
            )
        
        return self.graph
    
    def _analyze_temporal_patterns(self, sender_id, amount, timestamp):
        """
        Analyze temporal patterns for anomaly detection.
        
        Args:
            sender_id (str): Sender's ID
            amount (float): Transaction amount
            timestamp (datetime): Transaction timestamp
            
        Returns:
            tuple: (temporal_score, temporal_details)
        """
        # Get sender's transaction history
        thirty_days_ago = timestamp - timedelta(days=30)
        sender_history = Transaction.query.filter(
            Transaction.sender_id == sender_id,
            Transaction.timestamp >= thirty_days_ago,
            Transaction.timestamp < timestamp  # Only consider past transactions
        ).order_by(Transaction.timestamp.desc()).all()
        
        # Initialize scores and details
        temporal_score = 0.0
        temporal_details = {
            'amount_anomaly': 0.0,
            'frequency_anomaly': 0.0,
            'time_window_anomaly': 0.0,
            'history_length': len(sender_history)
        }
        
        # If no history, return medium risk score (0.5)
        if not sender_history:
            temporal_score = 0.5
            temporal_details['reason'] = 'No transaction history'
            return temporal_score, temporal_details
        
        last_hour = timestamp - timedelta(hours=1)
        last_day = timestamp - timedelta(days=1)
    
        # Transactions in last hour/day
        hour_txns = Transaction.query.filter(
            Transaction.sender_id == sender_id,
            Transaction.timestamp >= last_hour,
            Transaction.timestamp < timestamp
        ).all()
    
        day_txns = Transaction.query.filter(
            Transaction.sender_id == sender_id,
            Transaction.timestamp >= last_day,
            Transaction.timestamp < timestamp
        ).all()
    
        # Calculate velocity metrics
        hour_count = len(hour_txns)
        day_count = len(day_txns)
        hour_volume = sum(tx.amount for tx in hour_txns)
        day_volume = sum(tx.amount for tx in day_txns)
    
        temporal_details['last_hour_count'] = hour_count
        temporal_details['last_day_count'] = day_count
        temporal_details['last_hour_volume'] = hour_volume
        temporal_details['last_day_volume'] = day_volume
    
        # Apply velocity rules
        if hour_count > 5:  # More than 5 transactions in an hour
            velocity_anomaly = min(0.1 * (hour_count - 5), 0.5)
            temporal_score += velocity_anomaly
            temporal_details['high_frequency_hour'] = True
    
        if day_count > 20:  # More than 20 transactions in a day
            velocity_anomaly = min(0.05 * (day_count - 20), 0.4)
            temporal_score += velocity_anomaly
            temporal_details['high_frequency_day'] = True
    
        # Handle new recipients
        if transaction_details['history_length'] > 0:
            receivers = [tx.receiver_id for tx in sender_history]
            if receiver_id not in receivers:
                temporal_details['new_recipient'] = True
                # Increase score for new recipient but reduce if user has more history
                new_recipient_score = 0.3 - (min(len(sender_history), 20) * 0.01)
                temporal_score += max(0, new_recipient_score)

        
        # Calculate amount anomaly score
        amounts = [tx.amount for tx in sender_history]
        mean_amount = np.mean(amounts) if amounts else 0
        std_amount = np.std(amounts) if len(amounts) > 1 else mean_amount * 0.5
        
        # If standard deviation is 0, set it to a small value to avoid division by zero
        std_amount = max(std_amount, 0.01)
        
        # Calculate z-score for amount
        z_score = (amount - mean_amount) / std_amount if std_amount > 0 else 0
        
        # Convert z-score to an anomaly score between 0 and 1
        amount_anomaly = min(max(0, abs(z_score) / 3), 1)
        temporal_details['amount_anomaly'] = amount_anomaly
        temporal_details['avg_transaction_amount'] = mean_amount
        temporal_details['transaction_amount_std'] = std_amount
        
        # Calculate frequency anomaly
        # Get time intervals between transactions
        timestamps = [tx.timestamp for tx in sender_history]
        if len(timestamps) > 1:
            # Sort timestamps
            timestamps.sort()
            
            # Calculate time differences in hours
            time_diffs = [(timestamps[i+1] - timestamps[i]).total_seconds() / 3600 
                          for i in range(len(timestamps)-1)]
            
            # Calculate mean and std of time differences
            mean_time_diff = np.mean(time_diffs) if time_diffs else 24  # Default to 24 hours
            std_time_diff = np.std(time_diffs) if len(time_diffs) > 1 else mean_time_diff * 0.5
            
            # Calculate time since last transaction
            if timestamps:
                time_since_last = (timestamp - timestamps[-1]).total_seconds() / 3600
                
                # If time since last is much shorter than usual, flag it
                if mean_time_diff > 0:
                    z_score_time = abs(time_since_last - mean_time_diff) / std_time_diff if std_time_diff > 0 else 0
                    frequency_anomaly = min(max(0, z_score_time / 3), 1)
                else:
                    frequency_anomaly = 0.0
                
                temporal_details['frequency_anomaly'] = frequency_anomaly
                temporal_details['avg_hours_between_tx'] = mean_time_diff
                temporal_details['hours_since_last_tx'] = time_since_last
        
        # Check for unusual time window
        hour_of_day = timestamp.hour
        # Most financial transactions happen during business hours (8 AM - 8 PM)
        if hour_of_day < 6 or hour_of_day > 22:  # Late night transactions
            time_window_anomaly = 0.7  # Higher risk for late night
        else:
            time_window_anomaly = 0.0  # Normal time
            
        temporal_details['time_window_anomaly'] = time_window_anomaly
        temporal_details['hour_of_day'] = hour_of_day
        
        # Combine the anomaly scores with weights
        temporal_score = (
            0.6 * amount_anomaly + 
            0.3 * temporal_details.get('frequency_anomaly', 0.0) + 
            0.1 * time_window_anomaly
        )
        
        return temporal_score, temporal_details
    
    def _analyze_graph_patterns(self, sender_id, receiver_id):
        """
        Analyze graph patterns for anomaly detection.
        
        Args:
            sender_id (str): Sender's ID
            receiver_id (str): Receiver's ID
            
        Returns:
            tuple: (graph_score, graph_details)
        """
        graph_score = 0.0
        graph_details = {
            'previous_transactions': 0,
            'network_distance': -1,
            'common_neighbors': 0,
            'is_first_transaction': True
        }
        
        fraud_connections = self._get_fraud_connections(sender_id, receiver_id)
        graph_details['fraud_connections'] = fraud_connections
    
        if fraud_connections > 0:
            # Increase risk based on number of fraud connections
            fraud_factor = min(0.1 * fraud_connections, 0.5)
            graph_score += fraud_factor
            graph_details['fraud_connections_factor'] = fraud_factor


        # Check if there's an edge between sender and receiver
        if self.graph.has_edge(sender_id, receiver_id):
            graph_details['is_first_transaction'] = False
            
            # Count previous transactions
            prev_transactions = len([e for e in self.graph.edges(data=True) 
                                    if e[0] == sender_id and e[1] == receiver_id])
            graph_details['previous_transactions'] = prev_transactions
            
            # More previous transactions means lower risk
            graph_score -= min(0.3, 0.05 * prev_transactions)
        
        # Check network distance between sender and receiver
        try:
            if nx.has_path(self.graph, sender_id, receiver_id):
                distance = nx.shortest_path_length(self.graph, sender_id, receiver_id)
                graph_details['network_distance'] = distance
                
                # Shorter distance means lower risk
                if distance == 1:  # Direct connection
                    graph_score -= 0.2
                elif distance == 2:  # Friend of friend
                    graph_score -= 0.1
            else:
                graph_details['network_distance'] = -1  # No path exists
        except nx.NetworkXError:
            graph_details['network_distance'] = -1
        
        # Check common neighbors (mutual contacts)
        if self.graph.has_node(sender_id) and self.graph.has_node(receiver_id):
            # Get neighbors
            sender_neighbors = set(self.graph.neighbors(sender_id))
            receiver_neighbors = set(self.graph.neighbors(receiver_id))
            
            # Find common neighbors
            common = sender_neighbors.intersection(receiver_neighbors)
            graph_details['common_neighbors'] = len(common)
            
            # More common neighbors means lower risk
            graph_score -= min(0.3, 0.05 * len(common))
        
        # If this is a new connection with no common neighbors, increase risk
        if graph_details['is_first_transaction'] and graph_details['common_neighbors'] == 0:
            graph_score += 0.3
            
        # Normalize score to be between 0 and 1
        graph_score = max(0.0, min(1.0, 0.5 + graph_score))
        
        return graph_score, graph_details
    
    def _get_fraud_connections(self, sender_id, receiver_id):
        """Count connections to accounts involved in fraud"""
        fraud_count = 0
        
        try:
            # Get 2-hop neighborhood
            if self.graph.has_node(sender_id):
                neighbors = list(self.graph.neighbors(sender_id))
                
                # For each neighbor, check if they've been involved in fraud
                for neighbor in neighbors:
                    # Check if this neighbor has been blocked in transactions
                    from app.models.transaction import Transaction
                    
                    fraud_txns = Transaction.query.filter(
                        (Transaction.sender_id == neighbor) | (Transaction.receiver_id == neighbor),
                        Transaction.status == 'blocked',
                        Transaction.risk_score > 0.8
                    ).count()
                    
                    if fraud_txns > 0:
                        fraud_count += 1
            
            # Also check receiver directly
            from app.models.transaction import Transaction
            receiver_fraud = Transaction.query.filter(
                (Transaction.sender_id == receiver_id) | (Transaction.receiver_id == receiver_id),
                Transaction.status == 'blocked',
                Transaction.risk_score > 0.8
            ).count()
            
            if receiver_fraud > 0:
                fraud_count += 2  # Weight the receiver's fraud history more heavily
                
        except Exception as e:
            logging.error(f"Error analyzing fraud connections: {str(e)}")
        
        return fraud_count
    
    def analyze(self, sender_id, receiver_id, amount, timestamp):
        """
        Analyze transaction using graph and temporal patterns.
        
        Args:
            sender_id (str): Sender's ID
            receiver_id (str): Receiver's ID
            amount (float): Transaction amount
            timestamp (datetime): Transaction timestamp
            
        Returns:
            tuple: (risk_score, risk_details)
        """
        # Build the transaction graph
        self._build_transaction_graph(sender_id, receiver_id)
        
        # Analyze temporal patterns
        temporal_score, temporal_details = self._analyze_temporal_patterns(
            sender_id, amount, timestamp
        )
        
        # Analyze graph patterns
        graph_score, graph_details = self._analyze_graph_patterns(
            sender_id, receiver_id
        )
        
        # Combine scores with weights
        # Higher weight to temporal for new users, higher to graph for established users
        if temporal_details['history_length'] < 5:
            # New user - rely more on temporal analysis
            combined_score = 0.7 * temporal_score + 0.3 * graph_score
        else:
            # Established user - balance between temporal and graph
            combined_score = 0.5 * temporal_score + 0.5 * graph_score
            
        # Prepare combined details
        combined_details = {
            'graph_analysis': graph_details,
            'temporal_analysis': temporal_details,
            'final_graph_temporal_score': combined_score
        }
        
        return combined_score, combined_details