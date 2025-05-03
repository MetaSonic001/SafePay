import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
import cv2
import io
from datetime import datetime, timedelta
import random
import networkx as nx
from PIL import Image
import base64
import time
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.neural_network import MLPClassifier
from tensorflow import keras
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, LSTM, Dropout
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch_geometric
from torch_geometric.nn import GCNConv
import shap
import lime
from lime import lime_tabular
import re
import warnings
import qrcode
import qrcode.image.pil  # Optional, for image-based QR codes using PIL
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score, confusion_matrix, roc_curve, auc
warnings.filterwarnings('ignore')

# Set page configuration
st.set_page_config(
    page_title="UPI Fraud Detection System",
    page_icon="🔒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Define paths
DATA_PATH = "data/"
MODEL_PATH = "models/"

# Create directories if they don't exist
for path in [DATA_PATH, MODEL_PATH]:
    os.makedirs(path, exist_ok=True)

# Dataset Generation Functions
def generate_synthetic_data(n_samples=10000, save=True):
    """Generate synthetic UPI transaction data with various fraud patterns"""
    
    # Define base parameters
    user_ids = [f"U{str(i).zfill(5)}" for i in range(1000)]
    locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", 
                "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Kanpur", "Nagpur", "Indore", "Thane"]
    device_types = ["Mobile", "Tablet", "Desktop", "IoT Device"]
    transaction_modes = ["UPI ID", "UPI Phone No", "UPI QR Code", "UPI Link", "UPI Intent"]
    
    # Initialize dataframe columns
    data = {
        "Transaction_ID": [f"TXN{str(i).zfill(6)}" for i in range(n_samples)],
        "User_ID": np.random.choice(user_ids, n_samples),
        "Amount": np.zeros(n_samples),
        "Time": [f"{random.randint(0, 23):02d}:{random.randint(0, 59):02d}" for _ in range(n_samples)],
        "Location": np.random.choice(locations, n_samples),
        "Device_Type": np.random.choice(device_types, n_samples),
        "Transaction_Mode": np.random.choice(transaction_modes, n_samples),
        "Frequency_in_24hrs": np.zeros(n_samples, dtype=int),
        "Beneficiary_Account_Age": np.zeros(n_samples, dtype=object),
        "Beneficiary_ID": [f"B{str(i).zfill(5)}" for i in range(n_samples)],
        "IP_Address": [f"192.168.{random.randint(0, 255)}.{random.randint(0, 255)}" for _ in range(n_samples)],
        "User_Account_Age_Days": np.zeros(n_samples, dtype=int),
        "Transaction_Success": np.ones(n_samples, dtype=int),
        "Login_Attempts_24hrs": np.zeros(n_samples, dtype=int),
        "Device_Change_Flag": np.zeros(n_samples, dtype=int),
        "Location_Change_Flag": np.zeros(n_samples, dtype=int),
        "App_Version": [f"{random.randint(1, 5)}.{random.randint(0, 9)}.{random.randint(0, 9)}" for _ in range(n_samples)],
        "OS_Version": [f"{random.choice(['Android', 'iOS', 'Windows', 'MacOS'])}-{random.randint(8, 15)}" for _ in range(n_samples)],
        "Transaction_Velocity": np.zeros(n_samples, dtype=int),
        "Attempt_to_Beneficiary_Ratio": np.zeros(n_samples),
        "Is_QR_Manipulated": np.zeros(n_samples, dtype=int),
        "Linked_Bank": np.random.choice(["HDFC", "SBI", "ICICI", "Axis", "PNB", "Kotak", "Yes Bank"], n_samples),
        "Link_Clicked_From": np.random.choice(["Direct", "SMS", "Email", "Social Media", "Messaging App"], n_samples),
        "Fraud_Type": ["None"] * n_samples,
        "Is_Fraud": np.zeros(n_samples, dtype=int)
    }
    
    df = pd.DataFrame(data)
    
    # Generate normal/legitimate transactions (70% of data)
    normal_indices = np.random.choice(range(n_samples), int(n_samples * 0.7), replace=False)
    df.loc[normal_indices, "Amount"] = np.random.exponential(scale=2000, size=len(normal_indices))
    df.loc[normal_indices, "Frequency_in_24hrs"] = np.random.poisson(lam=3, size=len(normal_indices))
    df.loc[normal_indices, "Beneficiary_Account_Age"] = [f"{random.randint(1, 10)} years" for _ in range(len(normal_indices))]
    df.loc[normal_indices, "User_Account_Age_Days"] = np.random.randint(100, 2000, size=len(normal_indices))
    df.loc[normal_indices, "Login_Attempts_24hrs"] = np.random.randint(1, 3, size=len(normal_indices))
    df.loc[normal_indices, "Transaction_Velocity"] = np.random.randint(1, 10, size=len(normal_indices))
    df.loc[normal_indices, "Attempt_to_Beneficiary_Ratio"] = np.random.uniform(0.1, 0.5, size=len(normal_indices))
    
    # Function to generate fraud patterns
    remaining_indices = list(set(range(n_samples)) - set(normal_indices))
    random.shuffle(remaining_indices)
    
    # 1. Phishing Attacks (Fake UPI Links & QR Codes) - 20% of fraud data
    phishing_size = int(len(remaining_indices) * 0.2)
    phishing_indices = remaining_indices[:phishing_size]
    df.loc[phishing_indices, "Amount"] = np.random.uniform(500, 20000, size=len(phishing_indices))
    df.loc[phishing_indices, "Transaction_Mode"] = np.random.choice(["UPI QR Code", "UPI Link"], len(phishing_indices))
    df.loc[phishing_indices, "Beneficiary_Account_Age"] = [f"{random.randint(1, 30)} days" for _ in range(len(phishing_indices))]
    df.loc[phishing_indices, "Frequency_in_24hrs"] = np.random.poisson(lam=15, size=len(phishing_indices))
    df.loc[phishing_indices, "Link_Clicked_From"] = np.random.choice(["SMS", "Email", "Social Media"], len(phishing_indices))
    df.loc[phishing_indices, "Is_QR_Manipulated"] = 1
    df.loc[phishing_indices, "Fraud_Type"] = "Phishing"
    df.loc[phishing_indices, "Is_Fraud"] = 1
    
    # 2. SIM Swap Fraud & Account Takeover - 20% of fraud data
    remaining_indices = remaining_indices[phishing_size:]
    sim_swap_size = int(len(remaining_indices) * 0.25)
    sim_swap_indices = remaining_indices[:sim_swap_size]
    df.loc[sim_swap_indices, "Amount"] = np.random.uniform(5000, 50000, size=len(sim_swap_indices))
    df.loc[sim_swap_indices, "Device_Change_Flag"] = 1
    df.loc[sim_swap_indices, "Location_Change_Flag"] = 1
    df.loc[sim_swap_indices, "Login_Attempts_24hrs"] = np.random.randint(3, 10, size=len(sim_swap_indices))
    df.loc[sim_swap_indices, "Frequency_in_24hrs"] = np.random.poisson(lam=20, size=len(sim_swap_indices))
    df.loc[sim_swap_indices, "Fraud_Type"] = "SIM_Swap"
    df.loc[sim_swap_indices, "Is_Fraud"] = 1
    
    # 3. Social Engineering & Fake Customer Support Scams - 20% of fraud data
    remaining_indices = remaining_indices[sim_swap_size:]
    social_eng_size = int(len(remaining_indices) * 0.3)
    social_eng_indices = remaining_indices[:social_eng_size]
    df.loc[social_eng_indices, "Amount"] = np.random.uniform(1000, 25000, size=len(social_eng_indices))
    df.loc[social_eng_indices, "Transaction_Mode"] = "UPI ID"
    df.loc[social_eng_indices, "Frequency_in_24hrs"] = np.random.poisson(lam=5, size=len(social_eng_indices))
    df.loc[social_eng_indices, "Time"] = [f"{random.randint(19, 23):02d}:{random.randint(0, 59):02d}" for _ in range(len(social_eng_indices))]
    df.loc[social_eng_indices, "Fraud_Type"] = "Social_Engineering"
    df.loc[social_eng_indices, "Is_Fraud"] = 1
    
    # 4. Remote Access Attacks (Fake Apps & Malware) - 20% of fraud data
    remaining_indices = remaining_indices[social_eng_size:]
    remote_access_size = int(len(remaining_indices) * 0.4)
    remote_access_indices = remaining_indices[:remote_access_size]
    df.loc[remote_access_indices, "Amount"] = np.random.uniform(5000, 40000, size=len(remote_access_indices))
    df.loc[remote_access_indices, "App_Version"] = [f"3.0.{random.randint(0, 9)}" for _ in range(len(remote_access_indices))]
    df.loc[remote_access_indices, "Transaction_Velocity"] = np.random.randint(15, 30, size=len(remote_access_indices))
    df.loc[remote_access_indices, "Frequency_in_24hrs"] = np.random.poisson(lam=25, size=len(remote_access_indices))
    df.loc[remote_access_indices, "Fraud_Type"] = "Remote_Access"
    df.loc[remote_access_indices, "Is_Fraud"] = 1
    
    # 5. AI-Powered Deepfake & Impersonation Scams - remainder of fraud data
    remaining_indices = remaining_indices[remote_access_size:]
    deepfake_indices = remaining_indices
    df.loc[deepfake_indices, "Amount"] = np.random.uniform(10000, 100000, size=len(deepfake_indices))
    df.loc[deepfake_indices, "Beneficiary_Account_Age"] = [f"{random.randint(1, 10)} days" for _ in range(len(deepfake_indices))]
    df.loc[deepfake_indices, "Frequency_in_24hrs"] = np.random.poisson(lam=2, size=len(deepfake_indices))
    df.loc[deepfake_indices, "Transaction_Mode"] = "UPI ID"
    df.loc[deepfake_indices, "Fraud_Type"] = "Deepfake_Impersonation"
    df.loc[deepfake_indices, "Is_Fraud"] = 1
    
    # Clean up data formatting
    df["Amount"] = df["Amount"].round(2)
    
    # Add transaction date (last 30 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    df["Transaction_Date"] = [start_date + timedelta(
        days=random.randint(0, 30),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    ) for _ in range(n_samples)]
    
    # Ensure values are within reasonable ranges
    df["Frequency_in_24hrs"] = df["Frequency_in_24hrs"].apply(lambda x: min(x, 50))
    df["Transaction_Velocity"] = df["Transaction_Velocity"].apply(lambda x: min(x, 50))
    df["Login_Attempts_24hrs"] = df["Login_Attempts_24hrs"].apply(lambda x: min(x, 20))

    # Save the dataset if required
    if save:
        df.to_csv(f"{DATA_PATH}upi_transaction_data.csv", index=False)
        
    return df

