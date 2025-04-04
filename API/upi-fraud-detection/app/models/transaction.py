from datetime import datetime
from app import db
import json

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    sender_id = db.Column(db.String(50), nullable=False, index=True)
    receiver_id = db.Column(db.String(50), nullable=False, index=True)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # txn_metadata such as URL, QR code info, location, device info, etc.
    txn_metadata = db.Column(db.Text, nullable=True)
    
    # Risk assessment results
    risk_score = db.Column(db.Float, nullable=True)
    graph_temporal_score = db.Column(db.Float, nullable=True)
    content_analysis_score = db.Column(db.Float, nullable=True)
    
    # Decision: 'approved', 'blocked', 'pending_verification'
    status = db.Column(db.String(20), default='pending')
    
    # Detailed risk breakdown (stored as JSON)
    risk_details = db.Column(db.Text, nullable=True)
    
    # Processed flag to track if transaction has been analyzed
    processed = db.Column(db.Boolean, default=False)
    
    # Fraud simulation flag
    is_simulated = db.Column(db.Boolean, default=False)
    simulation_type = db.Column(db.String(50), nullable=True)
    
    def __repr__(self):
        return f"<Transaction {self.id} - {self.sender_id} to {self.receiver_id} - ${self.amount}>"
    
    def to_dict(self):
        """Convert transaction to dictionary"""
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'amount': self.amount,
            'timestamp': self.timestamp.isoformat(),
            'txn_metadata': json.loads(self.txn_metadata) if self.txn_metadata else {},
            'risk_score': self.risk_score,
            'status': self.status,
            'processed': self.processed,
            'graph_temporal_score': self.graph_temporal_score,
            'content_analysis_score': self.content_analysis_score,
            'is_simulated': self.is_simulated,
            'simulation_type': self.simulation_type
        }
    
    def set_risk_details(self, details_dict):
        """Store risk details as JSON string"""
        self.risk_details = json.dumps(details_dict)
    
    def get_risk_details(self):
        """Retrieve risk details as dictionary"""
        return json.loads(self.risk_details) if self.risk_details else {}