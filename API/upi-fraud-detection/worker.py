import os
import logging
import time
from app.rabbitmq.consumer import start_consumer

import threading
import time
from app.algorithm.rule_updater import RuleUpdater

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def update_rules_periodically():
    """Run rule updates every 24 hours"""
    updater = RuleUpdater()
    
    while True:
        try:
            logging.info("Updating rule thresholds...")
            updater.update_thresholds()
            logging.info("Rule update completed, sleeping for 24 hours")
            
            # Sleep for 24 hours
            time.sleep(24 * 60 * 60)
            
        except Exception as e:
            logging.error(f"Error in rule updater: {str(e)}")
            # Sleep for 1 hour before retrying on error
            time.sleep(60 * 60)

# Start the rule updater in a separate thread
def start_rule_updater():
    thread = threading.Thread(target=update_rules_periodically, daemon=True)
    thread.start()
    logging.info("Rule updater thread started")

if __name__ == '__main__':
    # Wait for RabbitMQ to be ready
    time.sleep(10)  # Simple delay to ensure RabbitMQ container is ready
    
    logging.info("Starting UPI Fraud Detection worker...")
    
    start_rule_updater()
    
    # Start the RabbitMQ consumer
    start_consumer()