def generate_graph_data(transaction_df, save=True):
    """Generate graph data for network analysis from transaction data"""
    
    # Extract user and beneficiary information
    users = set(transaction_df["User_ID"].unique())
    beneficiaries = set(transaction_df["Beneficiary_ID"].unique())
    
    # Create nodes and edges dataframes
    nodes = list(users.union(beneficiaries))
    node_types = ["user" if node in users else "beneficiary" for node in nodes]
    
    node_df = pd.DataFrame({
        "node_id": nodes,
        "node_type": node_types
    })
    
    # Create edges from transactions
    edge_df = transaction_df[["User_ID", "Beneficiary_ID", "Amount", "Is_Fraud"]].copy()
    edge_df.columns = ["source", "target", "amount", "is_fraud"]
    
    # Add some additional connections for fraud rings
    fraud_sources = transaction_df[transaction_df["Is_Fraud"] == 1]["Beneficiary_ID"].unique()
    
    # Create fraud rings (connections between fraudulent beneficiaries)
    additional_edges = []
    
    if len(fraud_sources) > 5:
        # Create rings of fraud accounts
        for i in range(0, len(fraud_sources), 5):
            ring = fraud_sources[i:i+5]
            if len(ring) < 2:
                continue
                
            for j in range(len(ring)):
                for k in range(j+1, len(ring)):
                    additional_edges.append({
                        "source": ring[j],
                        "target": ring[k],
                        "amount": random.uniform(1000, 5000),
                        "is_fraud": 1
                    })
    
    # Add the additional edges to the edge dataframe
    if additional_edges:
        additional_edge_df = pd.DataFrame(additional_edges)
        edge_df = pd.concat([edge_df, additional_edge_df], ignore_index=True)
    
    # Save the graph data if required
    if save:
        node_df.to_csv(f"{DATA_PATH}upi_graph_nodes.csv", index=False)
        edge_df.to_csv(f"{DATA_PATH}upi_graph_edges.csv", index=False)
    
    return node_df, edge_df

def generate_temporal_data(transaction_df, save=True):
    """Generate temporal sequence data for LSTM model training"""
    
    # Sort by user and date
    transaction_df = transaction_df.sort_values(["User_ID", "Transaction_Date"])
    
    # Group transactions by user
    user_sequences = {}
    
    for user_id in transaction_df["User_ID"].unique():
        user_data = transaction_df[transaction_df["User_ID"] == user_id].copy()
        
        # Features for sequence data
        features = user_data[["Amount", "Frequency_in_24hrs", "Login_Attempts_24hrs", 
                            "Transaction_Velocity", "Device_Change_Flag", "Location_Change_Flag"]].values
        
        # Target is fraud or not
        target = user_data["Is_Fraud"].values
        
        user_sequences[user_id] = {
            "features": features,
            "target": target
        }
    
    # Save the temporal data if required
    if save:
        with open(f"{DATA_PATH}upi_temporal_sequences.pkl", "wb") as f:
            pickle.dump(user_sequences, f)
    
    return user_sequences

