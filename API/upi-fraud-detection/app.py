from flask import Flask, request, jsonify
import threading
import time
import uuid
import logging

# Import the fixed risk engine
from app.algorithm.risk_engine_copy import RiskEngine

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# In-memory store for transaction status (replace with a proper database in production)
transaction_store = {}

def process_in_background(transaction_id, data):
    with app.app_context():
        try:
            # Simulate some processing time
            time.sleep(2)
            
            # Calculate risk
            graph_temporal_score = 0.2  # Placeholder
            content_analysis_score = 0.3  # Placeholder
            graph_temporal_details = {'example': 'graph_data'}
            content_analysis_details = {'example': 'content_data'}
            
            # Create a risk_engine instance
            risk_engine = RiskEngine()
            
            # Call calculate_risk as a method on the instance
            risk_score, decision, risk_details = risk_engine.calculate_risk(
                graph_temporal_score,
                content_analysis_score,
                data
            )
            
            # Update transaction store
            transaction_store[transaction_id]['result'] = {
                'transaction_id': transaction_id,
                'risk_score': risk_score,
                'decision': decision,
                'risk_details': risk_details,
                'processed': True
            }
            transaction_store[transaction_id]['processed'] = True
            
            logging.info(f"Transaction {transaction_id} processed with score {risk_score}, decision {decision}")
            
        except Exception as e:
            logging.error(f"Error in background processing: {str(e)}")
            # Update transaction with error
            transaction_store[transaction_id]['result'] = {
                'transaction_id': transaction_id,
                'error': str(e),
                'status': 'failed',
                'risk_score': 0.5,  # Default risk score
                'decision': 'review'  # Default to manual review on error
            }
            transaction_store[transaction_id]['processed'] = True

@app.route('/transaction', methods=['POST'])
def process_transaction():
    """Handle incoming transaction requests"""
    data = request.get_json()
    
    # Log the request
    logging.info(f"Received transaction request: {data}")
    
    # Generate a unique transaction ID
    transaction_id = str(uuid.uuid4())
    
    # Store initial transaction data
    transaction_store[transaction_id] = {
        'data': data,
        'processed': False,
        'result': None
    }
    
    # Start background processing
    threading.Thread(target=process_in_background, args=(transaction_id, data)).start()
    
    return jsonify({'transaction_id': transaction_id})

@app.route('/api/transaction/<transaction_id>', methods=['GET'])
def get_transaction_api(transaction_id):
    """API endpoint for getting transaction status - matches NextJS route"""
    return get_transaction_status(transaction_id)

@app.route('/transaction/<transaction_id>', methods=['GET'])
def get_transaction_status(transaction_id):
    """Poll for transaction status"""
    if transaction_id not in transaction_store:
        return jsonify({'error': 'Transaction not found'}), 404
    
    transaction = transaction_store[transaction_id]
    if transaction['processed']:
        return jsonify({
            'transaction_id': transaction_id,
            'status': transaction['result'].get('decision', 'unknown'),
            'processed': True,
            'result': transaction['result']
        })
    else:
        return jsonify({
            'transaction_id': transaction_id,
            'status': 'processing',
            'processed': False
        }), 202

@app.route('/simulate-fraud', methods=['POST'])
def simulate_fraud():
    """Handle simulated fraud requests"""
    data = request.get_json()
    
    # Log the fraud simulation request
    logging.info(f"Received fraud simulation request: {data}")
    
    # Add simulation flags
    data['is_simulated'] = True
    data['simulation_type'] = data.get('fraud_type', 'generic')
    
    # Generate a unique transaction ID
    transaction_id = str(uuid.uuid4())
    
    # Store initial transaction data
    transaction_store[transaction_id] = {
        'data': data,
        'processed': False,
        'result': None
    }
    
    # Start background processing with simulation data
    threading.Thread(target=process_in_background, args=(transaction_id, data)).start()
    
    return jsonify({'transaction_id': transaction_id})

@app.route('/api/risk-details/<transaction_id>', methods=['GET'])
def get_risk_details(transaction_id):
    """Get detailed risk information for a transaction"""
    if transaction_id not in transaction_store:
        return jsonify({'error': 'Transaction not found'}), 404
    
    transaction = transaction_store[transaction_id]
    if not transaction['processed']:
        return jsonify({'error': 'Transaction still processing'}), 202
    
    if 'result' not in transaction or not transaction['result']:
        return jsonify({'error': 'Transaction has no results'}), 404
    
    # Return the risk details
    return jsonify({
        'transaction_id': transaction_id,
        'risk_details': transaction['result'].get('risk_details', {}),
        'risk_score': transaction['result'].get('risk_score', 0),
        'decision': transaction['result'].get('decision', 'unknown')
    })

@app.route('/api/system-stats', methods=['GET'])
def get_system_stats():
    """Get system statistics"""
    # Count transactions by status
    approved = 0
    declined = 0
    review = 0
    
    for tx_id, tx_data in transaction_store.items():
        if tx_data['processed'] and 'result' in tx_data and tx_data['result']:
            decision = tx_data['result'].get('decision')
            if decision == 'approve':
                approved += 1
            elif decision == 'decline':
                declined += 1
            elif decision == 'review':
                review += 1
    
    return jsonify({
        'transactions': {
            'total': len(transaction_store),
            'approved': approved,
            'declined': declined,
            'review': review
        },
        'uptime': '24h',
        'system_status': 'operational'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)