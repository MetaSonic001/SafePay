import os
import logging
import time
from app.rabbitmq.consumer import start_consumer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == '__main__':
    # Wait for RabbitMQ to be ready
    time.sleep(10)  # Simple delay to ensure RabbitMQ container is ready
    
    logging.info("Starting UPI Fraud Detection worker...")
    
    # Start the RabbitMQ consumer
    start_consumer()