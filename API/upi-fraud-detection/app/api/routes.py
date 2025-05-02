from flask import Blueprint, request, jsonify
import uuid
import json
from app import db
from app.models.transaction import Transaction
from app.rabbitmq.producer import publish_transaction
from datetime import datetime

api_bp = Blueprint('api', __name__)

@api_bp.route('/transaction', methods=['POST'])
def process_transaction():
    """
    Endpoint to receive transaction data, store it in the database, 
    and publish it to RabbitMQ for asynchronous processing.
    """
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Required fields
        required_fields = ['sender_id', 'receiver_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Generate unique transaction ID
        transaction_id = str(uuid.uuid4())
        
        # Extract txn_metadata if provided
        txn_metadata = data.get('txn_metadata', {})
        txn_metadata_json = json.dumps(txn_metadata) if txn_metadata else None
        
        # Create transaction record
        transaction = Transaction(
            id=transaction_id,
            sender_id=data['sender_id'],
            receiver_id=data['receiver_id'],
            amount=float(data['amount']),
            timestamp=datetime.fromisoformat(data.get('timestamp', datetime.utcnow().isoformat())),
            txn_metadata=txn_metadata_json,
            status='pending',
            processed=False
        )
        
        # Save to database
        db.session.add(transaction)
        db.session.commit()
        
        # Publish to RabbitMQ for processing
        publish_transaction(transaction_id)
        
        return jsonify({
            'transaction_id': transaction_id,
            'status': 'pending',
            'message': 'Transaction received and queued for processing'
        }), 202
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/simulate-fraud', methods=['POST'])
def simulate_fraud():
    """
    Endpoint to simulate different fraud scenarios for demonstration purposes.
    """
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Required fields
        required_fields = ['fraud_type', 'sender_id', 'receiver_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        fraud_type = data['fraud_type']
        transaction_id = str(uuid.uuid4())
        
        # Set up txn_metadata based on fraud type
        txn_metadata = {}
        
        if fraud_type == 'high_value':
            # Simulate abnormally high transaction
            amount = float(data['amount']) * 100  # Make it 100x bigger
        else:
            amount = float(data['amount'])
            
        if fraud_type == 'phishing_url':
            # Simulate phishing URL in payment
            txn_metadata = {
                'payment_url': 'http://legitbank-secure.fishy-domain.com/payment',
                'user_agent': 'Mozilla/5.0',
                'ip_address': '192.168.1.100'
            }
            
        elif fraud_type == 'qr_code_tampering':
            # Simulate QR code tampering
            txn_metadata = {
                'qr_code_payload': {
                    'original_receiver': data['receiver_id'],
                    'tampered_receiver': 'hacker_account_123',
                    'tampering_confidence': 0.92
                },
                'device_info': 'Android 12'
            }
            
        elif fraud_type == 'network_fraud':
            # Simulate network-based fraud (unusual connections)
            txn_metadata = {
                'recent_receivers': ['acc_9472', 'acc_3782', 'acc_5432', 'suspicious_acc_8843'],
                'network_anomaly': 'unusual_connection_chain'
            }
            
        # Create transaction record with simulation flags
        transaction = Transaction(
            id=transaction_id,
            sender_id=data['sender_id'],
            receiver_id=data['receiver_id'],
            amount=amount,
            timestamp=datetime.fromisoformat(data.get('timestamp', datetime.utcnow().isoformat())),
            txn_metadata=json.dumps(txn_metadata),
            status='pending',
            processed=False,
            is_simulated=True,
            simulation_type=fraud_type
        )
        
        # Save to database
        db.session.add(transaction)
        db.session.commit()
        
        # Publish to RabbitMQ for processing
        publish_transaction(transaction_id)
        
        return jsonify({
            'transaction_id': transaction_id,
            'status': 'pending',
            'message': f'Simulated {fraud_type} scenario queued for processing',
            'fraud_type': fraud_type
        }), 202
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/transaction/<transaction_id>', methods=['GET'])
def get_transaction_status(transaction_id):
    """
    Get the current status and details of a transaction.
    """
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
            
        result = transaction.to_dict()
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/risk-details/<transaction_id>', methods=['GET'])
def get_risk_details(transaction_id):
    """
    Get detailed risk analysis results for a transaction.
    """
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
            
        if not transaction.processed:
            return jsonify({
                'transaction_id': transaction_id,
                'status': 'pending',
                'message': 'Transaction is still being processed'
            }), 202
            
        # Get the risk details
        risk_details = transaction.get_risk_details()
        
        response = {
            'transaction_id': transaction_id,
            'risk_score': transaction.risk_score,
            'status': transaction.status,
            'risk_details': risk_details,
            'graph_temporal_score': transaction.graph_temporal_score,
            'content_analysis_score': transaction.content_analysis_score
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/recent-transactions', methods=['GET'])
def get_recent_transactions():
    """
    Get recent transactions for display in the dashboard.
    """
    try:
        limit = int(request.args.get('limit', 10))
        transactions = Transaction.query.order_by(Transaction.timestamp.desc()).limit(limit).all()
        
        result = {
            'transactions': [transaction.to_dict() for transaction in transactions]
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api_bp.route('/risk-details/<transaction_id>', methods=['GET'])
def get_risk_details(transaction_id):
    """
    Get detailed risk analysis results for a transaction.
    """
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
            
        if not transaction.processed:
            return jsonify({
                'transaction_id': transaction_id,
                'status': 'pending',
                'message': 'Transaction is still being processed'
            }), 202
            
        # Get the risk details
        risk_details = transaction.get_risk_details()
        
        # Add XAI elements - explanation for the decision
        explanation = generate_explanation(transaction, risk_details)
        
        response = {
            'transaction_id': transaction_id,
            'risk_score': transaction.risk_score,
            'status': transaction.status,
            'risk_details': risk_details,
            'graph_temporal_score': transaction.graph_temporal_score,
            'content_analysis_score': transaction.content_analysis_score,
            'explanation': explanation
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_explanation(transaction, risk_details):
    """Generate human-readable explanation for the risk assessment"""
    explanation = {
        'summary': '',
        'key_factors': [],
        'recommendations': []
    }
    
    # Generate summary based on status
    if transaction.status == 'approved':
        explanation['summary'] = 'This transaction was approved as it showed low risk characteristics.'
    elif transaction.status == 'pending_verification':
        explanation['summary'] = 'This transaction requires additional verification due to moderate risk factors.'
    elif transaction.status == 'blocked':
        explanation['summary'] = 'This transaction was blocked due to high risk of fraud.'
    
    # Extract key factors that contributed to the decision
    factors = []
    
    # Content analysis factors
    content = risk_details.get('content_analysis', {})
    content_details = content.get('details', {})
    
    if content.get('score', 0) > 0.5:
        if content_details.get('url_analysis', {}).get('suspicious_domain'):
            factors.append('Suspicious URL detected')
        if content_details.get('qr_analysis', {}).get('tampering_detected'):
            factors.append('QR code tampering detected')
    
    # Graph-temporal factors
    graph_temporal = risk_details.get('graph_temporal', {})
    temporal_details = graph_temporal.get('details', {}).get('temporal_analysis', {})
    graph_details = graph_temporal.get('details', {}).get('graph_analysis', {})
    
    if temporal_details.get('amount_anomaly', 0) > 0.7:
        factors.append('Unusually high transaction amount')
    
    if temporal_details.get('frequency_anomaly', 0) > 0.7:
        factors.append('Unusual transaction frequency')
    
    if temporal_details.get('time_window_anomaly', 0) > 0.5:
        factors.append(f'Unusual transaction time (Hour: {temporal_details.get("hour_of_day")})')
    
    if graph_details.get('is_first_transaction') and graph_details.get('network_distance', -1) == -1:
        factors.append('First-time transaction to an unconnected recipient')
    
    if graph_details.get('fraud_connections', 0) > 0:
        factors.append('Recipient connected to previously flagged accounts')
    
    # Dynamic adjustments
    dynamic_adj = risk_details.get('dynamic_adjustments', {})
    if dynamic_adj.get('amount_beyond_percentile95'):
        factors.append('Amount significantly higher than user\'s typical transactions')
    
    if dynamic_adj.get('velocity_factor'):
        factors.append('Unusually high transaction frequency for this user')
    
    if dynamic_adj.get('trending_fraud_pattern'):
        factors.append('Pattern matches recent fraud trends')
    
    # Add recommendations based on status
    if transaction.status == 'pending_verification':
        explanation['recommendations'] = [
            'Verify transaction through secondary authentication',
            'Contact the user through registered phone number',
            'Consider stepping up authentication for future transactions'
        ]
    elif transaction.status == 'blocked':
        explanation['recommendations'] = [
            'Alert the user about the blocked transaction',
            'Suggest alternative payment methods',
            'Review account for other suspicious activities'
        ]
    
    explanation['key_factors'] = factors
    
    return explanation

@api_bp.route('/system-stats', methods=['GET'])
def get_system_stats():
    """
    Get system statistics and current rule thresholds.
    """
    try:
        # Get current thresholds
        from app.algorithm.rule_updater import RuleUpdater
        thresholds = RuleUpdater.load_current_thresholds()
        
        # Get overall system stats
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # Last 24 hours statistics
        last_24h = datetime.utcnow() - timedelta(hours=24)
        
        total_txns_24h = Transaction.query.filter(
            Transaction.timestamp >= last_24h
        ).count()
        
        blocked_txns_24h = Transaction.query.filter(
            Transaction.timestamp >= last_24h,
            Transaction.status == 'blocked'
        ).count()
        
        pending_txns_24h = Transaction.query.filter(
            Transaction.timestamp >= last_24h,
            Transaction.status == 'pending_verification'
        ).count()
        
        # Fraud rate
        fraud_rate = (blocked_txns_24h / total_txns_24h) * 100 if total_txns_24h > 0 else 0
        
        # Transaction volume
        volume_24h = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.timestamp >= last_24h
        ).scalar() or 0
        
        response = {
            'system_stats': {
                'transactions_24h': total_txns_24h,
                'blocked_24h': blocked_txns_24h,
                'pending_verification_24h': pending_txns_24h,
                'fraud_rate_percentage': round(fraud_rate, 2),
                'transaction_volume_24h': round(float(volume_24h), 2),
                'last_threshold_update': thresholds.get('last_updated', 'Never')
            },
            'current_thresholds': thresholds
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logging.error(f"Error fetching system stats: {str(e)}")
        return jsonify({'error': str(e)}), 500