import pika
import json
import logging
import os
import time
from app import create_app, db
from app.models.transaction import Transaction
from app.algorithm.input_processor import process_transaction_input
from app.algorithm.graph_temporal import GraphTemporalAnalyzer
from app.algorithm.content_analyzer import ContentAnalyzer
from app.algorithm.risk_engine import RiskEngine

def process_transaction(transaction_id):
    """
    Process a transaction through the fraud detection pipeline.
    
    Args:
        transaction_id (str): The ID of the transaction to process
    """
    app = create_app()
    with app.app_context():
        try:
            # Retrieve transaction from database
            transaction = Transaction.query.get(transaction_id)
            if not transaction:
                logging.error(f"Transaction {transaction_id} not found in database")
                return
            
            logging.info(f"Processing transaction {transaction_id}")
            
            # Step 1: Process input
            user_data, transaction_data = process_transaction_input(transaction)
            
            # Step 2: Run graph-temporal analysis
            graph_temporal = GraphTemporalAnalyzer()
            graph_temporal_score, graph_temporal_details = graph_temporal.analyze(
                transaction.sender_id, 
                transaction.receiver_id, 
                transaction.amount,
                transaction.timestamp
            )
            
            # Step 3: Run content analysis (phishing/QR code detection)
            content_analyzer = ContentAnalyzer()
            content_analysis_score, content_analysis_details = content_analyzer.analyze(transaction_data)
            
            # Step 4: Run risk engine for final decision
            risk_engine = RiskEngine()
            risk_score, decision, risk_details = risk_engine.calculate_risk(
                graph_temporal_score, 
                content_analysis_score,
                transaction_data,
                graph_temporal_details,
                content_analysis_details
            )
            
            # Update transaction with results
            transaction.graph_temporal_score = graph_temporal_score
            transaction.content_analysis_score = content_analysis_score
            transaction.risk_score = risk_score
            transaction.status = decision
            transaction.processed = True
            transaction.set_risk_details(risk_details)
            
            # Save to database
            db.session.commit()
            
            logging.info(f"Transaction {transaction_id} processed successfully. Risk score: {risk_score}, Decision: {decision}")
            
        except Exception as e:
            logging.error(f"Error processing transaction {transaction_id}: {str(e)}")
            db.session.rollback()

def start_consumer():
    """
    Start the RabbitMQ consumer to process transactions.
    """
    # Number of connection attempts
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # RabbitMQ connection parameters
            host = os.getenv('RABBITMQ_HOST', 'localhost') 
            port = int(os.getenv('RABBITMQ_PORT', 5672))
            user = os.getenv('RABBITMQ_USER', 'admin')
            password = os.getenv('RABBITMQ_PASS', 'admin_password')
            
            # Create connection
            credentials = pika.PlainCredentials(user, password)
            parameters = pika.ConnectionParameters(
                host=host,
                port=port,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            
            # Declare queue
            queue_name = os.getenv('TRANSACTION_QUEUE', 'transactions_queue')
            channel.queue_declare(queue=queue_name, durable=True)
            
            # Set prefetch count to limit number of unacknowledged messages
            channel.basic_qos(prefetch_count=1)
            
            # Define callback function for incoming messages
            def callback(ch, method, properties, body):
                try:
                    # Parse message
                    message = json.loads(body)
                    transaction_id = message.get('transaction_id')
                    
                    if transaction_id:
                        # Process the transaction
                        process_transaction(transaction_id)
                        
                    # Acknowledge the message
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                    
                except Exception as e:
                    logging.error(f"Error in consumer callback: {str(e)}")
                    # Reject the message and requeue it
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            
            # Set up consumer
            channel.basic_consume(queue=queue_name, on_message_callback=callback)
            
            logging.info(f"Consumer started. Waiting for messages on queue: {queue_name}")
            channel.start_consuming()
            
        except pika.exceptions.AMQPConnectionError as e:
            retry_count += 1
            wait_time = 5 * retry_count  # Exponential backoff
            logging.error(f"Connection to RabbitMQ failed (attempt {retry_count}/{max_retries}). Retrying in {wait_time} seconds...")
            time.sleep(wait_time)
            
        except Exception as e:
            logging.error(f"Unexpected error in consumer: {str(e)}")
            retry_count += 1
            time.sleep(5)
    
    logging.critical("Failed to connect to RabbitMQ after maximum retry attempts")