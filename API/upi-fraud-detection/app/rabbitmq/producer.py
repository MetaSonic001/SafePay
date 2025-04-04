import pika
import json
import logging
from flask import current_app
import os

def get_rabbitmq_connection():
    """
    Create and return a connection to RabbitMQ.
    """
    # Get configuration from environment or use default
    host = os.getenv('RABBITMQ_HOST', 'localhost') 
    port = int(os.getenv('RABBITMQ_PORT', 5672))
    user = os.getenv('RABBITMQ_USER', 'admin')
    password = os.getenv('RABBITMQ_PASS', 'admin_password')
    
    # Set up credentials and parameters
    credentials = pika.PlainCredentials(user, password)
    parameters = pika.ConnectionParameters(
        host=host,
        port=port,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300
    )
    
    # Create and return the connection
    connection = pika.BlockingConnection(parameters)
    return connection

def publish_transaction(transaction_id):
    """
    Publish a transaction ID to the RabbitMQ queue for processing.
    
    Args:
        transaction_id (str): The ID of the transaction to be processed
    """
    try:
        # Get a connection and channel
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Declare the queue (creates if it doesn't exist)
        queue_name = os.getenv('TRANSACTION_QUEUE', 'transactions_queue')
        channel.queue_declare(queue=queue_name, durable=True)
        
        # Prepare message
        message = {
            'transaction_id': transaction_id
        }
        
        # Publish the message
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
                content_type='application/json'
            )
        )
        
        logging.info(f"Transaction {transaction_id} published to RabbitMQ queue")
        
        # Close the connection
        connection.close()
        
    except Exception as e:
        logging.error(f"Error publishing transaction to RabbitMQ: {str(e)}")
        raise