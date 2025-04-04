import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://neondb_owner:npg_cAi0PbZL1lxd@ep-crimson-scene-a1imjgk5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # RabbitMQ Configuration
    RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
    RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
    RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'admin')
    RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'admin_password')
    RABBITMQ_VHOST = os.getenv('RABBITMQ_VHOST', '/')
    
    # Queue names
    TRANSACTION_QUEUE = 'transactions_queue'
    
    # Algorithm Configuration
    GRAPH_TEMPORAL_WEIGHT = 0.6  # Weight for graph-temporal analysis in final score
    CONTENT_ANALYSIS_WEIGHT = 0.4  # Weight for phishing/QR analysis in final score
    
    # Risk thresholds
    LOW_RISK_THRESHOLD = 0.3
    MEDIUM_RISK_THRESHOLD = 0.7
    HIGH_RISK_THRESHOLD = 0.9
    
    # New account handling
    NEW_ACCOUNT_DEFAULT_RISK = 0.5
    NEW_ACCOUNT_HISTORY_THRESHOLD = 5  # Number of transactions to consider an account as "new"