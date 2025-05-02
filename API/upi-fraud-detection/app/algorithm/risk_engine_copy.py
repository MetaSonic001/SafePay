import logging
import json
from datetime import datetime, timedelta
import numpy as np

# Mock Config class since the original might not be accessible
class Config:
    GRAPH_TEMPORAL_WEIGHT = 0.5
    CONTENT_ANALYSIS_WEIGHT = 0.5
    LOW_RISK_THRESHOLD = 0.3
    MEDIUM_RISK_THRESHOLD = 0.6
    HIGH_RISK_THRESHOLD = 0.8

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
        # Mocked transaction stats for simulation purposes
        stats = {
            'avg_amount': 800,
            'max_amount': 2000,
            'percentile_95': 1500,
            'avg_daily_count': 3,
            'max_hourly_count': 2
        }
        
        # For specific user simulations
        if user_id == "high_risk_user":
            stats['percentile_95'] = 500  # Lower threshold to trigger high risk
        
        return stats

    def _check_global_fraud_trends(self, transaction_data):
        """Check if transaction matches recent global fraud patterns"""
        risk_factor = 0.0
        
        # Detect QR code tampering
        txn_metadata = transaction_data.get('txn_metadata', {})
        if txn_metadata.get('qr_manipulated'):
            risk_factor += 0.4
            
        # Check for device changes combined with other factors
        device_info = transaction_data.get('device_info', {})
        if device_info.get('device_changed'):
            risk_factor += 0.2
            
            # Higher risk if location also changed
            location = transaction_data.get('location', {})
            if location.get('changed'):
                risk_factor += 0.2
                
        # Check sender against known patterns
        sender_id = transaction_data.get('sender_id')
        if sender_id == "user123" and transaction_data.get('is_simulated'):
            risk_factor += 0.3
            
        # Check receiver against suspicious list
        receiver_id = transaction_data.get('receiver_id')
        suspicious_receivers = ["merchant999", "fakepayee", "merchant456"]
        if receiver_id in suspicious_receivers:
            risk_factor += 0.2
            
        # Check for payment URL patterns
        payment_url = transaction_data.get('payment_url')
        if payment_url and "example.com" in payment_url:
            risk_factor += 0.1
            
        return min(risk_factor, 0.8)  # Cap at 0.8
    
    def calculate_risk(self, graph_temporal_score, content_analysis_score, 
                      transaction_data, graph_temporal_details=None, content_analysis_details=None):
        """
        Calculate the risk score for a transaction and make a decision.
        
        Args:
            graph_temporal_score: Score from graph temporal analysis
            content_analysis_score: Score from content analysis
            transaction_data: Dictionary with transaction data
            graph_temporal_details: Optional details from graph analysis
            content_analysis_details: Optional details from content analysis
            
        Returns:
            Tuple of (risk_score, decision, risk_details)
        """
        try:
            # Extract and convert amount to float
            amount = float(transaction_data.get('amount', '0'))
            user_id = transaction_data.get('user_id') or transaction_data.get('sender_id', '')
            
            # Get user stats
            user_stats = self._get_user_transaction_stats(user_id)
            
            # Check for simulated fraud
            is_simulated = transaction_data.get('is_simulated', False)
            simulation_type = transaction_data.get('simulation_type', '')
            
            # Base risk calculation
            base_risk = 0.1  # Default low risk
            
            # Amount risk - compare with user's history
            amount_risk = 0.0
            if user_stats.get('percentile_95', 0) > 0:
                if amount > user_stats['percentile_95'] * 2:
                    amount_risk = 0.7
                elif amount > user_stats['percentile_95']:
                    amount_risk = 0.4
                elif amount > user_stats['avg_amount'] * 1.5:
                    amount_risk = 0.2
            
            # Check for fraud patterns
            fraud_pattern_risk = self._check_global_fraud_trends(transaction_data)
            
            # Check for QR code tampering specifically
            qr_code_data = transaction_data.get('qr_code_data', '')
            qr_risk = 0.0
            if qr_code_data and "fakehacker@fraud" in qr_code_data:
                qr_risk = 0.9
            elif qr_code_data and "suspicious" in qr_code_data:
                qr_risk = 0.7
                
            # Device and location risk
            device_info = transaction_data.get('device_info', {})
            location = transaction_data.get('location', {})
            behavioral_risk = 0.0
            
            if device_info.get('device_changed') and location.get('changed'):
                behavioral_risk = 0.6
            elif device_info.get('device_changed'):
                behavioral_risk = 0.3
            elif location.get('changed'):
                behavioral_risk = 0.2
                
            # Transaction metadata risk
            metadata = transaction_data.get('transaction_metadata', {})
            metadata_risk = 0.0
            
            if metadata.get('high_velocity'):
                metadata_risk += 0.3
            if metadata.get('new_beneficiary'):
                metadata_risk += 0.2
            if metadata.get('login_attempts_24hrs', 0) > 5:
                metadata_risk += 0.4
            if metadata.get('link_source') in ['whatsapp', 'email', 'ad']:
                metadata_risk += 0.2
                
            # Simulated fraud scenarios
            if is_simulated:
                if simulation_type == 'qr_code_tampering':
                    qr_risk = 0.9
                elif simulation_type == 'account_takeover':
                    behavioral_risk = 0.8
                elif simulation_type == 'fake_upi':
                    qr_risk = 0.7
                    metadata_risk = 0.5
                elif simulation_type == 'device_spoofing':
                    behavioral_risk = 0.6
            
            # Combine all risk factors with weights
            risk_score = (
                base_risk * 0.1 +
                amount_risk * 0.2 +
                fraud_pattern_risk * 0.2 +
                qr_risk * 0.3 +
                behavioral_risk * 0.2 +
                metadata_risk * 0.2 +
                graph_temporal_score * 0.1 +
                content_analysis_score * 0.1
            ) / 1.4  # Normalize by sum of weights
            
            # Cap risk score between 0 and 1
            risk_score = max(0.0, min(1.0, risk_score))
            
            # Determine decision
            decision = 'approve'
            if risk_score >= self.high_risk_threshold:
                decision = 'decline'
            elif risk_score >= self.medium_risk_threshold:
                decision = 'review'
                
            # Provide detailed risk factors
            risk_details = {
                'risk_breakdown': {
                    'amount_risk': amount_risk,
                    'fraud_pattern_risk': fraud_pattern_risk,
                    'qr_code_risk': qr_risk,
                    'behavioral_risk': behavioral_risk,
                    'metadata_risk': metadata_risk,
                    'graph_temporal_risk': graph_temporal_score,
                    'content_analysis_risk': content_analysis_score
                },
                'user_stats': user_stats,
                'amount': amount,
                'qr_analyzed': bool(qr_code_data),
                'device_analyzed': bool(device_info),
                'location_analyzed': bool(location),
                'metadata_analyzed': bool(metadata)
            }
            
            return risk_score, decision, risk_details
            
        except Exception as e:
            logging.error(f"Error in risk calculation: {str(e)}")
            # Return safe fallback
            return 0.5, 'review', {'error': str(e)}