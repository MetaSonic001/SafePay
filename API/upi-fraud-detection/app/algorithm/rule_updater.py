import logging
import numpy as np
from datetime import datetime, timedelta
from app.models.transaction import Transaction
from app import db

class RuleUpdater:
    """Updates rule thresholds based on transaction history"""
    
    def __init__(self):
        self.thresholds = {}
    
    def update_thresholds(self):
        """Calculate and update thresholds from transaction data"""
        try:
            # Get transactions from the last 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_txns = Transaction.query.filter(
                Transaction.timestamp >= thirty_days_ago
            ).all()
            
            # If not enough data, use defaults
            if len(recent_txns) < 100:
                logging.warning("Not enough transaction data to update thresholds")
                return self._get_default_thresholds()
            
            # Calculate amount-based thresholds
            amounts = [tx.amount for tx in recent_txns]
            
            # Normal transactions
            normal_txns = [tx for tx in recent_txns if tx.status == 'approved']
            normal_amounts = [tx.amount for tx in normal_txns] if normal_txns else []
            
            # Fraud transactions
            fraud_txns = [tx for tx in recent_txns if tx.status == 'blocked']
            fraud_amounts = [tx.amount for tx in fraud_txns] if fraud_txns else []
            
            # Set thresholds
            self.thresholds = {
                'amount': {
                    'mean': np.mean(amounts),
                    'median': np.median(amounts),
                    'p95': np.percentile(amounts, 95),
                    'p99': np.percentile(amounts, 99),
                },
                'velocity': self._calculate_velocity_thresholds(recent_txns),
                'network': self._calculate_network_thresholds(recent_txns),
                'fraud_patterns': self._extract_fraud_patterns(fraud_txns)
            }
            
            # Store thresholds in database or config
            self._save_thresholds()
            
            logging.info("Rule thresholds updated successfully")
            return self.thresholds
            
        except Exception as e:
            logging.error(f"Error updating rule thresholds: {str(e)}")
            return self._get_default_thresholds()
    
    def _calculate_velocity_thresholds(self, transactions):
        """Calculate velocity-based thresholds"""
        # Group by user and hour
        from collections import defaultdict
        hourly_counts = defaultdict(int)
        daily_counts = defaultdict(int)
        
        for tx in transactions:
            user_hour = f"{tx.sender_id}_{tx.timestamp.strftime('%Y-%m-%d %H')}"
            user_day = f"{tx.sender_id}_{tx.timestamp.strftime('%Y-%m-%d')}"
            
            hourly_counts[user_hour] += 1
            daily_counts[user_day] += 1
        
        # Get distributions
        hourly_values = list(hourly_counts.values())
        daily_values = list(daily_counts.values())
        
        return {
            'hourly': {
                'mean': np.mean(hourly_values) if hourly_values else 1,
                'p95': np.percentile(hourly_values, 95) if len(hourly_values) >= 20 else 3,
                'p99': np.percentile(hourly_values, 99) if len(hourly_values) >= 100 else 5,
            },
            'daily': {
                'mean': np.mean(daily_values) if daily_values else 3,
                'p95': np.percentile(daily_values, 95) if len(daily_values) >= 20 else 10,
                'p99': np.percentile(daily_values, 99) if len(daily_values) >= 100 else 20,
            }
        }
    
    def _calculate_network_thresholds(self, transactions):
        """Calculate network-based thresholds"""
        # Calculate centrality and connectivity metrics
        from collections import defaultdict
        user_connections = defaultdict(set)
        
        for tx in transactions:
            user_connections[tx.sender_id].add(tx.receiver_id)
        
        # Calculate metrics
        connection_counts = [len(connections) for connections in user_connections.values()]
        
        return {
            'connections': {
                'mean': np.mean(connection_counts) if connection_counts else 1,
                'p95': np.percentile(connection_counts, 95) if len(connection_counts) >= 20 else 5,
            }
        }
    
    def _extract_fraud_patterns(self, fraud_transactions):
        """Extract common patterns in fraud transactions"""
        # Extract domains from fraudulent URLs
        from urllib.parse import urlparse
        
        fraud_domains = []
        fraud_receivers = []
        
        for tx in fraud_transactions:
            if tx.receiver_id:
                fraud_receivers.append(tx.receiver_id)
                
            if tx.txn_metadata:
                try:
                    meta = json.loads(tx.txn_metadata)
                    if 'payment_url' in meta:
                        parsed = urlparse(meta['payment_url'])
                        fraud_domains.append(parsed.netloc)
                except:
                    pass
        
        # Get frequency counts
        from collections import Counter
        domain_counts = Counter(fraud_domains)
        receiver_counts = Counter(fraud_receivers)
        
        return {
            'top_fraud_domains': [domain for domain, count in domain_counts.most_common(10)],
            'top_fraud_receivers': [receiver for receiver, count in receiver_counts.most_common(10)]
        }
    
    def _get_default_thresholds(self):
        """Return default thresholds when data is insufficient"""
        return {
            'amount': {
                'mean': 1000,
                'median': 500,
                'p95': 5000,
                'p99': 10000,
            },
            'velocity': {
                'hourly': {
                    'mean': 1,
                    'p95': 3,
                    'p99': 5,
                },
                'daily': {
                    'mean': 3,
                    'p95': 10,
                    'p99': 20,
                }
            },
            'network': {
                'connections': {
                    'mean': 3,
                    'p95': 10,
                }
            },
            'fraud_patterns': {
                'top_fraud_domains': [],
                'top_fraud_receivers': []
            }
        }
    
    def _save_thresholds(self):
        """Save thresholds to database or config file"""
        # You could create a ThresholdConfig table in your database
        # or write to a JSON file
        import json
        import os
        
        # Ensure directory exists
        os.makedirs('app/data', exist_ok=True)
        
        # Write to file
        with open('app/data/thresholds.json', 'w') as f:
            json.dump(self.thresholds, f, indent=2)
    
    @staticmethod
    def load_current_thresholds():
        """Load current thresholds from storage"""
        import json
        import os
        
        try:
            if os.path.exists('app/data/thresholds.json'):
                with open('app/data/thresholds.json', 'r') as f:
                    return json.load(f)
            else:
                # Create a new instance and get defaults
                updater = RuleUpdater()
                return updater._get_default_thresholds()
        except Exception as e:
            logging.error(f"Error loading thresholds: {str(e)}")
            # Return defaults if error
            updater = RuleUpdater()
            return updater._get_default_thresholds()