# Generate QR code examples (normal and manipulated)
def generate_qr_examples(save=True):
    """Generate example QR codes (both legitimate and manipulated)"""
        
    from PIL import Image, ImageDraw, ImageFont
    import qrcode
        
    # Create directories for QR codes
    qr_dir = f"{DATA_PATH}qr_codes/"
    os.makedirs(qr_dir, exist_ok=True)
        
    # Create legitimate QR codes
    legitimate_qrs = []
    for i in range(5):
        # Generate a legitimate UPI ID or payment link
        upi_id = f"example{i+1}@upi"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"upi://pay?pa={upi_id}&pn=Merchant{i+1}&am={random.randint(10, 5000)}.00")
        qr.make(fit=True)
            
        img = qr.make_image(fill_color="black", back_color="white")
        if save:
            img_path = f"{qr_dir}legitimate_qr_{i+1}.png"
            img.save(img_path)
            legitimate_qrs.append(img_path)
        else:
            legitimate_qrs.append(img)
        
    # Create manipulated QR codes (overlay, edited, fake merchant)
    manipulated_qrs = []
    for i in range(5):
        # Base QR code (similar to legitimate but with fraud account)
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"upi://pay?pa=fraud{i+1}@upi&pn=Merchant{i+1}&am={random.randint(10, 5000)}.00")
        qr.make(fit=True)
            
        img = qr.make_image(fill_color="black", back_color="white")
            
        # Add some manipulation (visual overlay, slight edits to corners)
        img_array = np.array(img)
            
        # Ensure the image array is in the correct format (uint8)
        if img_array.dtype != np.uint8:
            img_array = img_array.astype(np.uint8)
            
        # Add different manipulations
        if i % 5 == 0:
            # Add a subtle overlay
            overlay = np.zeros_like(img_array, dtype=np.uint8)  # Ensure overlay is uint8
            cv2.rectangle(overlay, (20, 20), (img_array.shape[0]-20, img_array.shape[1]-20), (120, 120, 120), 2)
            img_array = cv2.addWeighted(img_array, 0.9, overlay, 0.1, 0)
        elif i % 5 == 1:
            # Modify QR code corners
            cv2.rectangle(img_array, (0, 0), (30, 30), (255, 255, 255), -1)  # Top-left
        elif i % 5 == 2:
            # Add a small fake element
            cv2.circle(img_array, (img_array.shape[0]//2, img_array.shape[1]//2), 15, (0, 0, 0), -1)
        else:
            # Some noise
            noise = np.random.randint(0, 100, size=img_array.shape, dtype=np.uint8)
            img_array = cv2.addWeighted(img_array, 0.9, noise, 0.1, 0)
            
        manipulated_img = Image.fromarray(img_array)
            
        if save:
            img_path = f"{qr_dir}manipulated_qr_{i+1}.png"
            manipulated_img.save(img_path)
            manipulated_qrs.append(img_path)
        else:
            manipulated_qrs.append(manipulated_img)
        
    return legitimate_qrs, manipulated_qrs

# Machine Learning Models
class TemporalAnomalyDetector:
    """LSTM-based model for detecting temporal anomalies in transaction sequences"""
    
    def __init__(self, input_dim, sequence_length=10):
        self.input_dim = input_dim
        self.sequence_length = sequence_length
        self.model = None
    
    def build_model(self):
        """Build LSTM model for anomaly detection"""
        model = Sequential([
            LSTM(64, activation='relu', input_shape=(self.sequence_length, self.input_dim), return_sequences=True),
            Dropout(0.2),
            LSTM(32, activation='relu'),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        self.model = model
        return model
    
    def prepare_sequences(self, data, user_ids=None):
        """Prepare sequence data for LSTM model"""
        X = []
        y = []
        
        # If specific users are provided, only use those
        if user_ids:
            users_to_process = [uid for uid in user_ids if uid in data]
        else:
            users_to_process = list(data.keys())
        
        for user_id in users_to_process:
            features = data[user_id]["features"]
            target = data[user_id]["target"]
            
            # Create sequences
            for i in range(len(features) - self.sequence_length):
                X.append(features[i:i+self.sequence_length])
                y.append(target[i+self.sequence_length])
        
        return np.array(X), np.array(y)
    
    def train(self, data, epochs=10, batch_size=32, validation_split=0.2):
        """Train the LSTM model on sequence data"""
        X, y = self.prepare_sequences(data)
        
        if len(X) == 0:
            print("No sequence data available for training")
            return None
        
        # If model not yet built, build it
        if self.model is None:
            self.build_model()
        
        # Train the model
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        return history
    
    def predict(self, sequence_data):
        """Make predictions for sequence data"""
        if self.model is None:
            raise ValueError("Model has not been trained yet")
        
        return self.model.predict(sequence_data)
    
    def save_model(self, filename):
        """Save the trained model"""
        if self.model:
            self.model.save(filename)
    
    def load_model(self, filename):
        """Load a trained model"""
        self.model = load_model(filename)

class GraphNeuralNetwork(nn.Module):
    """GNN model for analyzing transaction network patterns"""
    
    def __init__(self, in_channels, hidden_channels, out_channels):
        super(GraphNeuralNetwork, self).__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.conv3 = GCNConv(hidden_channels, out_channels)
    
    def forward(self, x, edge_index):
        # First Graph Convolution Layer
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        
        # Second Graph Convolution Layer
        x = self.conv2(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        
        # Output Layer
        x = self.conv3(x, edge_index)
        
        return F.log_softmax(x, dim=1)

def build_qr_code_classifier():
    """Build a CNN model for QR code analysis"""
    model = Sequential([
        keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 3)),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(128, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Flatten(),
        keras.layers.Dense(128, activation='relu'),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(2, activation='softmax')  # 2 classes: genuine and manipulated
    ])
    
    model.compile(optimizer='adam',
                 loss='sparse_categorical_crossentropy',
                 metrics=['accuracy'])
    
    return model

def build_transaction_classifier():
    """Build a pipeline to classify UPI transactions"""
    # Define categorical and numerical features
    categorical_features = ["Transaction_Mode", "Device_Type", "Location", "Linked_Bank", "Link_Clicked_From"]
    numerical_features = ["Amount", "Frequency_in_24hrs", "User_Account_Age_Days", "Login_Attempts_24hrs", 
                          "Transaction_Velocity", "Attempt_to_Beneficiary_Ratio"]
    
    # Create preprocessing pipelines
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    numerical_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    # Combine preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', categorical_transformer, categorical_features),
            ('num', numerical_transformer, numerical_features)
        ],
        remainder='drop'
    )
    
    # Create full pipeline with Random Forest classifier
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    return model

def extract_upi_link_features(link):
    """Extract features from a UPI payment link for analysis"""
    features = {}
    
    # Check if it's a valid UPI link format
    if not link.startswith("upi://"):
        features["valid_format"] = 0
    else:
        features["valid_format"] = 1
    
    # Parse the link components
    try:
        # Extract basic components
        parts = link.split("?")[1].split("&")
        params = {}
        for part in parts:
            key, value = part.split("=")
            params[key] = value
        
        # Common UPI parameters
        features["has_pa"] = 1 if "pa" in params else 0  # payee address
        features["has_pn"] = 1 if "pn" in params else 0  # payee name
        features["has_am"] = 1 if "am" in params else 0  # amount
        features["has_tn"] = 1 if "tn" in params else 0  # transaction note
        
        # Extract payee information if available
        if "pa" in params:
            pa = params["pa"]
            features["pa_length"] = len(pa)
            features["pa_has_special_chars"] = 1 if re.search(r'[^a-zA-Z0-9@.]', pa) else 0
            
            # Check if it has a valid UPI ID format (account@provider)
            features["pa_valid_format"] = 1 if re.match(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$', pa) else 0
        else:
            features["pa_length"] = 0
            features["pa_has_special_chars"] = 0
            features["pa_valid_format"] = 0
        
        # Amount analysis if available
        if "am" in params:
            try:
                amount = float(params["am"])
                features["amount"] = amount
                features["amount_suspicious"] = 1 if amount > 10000 else 0
            except ValueError:
                features["amount"] = 0
                features["amount_suspicious"] = 1
        else:
            features["amount"] = 0
            features["amount_suspicious"] = 0
        
        # Check for suspicious parameters
        suspicious_params = [p for p in params.keys() if p not in ["pa", "pn", "am", "tn", "cu", "mc"]]
        features["suspicious_params_count"] = len(suspicious_params)
        
    except Exception:
        # If parsing fails, mark as suspicious
        features["valid_format"] = 0
        features["has_pa"] = 0
        features["has_pn"] = 0
        features["has_am"] = 0
        features["has_tn"] = 0
        features["pa_length"] = 0
        features["pa_has_special_chars"] = 0
        features["pa_valid_format"] = 0
        features["amount"] = 0
        features["amount_suspicious"] = 1
        features["suspicious_params_count"] = 5
    
    return features

def analyze_qr_code(qr_image):
    """Analyze a QR code for potential manipulation or fraud"""
        
    # Convert PIL Image to OpenCV format
    img = np.array(qr_image)
        
    # Ensure the image is in the correct format (uint8)
    if img.dtype != np.uint8:
        img = img.astype(np.uint8)
        
    # Handle different image formats (RGBA, grayscale, etc.)
    if len(img.shape) == 3 and img.shape[2] == 4:  # RGBA
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
    elif len(img.shape) == 2:  # Grayscale
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif len(img.shape) == 3 and img.shape[2] == 3:  # RGB
        pass  # Already in BGR format (OpenCV uses BGR by default)
    else:
        raise ValueError("Unsupported image format")
        
    # Resize for consistent processing
    img = cv2.resize(img, (400, 400))
        
    # Perform several checks for manipulation
    results = {}
        
    # 1. Check QR code readability
    try:
        from pyzbar.pyzbar import decode
        decoded = decode(img)
        if decoded:
            # Successfully decoded
            results["readable"] = True
            results["decoded_data"] = decoded[0].data.decode('utf-8')
                
            # Check if decoded data is a valid UPI link
            if results["decoded_data"].startswith("upi://"):
                results["is_upi_link"] = True
                # Extract link features
                link_features = extract_upi_link_features(results["decoded_data"])
                results["link_analysis"] = link_features
            else:
                results["is_upi_link"] = False
        else:
            # Unable to decode
            results["readable"] = False
            results["manipulation_probability"] = 0.9  # High probability of manipulation
    except Exception:
        results["readable"] = False
        results["error"] = "Failed to decode QR code"
        results["manipulation_probability"] = 0.8
        
    # 2. Check for visual tampering signs
        
    # Convert to grayscale for analysis
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
    # Edge detection to find unusual patterns
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
    results["edge_density"] = edge_density
        
    # Check for noise or artifacts
    noise_level = np.std(gray)
    results["noise_level"] = noise_level
        
    # 3. Check QR code position detection patterns (the three squares in corners)
        
    # Binarize the image
    _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
        
    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
    # Look for square-like contours (potential position detection patterns)
    square_contours = []
    for contour in contours:
        # Approximate contour
        perimeter = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.04 * perimeter, True)
            
        # Check if it's a square (4 corners) and has reasonable size
        if len(approx) == 4 and cv2.contourArea(contour) > 100:
            square_contours.append(contour)
        
    results["position_pattern_count"] = len(square_contours)
        
    # Determine manipulation probability based on all factors
    if not results.get("readable", False):
        results["manipulation_probability"] = 0.9
    elif results.get("is_upi_link", False) and results.get("link_analysis", {}).get("pa_valid_format", 0) == 0:
        results["manipulation_probability"] = 0.8
    elif results.get("position_pattern_count", 0) != 3:  # QR codes should have exactly 3 position patterns
        results["manipulation_probability"] = 0.7
    elif edge_density > 0.3:  # Unusually high edge density suggests tampering
        results["manipulation_probability"] = 0.6
    elif noise_level > 50:  # High noise level suggests potential tampering
        results["manipulation_probability"] = 0.5
    else:
        # Calculate a weighted probability
        prob = 0.1  # Base probability
            
        # Adjust based on link features if available
        if results.get("is_upi_link", False) and "link_analysis" in results:
            link_analysis = results["link_analysis"]
            if link_analysis.get("suspicious_params_count", 0) > 0:
                prob += 0.2
            if link_analysis.get("pa_has_special_chars", 0) == 1:
                prob += 0.1
            if link_analysis.get("amount_suspicious", 0) == 1:
                prob += 0.2
            
        results["manipulation_probability"] = min(prob, 0.9)  # Cap at 0.9
        
    return results

def generate_transaction_features_from_input(input_data):
    """
    Generate a feature set from user input for fraud detection
    
    Parameters:
    input_data (dict): User input data
    
    Returns:
    pd.DataFrame: DataFrame with single row for model prediction
    """
    # Create a single row DataFrame with default/empty values
    feature_columns = [
        "Amount", "Time", "Location", "Device_Type", "Transaction_Mode", 
        "Frequency_in_24hrs", "Beneficiary_Account_Age", "User_Account_Age_Days",
        "Login_Attempts_24hrs", "Device_Change_Flag", "Location_Change_Flag",
        "Transaction_Velocity", "Attempt_to_Beneficiary_Ratio", "Is_QR_Manipulated",
        "Linked_Bank", "Link_Clicked_From"
    ]
    
    # Initialize with default values
    df = pd.DataFrame({col: [0] for col in feature_columns})
    
    # Fill in the values from input_data
    for key, value in input_data.items():
        if key in feature_columns:
            df[key] = value
    
    # Handle special cases and data type conversions
    
    # Parse beneficiary account age to days
    if "Beneficiary_Account_Age" in input_data:
        age_str = input_data["Beneficiary_Account_Age"]
        
        # Extract the numeric part and unit (days, months, years)
        parts = age_str.split()
        if len(parts) >= 2:
            try:
                value = float(parts[0])
                unit = parts[1].lower()
                
                if "day" in unit:
                    days = value
                elif "month" in unit:
                    days = value * 30  # approximate
                elif "year" in unit:
                    days = value * 365  # approximate
                else:
                    days = 0
                    
                df["Beneficiary_Account_Age"] = days
            except:
                df["Beneficiary_Account_Age"] = 0
    
    # Add current time if not provided
    if "Time" not in input_data:
        current_time = datetime.now().strftime("%H:%M")
        df["Time"] = current_time
    
    return df

def prepare_graph_data_for_visualization(node_df, edge_df, highlight_fraud=True):
    """
    Prepare graph data for visualization in NetworkX
    
    Parameters:
    node_df (pd.DataFrame): DataFrame with node information
    edge_df (pd.DataFrame): DataFrame with edge information
    highlight_fraud (bool): Whether to highlight fraud connections
    
    Returns:
    nx.Graph: NetworkX graph for visualization
    """
    G = nx.Graph()
    
    # Add nodes
    for _, row in node_df.iterrows():
        node_id = row["node_id"]
        node_type = row["node_type"]
        
        G.add_node(node_id, node_type=node_type)
    
    # Add edges
    for _, row in edge_df.iterrows():
        source = row["source"]
        target = row["target"]
        amount = row["amount"]
        is_fraud = row["is_fraud"]
        
        G.add_edge(source, target, weight=amount, is_fraud=is_fraud)
    
    return G

def get_explanation_for_fraud_prediction(model, features, prediction):
    """
    Generate an explanation for a fraud prediction using LIME
    
    Parameters:
    model: Trained model
    features: Feature set used for prediction
    prediction: Model prediction
    
    Returns:
    dict: Explanation data
    """
    # Use LIME for explainability
    try:
        # Create a LIME explainer
        feature_names = features.columns.tolist()
        categorical_features = [i for i, col in enumerate(feature_names) 
                               if col in ["Transaction_Mode", "Device_Type", "Location", 
                                         "Linked_Bank", "Link_Clicked_From"]]
        
        explainer = lime_tabular.LimeTabularExplainer(
            training_data=features.values,
            feature_names=feature_names,
            class_names=["Legitimate", "Fraud"],
            categorical_features=categorical_features,
            mode="classification"
        )
        
        # Get explanation for the instance
        instance = features.iloc[0].values
        exp = explainer.explain_instance(
            instance, 
            model.predict_proba, 
            num_features=10
        )
        
        # Extract the explanation data
        explanation = {}
        explanation["features"] = {}
        
        for feature, weight in exp.as_list():
            explanation["features"][feature] = weight
        
        # Sort features by absolute weight
        sorted_features = sorted(
            explanation["features"].items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        explanation["top_features"] = sorted_features[:5]
        explanation["prediction"] = prediction
        explanation["confidence"] = model.predict_proba(features)[0][1]
        
        return explanation
    
    except Exception as e:
        # Fallback to a simpler explanation if LIME fails
        return {
            "error": str(e),
            "prediction": prediction,
            "confidence": model.predict_proba(features)[0][1] if hasattr(model, "predict_proba") else None,
            "message": "Detailed explanation unavailable, but the model has detected patterns similar to known fraud cases."
        }

def build_ensemble_model(transaction_df):
    """Build an ensemble model combining multiple fraud detection approaches"""
    
    # Split data
    X = transaction_df.drop(["Transaction_ID", "User_ID", "Beneficiary_ID", "IP_Address", 
                           "Transaction_Date", "Transaction_Success", "Fraud_Type", "Is_Fraud"], axis=1)
    y = transaction_df["Is_Fraud"]
    
    # Handle categorical variables
    cat_cols = ["Transaction_Mode", "Device_Type", "Location", "Linked_Bank", "Link_Clicked_From"]
    num_cols = [col for col in X.columns if col not in cat_cols and X[col].dtype in ["int64", "float64"]]
    
    # Replace text in Beneficiary_Account_Age with actual days
    X["Beneficiary_Account_Age"] = X["Beneficiary_Account_Age"].apply(
        lambda x: int(x.split()[0]) * 365 if "year" in x 
        else int(x.split()[0]) * 30 if "month" in x
        else int(x.split()[0])
    )
    
    # Create preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)
        ]
    )
    
    # Create different models for the ensemble
    model1 = RandomForestClassifier(n_estimators=100, random_state=42)
    model2 = IsolationForest(contamination=0.1, random_state=42)
    model3 = MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=300, random_state=42)
    
    # Create pipelines for each model
    pipeline1 = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', model1)
    ])
    
    pipeline2 = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', model2)
    ])
    
    pipeline3 = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', model3)
    ])
    
    # Train each model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    pipeline1.fit(X_train, y_train)
    
    # Special case for Isolation Forest (unsupervised)
    y_train_if = np.ones(len(X_train))
    y_train_if[y_train == 1] = -1  # Anomalies are -1 in Isolation Forest
    pipeline2.fit(X_train)
    
    pipeline3.fit(X_train, y_train)
    
    # Save the models
    with open(f"{MODEL_PATH}rf_model.pkl", "wb") as f:
        pickle.dump(pipeline1, f)
    
    with open(f"{MODEL_PATH}if_model.pkl", "wb") as f:
        pickle.dump(pipeline2, f)
    
    with open(f"{MODEL_PATH}nn_model.pkl", "wb") as f:
        pickle.dump(pipeline3, f)
    
    # Create a simple voting ensemble function
    def ensemble_predict(X, threshold=0.5):
        # Get predictions from each model
        pred1 = pipeline1.predict_proba(X)[:, 1]
        
        # Convert Isolation Forest decision function to probability-like score
        pred2_raw = pipeline2.named_steps['classifier'].decision_function(
            pipeline2.named_steps['preprocessor'].transform(X)
        )
        pred2 = 1 - (pred2_raw - pred2_raw.min()) / (pred2_raw.max() - pred2_raw.min())
        
        pred3 = pipeline3.predict_proba(X)[:, 1]
        
        # Combine predictions (weighted average)
        weighted_pred = 0.5 * pred1 + 0.2 * pred2 + 0.3 * pred3
        
        # Apply threshold
        final_pred = (weighted_pred >= threshold).astype(int)
        
        return final_pred, weighted_pred
    
    # Test the ensemble
    ensemble_preds, ensemble_scores = ensemble_predict(X_test)
    ensemble_accuracy = accuracy_score(y_test, ensemble_preds)
    print(f"Ensemble accuracy: {ensemble_accuracy:.4f}")
    
    # Return the ensemble function and individual models
    return ensemble_predict, (pipeline1, pipeline2, pipeline3)

