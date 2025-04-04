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