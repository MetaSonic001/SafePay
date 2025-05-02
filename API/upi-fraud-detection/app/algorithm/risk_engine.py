import logging
import json
from app.config import Config

class RiskEngine:
    """
    Risk scoring engine that combines different signals and makes a final decision.
    """
    
    def __init__(self):
        """Initialize risk engine with default config"""
        # Load config
        self.graph_temporal_weight = Config.GRAPH_TEMPORAL_WEIGHT
        self.content_analysis_weight = Config.CONTENT_ANALYSIS_WEIGHT
        
        # Risk thresholds
        self.low_risk_threshold = Config.LOW_RISK_THRESHOLD
        self.medium_risk_threshold = Config.MEDIUM_RISK_THRESHOLD
        self.high_risk_threshold = Config.HIGH_RISK_THRESHOLD
    
    def _get_user_transaction_stats(self, user_id):
        """Get statistical profile of user's transaction history"""
        from app.models.transaction import Transaction
        from datetime import datetime, timedelta
        import numpy as np
    
        stats = {
            'avg_amount': 0,
            'max_amount': 0,
            'percentile_95': 0,
            'avg_daily_count': 0,
            'max_hourly_count': 0
        }
    
        try:
            # Get transactions from the last 90 days
            ninety_days_ago = datetime.utcnow() - timedelta(days=90)
        
            # Get amounts for percentiles
            amounts = [tx.amount for tx in Transaction.query.filter(
                Transaction.sender_id == user_id,
                Transaction.timestamp >= ninety_days_ago
            ).all()]
        
            if amounts:
                stats['avg_amount'] = np.mean(amounts)
                stats['max_amount'] = np.max(amounts)
                stats['percentile_95'] = np.percentile(amounts, 95) if len(amounts) >= 5 else stats['max_amount']
        
            # Get hourly transaction counts for velocity stats
            from sqlalchemy import func
            from sqlalchemy.sql import text
        
            # This requires raw SQL for proper time-based grouping
            hourly_counts = db.session.execute(text("""
                SELECT DATE_TRUNC('hour', timestamp) as hour, COUNT(*) as tx_count
                FROM transactions
                WHERE sender_id = :user_id
                AND timestamp >= :start_date
                GROUP BY hour
                ORDER BY tx_count DESC
                LIMIT 1
            """), {'user_id': user_id, 'start_date': ninety_days_ago}).fetchone()
        
            if hourly_counts:
                stats['max_hourly_count'] = hourly_counts[1]
        
        except Exception as e:
            logging.error(f"Error getting user transaction stats: {str(e)}")
    
        return stats

    def _check_global_fraud_trends(self, transaction_data):
        """Check if transaction matches recent global fraud patterns"""
        from app.models.transaction import Transaction
        from datetime import datetime, timedelta
    
        risk_factor = 0.0
    
        try:
            # Look at recent blocked transactions (last 7 days)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_frauds = Transaction.query.filter(
                Transaction.status == 'blocked',
                Transaction.timestamp >= seven_days_ago
            ).order_by(Transaction.timestamp.desc()).limit(200).all()
        
            # Extract common patterns in metadata
            fraud_urls = []
            fraud_receivers = []
        
            for tx in recent_frauds:
                if tx.receiver_id:
                    fraud_receivers.append(tx.receiver_id)
            
                if tx.txn_metadata:
                    try:
                        meta = json.loads(tx.txn_metadata)
                        if 'payment_url' in meta:
                            fraud_urls.append(meta['payment_url'])
                    except:
                        pass
        
            # Check for receiver match
            receiver_id = transaction_data.get('receiver_id')
            if receiver_id in fraud_receivers:
                risk_factor += 0.4
        
            # Check for URL pattern match
            txn_metadata = transaction_data.get('txn_metadata', {})
            if 'payment_url' in txn_metadata:
                payment_url = txn_metadata['payment_url']
                for fraud_url in fraud_urls:
                    # Simple URL similarity check
                    from difflib import SequenceMatcher
                    similarity = SequenceMatcher(None, payment_url, fraud_url).ratio()
                    if similarity > 0.7:
                        risk_factor += 0.3
                        break
        
        except Exception as e:
            logging.error(f"Error checking global fraud trends: {str(e)}")
    
        return min(risk_factor, 0.5)  # Cap at 0.5
    
    def calculate_risk(self, graph_temporal_score, content_analysis_score, 
                       transaction_data, graph_temporal_details, content_analysis_details):
        """
        Calculate final risk score and make decision.
        
        Args:
            graph_temporal_score (float): Score from graph-temporal analysis
            content_analysis_score (float): Score from content analysis
            transaction_data (dict): Transaction data
            graph_temporal_details (dict): Details from graph-temporal analysis
            content_analysis_details (dict): Details from content analysis
            
        Returns:
            tuple: (risk_score, decision, risk_details)
        """
        # Apply appropriate weights for different scenarios
        is_new_account = transaction_data.get('is_new_account', False)
        amount = transaction_data.get('amount', 0)
        
        # For new accounts, increase the weight of the content analysis
        if is_new_account:
            # Adjust weights for new accounts (rely more on content)
            graph_temporal_weight = 0.4
            content_analysis_weight = 0.6
        else:
            # Use default weights
            graph_temporal_weight = self.graph_temporal_weight
            content_analysis_weight = self.content_analysis_weight
        
        # Calculate weighted risk score
        risk_score = (
            graph_temporal_weight * graph_temporal_score +
            content_analysis_weight * content_analysis_score
        )
        
        # Add dynamic thresholds based on transaction history
        sender_id = transaction_data.get('sender_id')
        from app.models.transaction import Transaction
        from datetime import datetime, timedelta
    
        # Get user percentiles for comparison
        user_stats = self._get_user_transaction_stats(sender_id)
    
        # Apply dynamic risk adjustment based on user history
        dynamic_risk_adj = 0.0
    
        # If amount is beyond user's 95th percentile
        amount = transaction_data.get('amount', 0)
        if user_stats.get('percentile_95', 0) > 0 and amount > user_stats.get('percentile_95', 0):
            amount_factor = min((amount - user_stats['percentile_95']) / user_stats['percentile_95'], 1.0) * 0.3
            dynamic_risk_adj += amount_factor
            risk_details['dynamic_adjustments'] = {
                'amount_beyond_percentile95': amount_factor
            }
    
        # If transaction velocity is high compared to user history
        hour_count = graph_temporal_details.get('temporal_analysis', {}).get('last_hour_count', 0)
        if hour_count > user_stats.get('max_hourly_count', 3):
            velocity_factor = min((hour_count - user_stats['max_hourly_count']) / 5, 1.0) * 0.2
            dynamic_risk_adj += velocity_factor
            if 'dynamic_adjustments' not in risk_details:
                risk_details['dynamic_adjustments'] = {}
            risk_details['dynamic_adjustments']['velocity_factor'] = velocity_factor
    
        # Add global trend awareness
        risk_factor_trending = self._check_global_fraud_trends(transaction_data)
        if risk_factor_trending > 0:
            if 'dynamic_adjustments' not in risk_details:
                risk_details['dynamic_adjustments'] = {}
            risk_details['dynamic_adjustments']['trending_fraud_pattern'] = risk_factor_trending
            dynamic_risk_adj += risk_factor_trending
    
        # Apply dynamic adjustment to risk score
        risk_score = min(1.0, risk_score + dynamic_risk_adj)
        
        # Apply amount-based adjustments
        # For very high amounts, increase risk score
        if amount > 10000:  # Example threshold
            risk_factor = min(0.2, (amount - 10000) / 50000)  # Cap at 0.2 increase
            risk_score = min(1.0, risk_score + risk_factor)
            amount_factor = risk_factor
        else:
            amount_factor = 0.0
        
        # Make decision based on risk score
        if risk_score < self.low_risk_threshold:
            decision = 'approved'
        elif risk_score < self.high_risk_threshold:
            decision = 'pending_verification'  # Requires additional verification
        else:
            decision = 'blocked'
        
        # Check for special conditions that override the decision
        # Content analysis high score indicates likely phishing or QR tampering
        if content_analysis_score > 0.8:
            decision = 'blocked'
            override_reason = 'High-confidence phishing or QR tampering detected'
        else:
            override_reason = None
        
        # Check for simulation type
        if transaction_data.get('is_simulated', False):
            simulation_type = transaction_data.get('simulation_type', '')
            if simulation_type in ['phishing_url', 'qr_code_tampering', 'network_fraud']:
                decision = 'blocked'
                override_reason = f'Simulated {simulation_type} detected'
            elif simulation_type == 'high_value':
                decision = 'pending_verification'
                override_reason = 'Simulated high-value transaction requires verification'
        
        # Prepare detailed risk breakdown
        risk_details = {
            'overall_risk_score': risk_score,
            'decision': decision,
            'graph_temporal': {
                'score': graph_temporal_score,
                'weight': graph_temporal_weight,
                'details': graph_temporal_details
            },
            'content_analysis': {
                'score': content_analysis_score,
                'weight': content_analysis_weight,
                'details': content_analysis_details
            },
            'amount_factor': amount_factor,
            'override_reason': override_reason
        }
        
        return risk_score, decision, risk_details
    
    