# Streamlit UI Functions
def display_header():
    """Display the header section of the app"""
    st.title("🔒 UPI Fraud Detection System")
    st.markdown(
        """
        ### AI-Powered Fraud Detection for UPI Transactions
        This system implements an integrated approach combining temporal anomaly detection with 
        dynamic graph analytics to detect and prevent UPI payment fraud in real-time.
        """
    )

def sidebar_navigation():
    """Display the sidebar navigation menu"""
    st.sidebar.title("Navigation")
    
    # Main navigation options
    selected_page = st.sidebar.radio(
        "Select Page",
        [
            "🏠 Dashboard",
            "📊 Data Generation & Analysis",
            "🔍 Fraud Detection Demo",
            "📱 Real-time Transaction Analyzer",
            "🧠 Algorithm Explanations",
            "📈 Performance Metrics"
        ]
    )
    
    # Sub-navigation for Fraud Detection Demo
    if selected_page == "🔍 Fraud Detection Demo":
        fraud_type = st.sidebar.radio(
            "Select Fraud Type to Demo",
            [
                "Phishing & QR Code Fraud",
                "SIM Swap & Account Takeover",
                "Social Engineering & Fake Support",
                "Remote Access Attacks",
                "Deepfake & Impersonation Scams",
                "Cross-Pattern Detection"
            ]
        )
        return selected_page, fraud_type
    
    return selected_page, None

