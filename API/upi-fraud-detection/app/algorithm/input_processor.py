import json
import logging
from app import db
from app.models.transaction import Transaction

def process_transaction_input(transaction):
    """
    Process transaction input, load user history, and prepare data for algorithm.
    
    Args:
        transaction (Transaction): The transaction object to process
        
    Returns:
        tuple: (user_data, transaction_data) prepared for algorithm processing
    """
    try:
        # Extract txn_metadata
        txn_metadata = json.loads(transaction.txn_metadata) if transaction.txn_metadata else {}
        
        # Load user history for sender
        sender_history = Transaction.query.filter_by(
            sender_id=transaction.sender_id
        ).order_by(Transaction.timestamp.desc()).limit(20).all()
        
        # Check if this is a new account with limited history
        is_new_account = len(sender_history) < 5  # Consider as new if < 5 transactions
        
        # Get transaction patterns
        sent_amounts = [tx.amount for tx in sender_history]
        avg_amount = sum(sent_amounts) / len(sent_amounts) if sent_amounts else 0
        max_amount = max(sent_amounts) if sent_amounts else 0
        
        # Recent receivers
        recent_receivers = [tx.receiver_id for tx in sender_history]
        
        # Load receiver history
        receiver_history = Transaction.query.filter_by(
            receiver_id=transaction.receiver_id
        ).order_by(Transaction.timestamp.desc()).limit(20).all()
        
        # Check if receiver is a new account
        is_receiver_new = len(receiver_history) < 5
        
        # Prepare user data dictionary
        user_data = {
            'sender': {
                'id': transaction.sender_id,
                'transaction_history': [tx.to_dict() for tx in sender_history],
                'is_new_account': is_new_account,
                'avg_transaction_amount': avg_amount,
                'max_transaction_amount': max_amount,
                'recent_receivers': recent_receivers
            },
            'receiver': {
                'id': transaction.receiver_id,
                'transaction_history': [tx.to_dict() for tx in receiver_history],
                'is_new_account': is_receiver_new
            }
        }
        
        # Prepare transaction data dictionary
        transaction_data = {
            'transaction_id': transaction.id,
            'sender_id': transaction.sender_id,
            'receiver_id': transaction.receiver_id,
            'amount': transaction.amount,
            'timestamp': transaction.timestamp,
            'txn_metadata': txn_metadata,
            'is_simulated': transaction.is_simulated,
            'simulation_type': transaction.simulation_type
        }
        
        return user_data, transaction_data
        
    except Exception as e:
        logging.error(f"Error processing transaction input: {str(e)}")
        raise