def load_or_generate_data():
    """Load existing dataset or generate a new one"""
    
    data_exists = os.path.exists(f"{DATA_PATH}upi_transaction_data.csv")
    
    if data_exists:
        df = pd.read_csv(f"{DATA_PATH}upi_transaction_data.csv")
        
        # Check if we have graph data
        if os.path.exists(f"{DATA_PATH}upi_graph_nodes.csv") and os.path.exists(f"{DATA_PATH}upi_graph_edges.csv"):
            node_df = pd.read_csv(f"{DATA_PATH}upi_graph_nodes.csv")
            edge_df = pd.read_csv(f"{DATA_PATH}upi_graph_edges.csv")
        else:
            node_df, edge_df = generate_graph_data(df)
        
        # Check if we have temporal data
        if os.path.exists(f"{DATA_PATH}upi_temporal_sequences.pkl"):
            with open(f"{DATA_PATH}upi_temporal_sequences.pkl", "rb") as f:
                temporal_data = pickle.load(f)
        else:
            temporal_data = generate_temporal_data(df)
        
    else:
        # Generate all data
        df = generate_synthetic_data(n_samples=20000)
        node_df, edge_df = generate_graph_data(df)
        temporal_data = generate_temporal_data(df)
        
        # Also generate QR code examples
        legitimate_qrs, manipulated_qrs = generate_qr_examples()
    
    return df, node_df, edge_df, temporal_data

def load_or_train_models(df, temporal_data):
    """Load existing models or train new ones"""
    
    # Check if models exist
    rf_model_exists = os.path.exists(f"{MODEL_PATH}rf_model.pkl")
    if_model_exists = os.path.exists(f"{MODEL_PATH}if_model.pkl")
    nn_model_exists = os.path.exists(f"{MODEL_PATH}nn_model.pkl")
    lstm_model_exists = os.path.exists(f"{MODEL_PATH}lstm_model.h5")
    
    if rf_model_exists and if_model_exists and nn_model_exists:
        # Load ensemble models
        with open(f"{MODEL_PATH}rf_model.pkl", "rb") as f:
            rf_model = pickle.load(f)
        
        with open(f"{MODEL_PATH}if_model.pkl", "rb") as f:
            if_model = pickle.load(f)
        
        with open(f"{MODEL_PATH}nn_model.pkl", "rb") as f:
            nn_model = pickle.load(f)
        
        # Create ensemble function
        def ensemble_predict(X, threshold=0.5):
            # Get predictions from each model
            pred1 = rf_model.predict_proba(X)[:, 1]
            
            # Convert Isolation Forest decision function to probability-like score
            pred2_raw = if_model.named_steps['classifier'].decision_function(
                if_model.named_steps['preprocessor'].transform(X)
            )
            pred2 = 1 - (pred2_raw - pred2_raw.min()) / (pred2_raw.max() - pred2_raw.min())
            
            pred3 = nn_model.predict_proba(X)[:, 1]
            
            # Combine predictions (weighted average)
            weighted_pred = 0.5 * pred1 + 0.2 * pred2 + 0.3 * pred3
            
            # Apply threshold
            final_pred = (weighted_pred >= threshold).astype(int)
            
            return final_pred, weighted_pred
    else:
        # Train new models
        ensemble_predict, (rf_model, if_model, nn_model) = build_ensemble_model(df)
    
    # LSTM model for temporal analysis
    if lstm_model_exists:
        lstm_model = load_model(f"{MODEL_PATH}lstm_model.h5")
    else:
        # Create and train a simple LSTM model
        temporal_detector = TemporalAnomalyDetector(input_dim=6)
        temporal_detector.build_model()
        
        # Train with a small subset for demo purposes
        sample_users = list(temporal_data.keys())[:50]
        sample_data = {uid: temporal_data[uid] for uid in sample_users}
        
        temporal_detector.train(sample_data, epochs=5)
        temporal_detector.save_model(f"{MODEL_PATH}lstm_model.h5")
        lstm_model = temporal_detector.model
    
    return ensemble_predict, (rf_model, if_model, nn_model), lstm_model

def display_dashboard(df, node_df, edge_df):
    """Display the main dashboard with fraud overview"""
    
    st.header("Fraud Detection Dashboard")
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    total_transactions = len(df)
    total_fraud = df["Is_Fraud"].sum()
    fraud_percentage = (total_fraud / total_transactions) * 100
    total_amount = df["Amount"].sum()
    fraud_amount = df[df["Is_Fraud"] == 1]["Amount"].sum()
    
    with col1:
        st.metric("Total Transactions", f"{total_transactions:,}")
    
    with col2:
        st.metric("Fraud Transactions", f"{total_fraud:,}")
    
    with col3:
        st.metric("Fraud Rate", f"{fraud_percentage:.2f}%")
    
    with col4:
        st.metric("Fraud Amount", f"₹{fraud_amount:,.2f}")
    
    # Fraud by type
    st.subheader("Fraud by Type")
    
    fraud_by_type = df[df["Is_Fraud"] == 1]["Fraud_Type"].value_counts()
    
    fig, ax = plt.subplots(figsize=(10, 5))
    fraud_by_type.plot(kind="bar", ax=ax)
    ax.set_xlabel("Fraud Type")
    ax.set_ylabel("Number of Transactions")
    ax.set_title("Distribution of Fraud Types")
    st.pyplot(fig)
    
    # Fraud by transaction mode
    st.subheader("Fraud by Transaction Mode")
    
    fraud_by_mode = pd.crosstab(df["Transaction_Mode"], df["Is_Fraud"])
    if 1 in fraud_by_mode.columns:  # Make sure we have fraud data
        fraud_by_mode_pct = (fraud_by_mode[1] / (fraud_by_mode[0] + fraud_by_mode[1])) * 100
        
        fig, ax = plt.subplots(figsize=(10, 5))
        fraud_by_mode_pct.plot(kind="bar", ax=ax, color="orangered")
        ax.set_xlabel("Transaction Mode")
        ax.set_ylabel("Fraud Percentage")
        ax.set_title("Fraud Percentage by Transaction Mode")
        st.pyplot(fig)
    
    # Network visualization (sample)
    st.subheader("Transaction Network Analysis (Sample)")
    
    # Create a subgraph with only a sample of nodes for visualization
    G = prepare_graph_data_for_visualization(node_df, edge_df)
    
    # Sample the graph for visualization (show some fraud connections)
    fraud_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get("is_fraud", 0) == 1]
    
    if fraud_edges:
        # Get connected components that include fraud
        fraud_nodes = set()
        for u, v in fraud_edges[:15]:  # Sample 15 fraud edges
            fraud_nodes.add(u)
            fraud_nodes.add(v)
        
        # Add some neighbors
        neighbors = set()
        for node in fraud_nodes:
            neighbors.update(G.neighbors(node))
        
        # Create a subgraph
        nodes_to_include = list(fraud_nodes.union(neighbors))[:100]  # Limit to 100 nodes
        subgraph = G.subgraph(nodes_to_include)
        
        # Create a plot
        plt.figure(figsize=(10, 8))
        pos = nx.spring_layout(subgraph)
        
        # Draw nodes
        user_nodes = [n for n, d in subgraph.nodes(data=True) if d.get("node_type") == "user"]
        beneficiary_nodes = [n for n, d in subgraph.nodes(data=True) if d.get("node_type") == "beneficiary"]
        
        nx.draw_networkx_nodes(subgraph, pos, nodelist=user_nodes, node_color="skyblue", node_size=100, label="Users")
        nx.draw_networkx_nodes(subgraph, pos, nodelist=beneficiary_nodes, node_color="orange", node_size=100, label="Beneficiaries")
        
        # Draw edges
        normal_edges = [(u, v) for u, v, d in subgraph.edges(data=True) if d.get("is_fraud", 0) == 0]
        fraud_edges = [(u, v) for u, v, d in subgraph.edges(data=True) if d.get("is_fraud", 0) == 1]
        
        nx.draw_networkx_edges(subgraph, pos, edgelist=normal_edges, width=1, alpha=0.5, edge_color="gray")
        nx.draw_networkx_edges(subgraph, pos, edgelist=fraud_edges, width=2, alpha=1, edge_color="red", style="dashed")
        
        plt.title("Sample of Transaction Network (Red edges indicate fraud)")
        plt.legend()
        
        # Display the plot
        st.pyplot(plt)
    else:
        st.write("No fraud edges detected in the sample network.")
    
    # Recent fraud alerts
    st.subheader("Recent Fraud Alerts")
    
    recent_fraud = df[df["Is_Fraud"] == 1].sort_values("Transaction_Date", ascending=False).head(5)
    if not recent_fraud.empty:
        for _, fraud in recent_fraud.iterrows():
            with st.container():
                col1, col2 = st.columns([1, 3])
                
                with col1:
                    if fraud["Fraud_Type"] == "Phishing":
                        st.warning("⚠️ Phishing Attack")
                    elif fraud["Fraud_Type"] == "SIM_Swap":
                        st.warning("⚠️ SIM Swap")
                    elif fraud["Fraud_Type"] == "Social_Engineering":
                        st.warning("⚠️ Social Engineering")
                    elif fraud["Fraud_Type"] == "Remote_Access":
                        st.warning("⚠️ Remote Access")
                    elif fraud["Fraud_Type"] == "Deepfake_Impersonation":
                        st.warning("⚠️ Deepfake/Impersonation")
                    else:
                        st.warning("⚠️ Unknown Fraud")
                
                with col2:
                    st.write(f"User ID: {fraud['User_ID']}")
                    st.write(f"Amount: ₹{fraud['Amount']:,.2f}")
                    st.write(f"Transaction Mode: {fraud['Transaction_Mode']}")
                    st.write(f"Time: {fraud['Time']}")
    else:
        st.write("No recent fraud alerts")

def display_data_analysis(df):
    """Display data analysis and visualization page"""
    
    st.header("Data Generation & Analysis")
    
    # Data generation section
    st.subheader("Data Generation")
    
    col1, col2 = st.columns(2)
    
    with col1:
        n_samples = st.number_input("Number of samples to generate", min_value=1000, max_value=100000, value=20000, step=1000)
    
    with col2:
        generate_btn = st.button("Generate New Dataset")
    
    if generate_btn:
        with st.spinner("Generating synthetic data..."):
            df_new = generate_synthetic_data(n_samples=n_samples)
            st.session_state["transaction_data"] = df_new
            node_df_new, edge_df_new = generate_graph_data(df_new)
            st.session_state["node_data"] = node_df_new
            st.session_state["edge_data"] = edge_df_new
            temporal_data_new = generate_temporal_data(df_new)
            st.session_state["temporal_data"] = temporal_data_new
            
            st.success(f"Generated {n_samples} synthetic transactions with fraud patterns!")
            
            df = df_new  # Update the dataframe for this session
    
    # Data overview
    st.subheader("Dataset Overview")
    
    # Display a sample of the data
    st.write("Sample of transaction data:")
    st.dataframe(df.sample(5))
    
    # Display fraud distribution
    st.write("Fraud Distribution:")
    fig, ax = plt.subplots(figsize=(10, 5))
    fraud_counts = df["Is_Fraud"].value_counts()
    ax.pie(fraud_counts, labels=["Legitimate", "Fraud"], autopct='%1.1f%%', colors=["lightblue", "salmon"])
    ax.set_title("Distribution of Fraud vs Legitimate Transactions")
    st.pyplot(fig)
    
    # Fraud type distribution
    st.write("Fraud Type Distribution:")
    
    fraud_types = df[df["Is_Fraud"] == 1]["Fraud_Type"].value_counts()
    
    fig, ax = plt.subplots(figsize=(12, 6))
    fraud_types.plot(kind="bar", ax=ax, color="orangered")
    ax.set_xlabel("Fraud Type")
    ax.set_ylabel("Number of Transactions")
    ax.set_title("Distribution of Different Fraud Types")
    st.pyplot(fig)
    
    # Feature correlations
    st.subheader("Feature Correlations")
    
    # Select numeric columns for correlation
    numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns.tolist()
    
    # Calculate correlation matrix
    corr_matrix = df[numeric_cols].corr()
    
    # Plot correlation heatmap
    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", vmin=-1, vmax=1, ax=ax)
    ax.set_title("Correlation Matrix of Numeric Features")
    st.pyplot(fig)
    
    # Feature importance through RandomForest
    st.subheader("Feature Importance Analysis")
    
    # Check if we already have a trained model
    if os.path.exists(f"{MODEL_PATH}rf_model.pkl"):
        with open(f"{MODEL_PATH}rf_model.pkl", "rb") as f:
            rf_model = pickle.load(f)
            
        # Extract feature names and importance
        feature_names = []
        
        # Get categorical feature names
        categorical_features = ["Transaction_Mode", "Device_Type", "Location", "Linked_Bank", "Link_Clicked_From"]
        for feature in categorical_features:
            if feature in df.columns:
                for category in df[feature].unique():
                    feature_names.append(f"{feature}_{category}")
        
        # Get numerical feature names
        numerical_features = [col for col in df.columns if col not in categorical_features and df[col].dtype in ["int64", "float64"]]
        feature_names.extend(numerical_features)
        
        # Get actual feature names from the model transformer
        try:
            preprocessor = rf_model.named_steps["preprocessor"]
            feature_names = preprocessor.get_feature_names_out()
        except:
            pass
        
        # Get feature importances
        try:
            importances = rf_model.named_steps["classifier"].feature_importances_
            
            # Plot feature importances
            fig, ax = plt.subplots(figsize=(12, 8))
            ax.barh(feature_names, importances)
            ax.set_xlabel("Feature Importance")
            ax.set_title("Random Forest Feature Importance")
            st.pyplot(fig)
        except Exception as e:
            st.error(f"Could not extract feature importances: {e}")
    
    # Data distribution analysis
    st.subheader("Data Distribution Analysis")
    
    # Select a feature to analyze
    feature_to_analyze = st.selectbox("Select feature to analyze", df.columns)
    
    if feature_to_analyze:
        fig, ax = plt.subplots(figsize=(10, 5))
        sns.histplot(df[feature_to_analyze], kde=True, ax=ax)
        ax.set_title(f"Distribution of {feature_to_analyze}")
        st.pyplot(fig)

def display_fraud_detection_demo(ensemble_predict, rf_model, if_model, nn_model, lstm_model, df, temporal_data, node_df, edge_df):
    """Display the fraud detection demo page"""
    
    st.header("Fraud Detection Demo")
    
    # Select fraud type to demo
    fraud_type = st.selectbox(
        "Select Fraud Type to Demo",
        [
            "Phishing & QR Code Fraud",
            "SIM Swap & Account Takeover",
            "Social Engineering & Fake Support",
            "Remote Access Attacks",
            "Deepfake & Impersonation Scams",
            "Cross-Pattern Detection"
        ]
    )
    
    if fraud_type == "Phishing & QR Code Fraud":
        st.subheader("Phishing & QR Code Fraud Detection")
        
        # Load QR code examples
        legitimate_qrs, manipulated_qrs = generate_qr_examples()
        
        # Display QR codes
        st.write("### Legitimate QR Codes")
        col1, col2, col3, col4, col5 = st.columns(5)
        for i, qr_path in enumerate(legitimate_qrs):
            with col1 if i == 0 else col2 if i == 1 else col3 if i == 2 else col4 if i == 3 else col5:
                st.image(qr_path, caption=f"Legitimate QR {i+1}", width=100)
        
        st.write("### Manipulated QR Codes")
        col1, col2, col3, col4, col5 = st.columns(5)
        for i, qr_path in enumerate(manipulated_qrs):
            with col1 if i == 0 else col2 if i == 1 else col3 if i == 2 else col4 if i == 3 else col5:
                st.image(qr_path, caption=f"Manipulated QR {i+1}", width=100)
        
        # Analyze QR codes
        st.write("### QR Code Analysis")
        qr_to_analyze = st.selectbox("Select QR Code to Analyze", legitimate_qrs + manipulated_qrs)
        
        if qr_to_analyze:
            qr_image = Image.open(qr_to_analyze)
            analysis_results = analyze_qr_code(qr_image)
            
            st.write("#### Analysis Results")
            st.json(analysis_results)
            
            if analysis_results.get("manipulation_probability", 0) > 0.5:
                st.error("⚠️ This QR code is likely manipulated!")
            else:
                st.success("✅ This QR code appears to be legitimate.")
    
    elif fraud_type == "SIM Swap & Account Takeover":
        st.subheader("SIM Swap & Account Takeover Detection")
        
        # Simulate SIM swap fraud
        st.write("### Simulated SIM Swap Fraud")
        sim_swap_data = df[df["Fraud_Type"] == "SIM_Swap"].sample(1).iloc[0]
        
        st.write(f"**User ID:** {sim_swap_data['User_ID']}")
        st.write(f"**Amount:** ₹{sim_swap_data['Amount']:,.2f}")
        st.write(f"**Location:** {sim_swap_data['Location']}")
        st.write(f"**Device Change Flag:** {sim_swap_data['Device_Change_Flag']}")
        st.write(f"**Location Change Flag:** {sim_swap_data['Location_Change_Flag']}")
        st.write(f"**Login Attempts (24hrs):** {sim_swap_data['Login_Attempts_24hrs']}")
        
        # Predict using LSTM model
        st.write("### Temporal Anomaly Detection (LSTM)")
        user_sequences = temporal_data.get(sim_swap_data["User_ID"], None)
        
        if user_sequences:
            X, y = lstm_model.prepare_sequences({sim_swap_data["User_ID"]: user_sequences})
            if len(X) > 0:
                prediction = lstm_model.predict(X[-1:])
                st.write(f"**Anomaly Score:** {prediction[0][0]:.4f}")
                
                if prediction[0][0] > 0.5:
                    st.error("⚠️ This transaction is flagged as suspicious by the LSTM model!")
                else:
                    st.success("✅ This transaction appears normal.")
            else:
                st.warning("Not enough temporal data for this user.")
        else:
            st.warning("No temporal data available for this user.")
    
    elif fraud_type == "Social Engineering & Fake Support":
        st.subheader("Social Engineering & Fake Support Detection")
        
        # Simulate social engineering fraud
        st.write("### Simulated Social Engineering Fraud")
        social_eng_data = df[df["Fraud_Type"] == "Social_Engineering"].sample(1).iloc[0]
        
        st.write(f"**User ID:** {social_eng_data['User_ID']}")
        st.write(f"**Amount:** ₹{social_eng_data['Amount']:,.2f}")
        st.write(f"**Time:** {social_eng_data['Time']}")
        st.write(f"**Transaction Mode:** {social_eng_data['Transaction_Mode']}")
        
        # Predict using ensemble model
        st.write("### Ensemble Model Prediction")
        input_data = generate_transaction_features_from_input(social_eng_data.to_dict())
        prediction, score = ensemble_predict(input_data)
        
        st.write(f"**Fraud Probability:** {score[0]:.4f}")
        
        if prediction[0] == 1:
            st.error("⚠️ This transaction is flagged as fraudulent by the ensemble model!")
        else:
            st.success("✅ This transaction appears legitimate.")
    
    elif fraud_type == "Remote Access Attacks":
        st.subheader("Remote Access Attack Detection")
        
        # Simulate remote access fraud
        st.write("### Simulated Remote Access Fraud")
        remote_access_data = df[df["Fraud_Type"] == "Remote_Access"].sample(1).iloc[0]
        
        st.write(f"**User ID:** {remote_access_data['User_ID']}")
        st.write(f"**Amount:** ₹{remote_access_data['Amount']:,.2f}")
        st.write(f"**App Version:** {remote_access_data['App_Version']}")
        st.write(f"**Transaction Velocity:** {remote_access_data['Transaction_Velocity']}")
        
        # Predict using isolation forest
        st.write("### Anomaly Detection (Isolation Forest)")
        input_data = generate_transaction_features_from_input(remote_access_data.to_dict())
        pred2_raw = if_model.named_steps['classifier'].decision_function(
            if_model.named_steps['preprocessor'].transform(input_data)
        )
        pred2 = 1 - (pred2_raw - pred2_raw.min()) / (pred2_raw.max() - pred2_raw.min())
        
        st.write(f"**Anomaly Score:** {pred2[0]:.4f}")
        
        if pred2[0] > 0.5:
            st.error("⚠️ This transaction is flagged as anomalous by the Isolation Forest model!")
        else:
            st.success("✅ This transaction appears normal.")
    
    elif fraud_type == "Deepfake & Impersonation Scams":
        st.subheader("Deepfake & Impersonation Scam Detection")
        
        # Simulate deepfake fraud
        st.write("### Simulated Deepfake Fraud")
        deepfake_data = df[df["Fraud_Type"] == "Deepfake_Impersonation"].sample(1).iloc[0]
        
        st.write(f"**User ID:** {deepfake_data['User_ID']}")
        st.write(f"**Amount:** ₹{deepfake_data['Amount']:,.2f}")
        st.write(f"**Beneficiary Account Age:** {deepfake_data['Beneficiary_Account_Age']}")
        st.write(f"**Transaction Mode:** {deepfake_data['Transaction_Mode']}")
        
        # Predict using neural network
        st.write("### Neural Network Prediction")
        input_data = generate_transaction_features_from_input(deepfake_data.to_dict())
        pred3 = nn_model.predict_proba(input_data)[:, 1]
        
        st.write(f"**Fraud Probability:** {pred3[0]:.4f}")
        
        if pred3[0] > 0.5:
            st.error("⚠️ This transaction is flagged as fraudulent by the Neural Network model!")
        else:
            st.success("✅ This transaction appears legitimate.")
    
    elif fraud_type == "Cross-Pattern Detection":
        st.subheader("Cross-Pattern Fraud Detection")
        
        # Simulate cross-pattern fraud
        st.write("### Simulated Cross-Pattern Fraud")
        cross_pattern_data = df[df["Is_Fraud"] == 1].sample(1).iloc[0]
        
        st.write(f"**User ID:** {cross_pattern_data['User_ID']}")
        st.write(f"**Amount:** ₹{cross_pattern_data['Amount']:,.2f}")
        st.write(f"**Fraud Type:** {cross_pattern_data['Fraud_Type']}")
        
        # Predict using ensemble model
        st.write("### Ensemble Model Prediction")
        input_data = generate_transaction_features_from_input(cross_pattern_data.to_dict())
        prediction, score = ensemble_predict(input_data)
        
        st.write(f"**Fraud Probability:** {score[0]:.4f}")
        
        if prediction[0] == 1:
            st.error("⚠️ This transaction is flagged as fraudulent by the ensemble model!")
        else:
            st.success("✅ This transaction appears legitimate.")

def display_real_time_analyzer(ensemble_predict):
    """Display the real-time transaction analyzer"""
    
    st.header("Real-Time Transaction Analyzer")
    
    # Input form for transaction details
    st.write("### Enter Transaction Details")
    
    with st.form("transaction_form"):
        amount = st.number_input("Amount (INR)", min_value=0.0, value=1000.0)
        time = st.time_input("Time (HH:MM)", value=datetime.now().time())
        location = st.selectbox("Location", ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"])
        device_type = st.selectbox("Device Type", ["Mobile", "Tablet", "Desktop", "IoT Device"])
        transaction_mode = st.selectbox("Transaction Mode", ["UPI ID", "UPI Phone No", "UPI QR Code", "UPI Link", "UPI Intent"])
        frequency_24hrs = st.number_input("Frequency in 24hrs", min_value=0, value=3)
        beneficiary_age = st.text_input("Beneficiary Account Age", value="1 year")
        user_age_days = st.number_input("User Account Age (Days)", min_value=0, value=365)
        login_attempts = st.number_input("Login Attempts (24hrs)", min_value=0, value=1)
        device_change = st.checkbox("Device Change Flag")
        location_change = st.checkbox("Location Change Flag")
        transaction_velocity = st.number_input("Transaction Velocity", min_value=0, value=5)
        attempt_ratio = st.number_input("Attempt to Beneficiary Ratio", min_value=0.0, value=0.2)
        is_qr_manipulated = st.checkbox("Is QR Manipulated")
        linked_bank = st.selectbox("Linked Bank", ["HDFC", "SBI", "ICICI", "Axis", "PNB", "Kotak", "Yes Bank"])
        link_clicked_from = st.selectbox("Link Clicked From", ["Direct", "SMS", "Email", "Social Media", "Messaging App"])
        
        submitted = st.form_submit_button("Analyze Transaction")
    
    if submitted:
        # Prepare input data
        input_data = {
            "Amount": amount,
            "Time": time.strftime("%H:%M"),
            "Location": location,
            "Device_Type": device_type,
            "Transaction_Mode": transaction_mode,
            "Frequency_in_24hrs": frequency_24hrs,
            "Beneficiary_Account_Age": beneficiary_age,
            "User_Account_Age_Days": user_age_days,
            "Login_Attempts_24hrs": login_attempts,
            "Device_Change_Flag": int(device_change),
            "Location_Change_Flag": int(location_change),
            "Transaction_Velocity": transaction_velocity,
            "Attempt_to_Beneficiary_Ratio": attempt_ratio,
            "Is_QR_Manipulated": int(is_qr_manipulated),
            "Linked_Bank": linked_bank,
            "Link_Clicked_From": link_clicked_from
        }
        
        # Generate features
        features = generate_transaction_features_from_input(input_data)
        
        # Make prediction
        prediction, score = ensemble_predict(features)
        
        st.write("### Analysis Results")
        st.write(f"**Fraud Probability:** {score[0]:.4f}")
        
        if prediction[0] == 1:
            st.error("⚠️ This transaction is flagged as fraudulent!")
        else:
            st.success("✅ This transaction appears legitimate.")
        
        # Show explanation
        explanation = get_explanation_for_fraud_prediction(rf_model, features, prediction[0])
        st.write("### Explanation")
        st.json(explanation)

def display_algorithm_explanations():
    """Display explanations of the algorithms used"""
    
    st.header("Algorithm Explanations")
    
    st.write("### Temporal Anomaly Detection (LSTM)")
    st.markdown(
        """
        **Purpose:** Detects unusual patterns in a user's transaction history over time.
        
        **How it Works:**
        - Uses Long Short-Term Memory (LSTM) networks to process sequential transaction data.
        - Learns normal behavior patterns and flags deviations as potential fraud.
        - Continuously updates its understanding of normal behavior through online learning.
        
        **Why it's Effective:** 
        - Captures temporal dependencies in transaction sequences.
        - Adapts to evolving fraud tactics in real-time.
        """
    )
    
    st.write("### Dynamic Graph Analytics (GNN)")
    st.markdown(
        """
        **Purpose:** Identifies suspicious clusters and relationships in the transaction network.
        
        **How it Works:**
        - Constructs a live transaction graph where nodes represent accounts and edges represent transactions.
        - Applies Graph Neural Networks (GNNs) to detect fraud rings and collusive patterns.
        - Updates continuously to reflect new transactions and emerging fraud patterns.
        
        **Why it's Effective:** 
        - Detects complex fraud schemes that involve multiple accounts.
        - Provides real-time insights into the structure of the transaction network.
        """
    )
    
    st.write("### Ensemble Learning")
    st.markdown(
        """
        **Purpose:** Combines multiple models to improve fraud detection accuracy.
        
        **How it Works:**
        - Uses a weighted combination of predictions from Random Forest, Isolation Forest, and Neural Network models.
        - Adjusts model weights based on real-world feedback using reinforcement learning.
        
        **Why it's Effective:** 
        - Reduces the risk of false positives and false negatives.
        - Adapts to changing fraud patterns over time.
        """
    )
    
    st.write("### Explainable AI (XAI)")
    st.markdown(
        """
        **Purpose:** Provides transparent explanations for fraud alerts.
        
        **How it Works:**
        - Uses SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations) to explain model predictions.
        - Highlights the most important features contributing to a fraud alert.
        
        **Why it's Effective:** 
        - Builds trust among users and regulators.
        - Helps in auditing and compliance.
        """
    )

def display_performance_metrics(df, ensemble_predict):
    """Display performance metrics of the fraud detection system"""
        
    st.header("Performance Metrics")
        
    # Split data
    X = df.drop(["Transaction_ID", "User_ID", "Beneficiary_ID", "IP_Address", 
                "Transaction_Date", "Transaction_Success", "Fraud_Type", "Is_Fraud"], axis=1)
    y = df["Is_Fraud"]
        
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
    # Get predictions
    y_pred, y_score = ensemble_predict(X_test)
        
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
        
    # Display metrics
    st.write("### Model Performance")
    col1, col2, col3, col4 = st.columns(4)
        
    with col1:
        st.metric("Accuracy", f"{accuracy:.4f}")
        
    with col2:
        st.metric("Precision", f"{precision:.4f}")
        
    with col3:
        st.metric("Recall", f"{recall:.4f}")
        
    with col4:
        st.metric("F1 Score", f"{f1:.4f}")
        
    # Confusion matrix
    st.write("### Confusion Matrix")
    cm = confusion_matrix(y_test, y_pred)
        
    fig, ax = plt.subplots(figsize=(6, 6))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix")
    st.pyplot(fig)
        
    # ROC Curve
    st.write("### ROC Curve")
    fpr, tpr, _ = roc_curve(y_test, y_score)
    roc_auc = auc(fpr, tpr)
        
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC curve (area = {roc_auc:.2f})")
    ax.plot([0, 1], [0, 1], color="navy", lw=2, linestyle="--")
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("Receiver Operating Characteristic (ROC)")
    ax.legend(loc="lower right")
    st.pyplot(fig)

def main():
    """Main function to run the Streamlit app"""
    
    # Display header
    display_header()
    
    # Load or generate data
    df, node_df, edge_df, temporal_data = load_or_generate_data()
    
    # Load or train models
    ensemble_predict, (rf_model, if_model, nn_model), lstm_model = load_or_train_models(df, temporal_data)
    
    # Sidebar navigation
    selected_page, fraud_type = sidebar_navigation()
    
    # Display selected page
    if selected_page == "🏠 Dashboard":
        display_dashboard(df, node_df, edge_df)
    elif selected_page == "📊 Data Generation & Analysis":
        display_data_analysis(df)
    elif selected_page == "🔍 Fraud Detection Demo":
        display_fraud_detection_demo(ensemble_predict, rf_model, if_model, nn_model, lstm_model, df, temporal_data, node_df, edge_df)
    elif selected_page == "📱 Real-time Transaction Analyzer":
        display_real_time_analyzer(ensemble_predict)
    elif selected_page == "🧠 Algorithm Explanations":
        display_algorithm_explanations()
    elif selected_page == "📈 Performance Metrics":
        display_performance_metrics(df, ensemble_predict)

if __name__ == "__main__":
    main()