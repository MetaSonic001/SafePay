import logging
import json
import re
import numpy as np
from urllib.parse import urlparse

class ContentAnalyzer:
    """
    Analyzes transaction content like URLs and QR codes for fraudulent patterns.
    """
    
    def __init__(self):
        """Initialize the analyzer"""
        # List of suspicious domain keywords
        self.suspicious_keywords = [
            'secure', 'verify', 'account', 'login', 'confirm', 'update', 'bank',
            'payment', 'wallet', 'authenticate', 'validate'
        ]
        
        # List of known phishing TLDs and suspicious domain patterns
        self.suspicious_tlds = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq']
        self.suspicious_patterns = [
            r'-?secure-?',
            r'-?verify-?',
            r'-?authenticate-?',
            r'[0-9]{5,}',  # Many digits in domain
            r'[a-zA-Z0-9]{25,}'  # Very long strings
        ]
        
        # List of legitimate payment domains to check against
        self.legitimate_domains = [
            'pay.google.com',
            'paypal.com',
            'secure.paypal.com',
            'upi.npci.org.in',
            'payments.amazon.com',
            'banking.icicibank.com',
            'onlinebanking.hdfcbank.com',
            'netbanking.sbi.co.in',
            'phonepe.com',
            'paytm.com',
            'bhimupi.npci.org.in'
        ]
    
    def _analyze_url(self, url):
        """
        Analyze a URL for phishing characteristics.
        
        Args:
            url (str): The URL to analyze
            
        Returns:
            tuple: (risk_score, risk_details)
        """
        # Initialize variables
        risk_score = 0.0
        risk_details = {
            'url': url,
            'is_https': False,
            'domain': '',
            'suspicious_domain': False,
            'domain_age_factor': 0.0,
            'contains_suspicious_keywords': False,
            'similar_to_legitimate': False,
            'suspicious_tld': False
        }
        
        try:
            # Parse the URL
            parsed_url = urlparse(url)
            
            # Check if HTTPS
            risk_details['is_https'] = parsed_url.scheme == 'https'
            if not risk_details['is_https']:
                risk_score += 0.3
            
            # Extract domain
            domain = parsed_url.netloc
            risk_details['domain'] = domain
            
            # Check for suspicious TLD
            if any(domain.endswith(tld) for tld in self.suspicious_tlds):
                risk_score += 0.3
                risk_details['suspicious_tld'] = True
            
            # Check for suspicious patterns in domain
            for pattern in self.suspicious_patterns:
                if re.search(pattern, domain):
                    risk_score += 0.2
                    risk_details['suspicious_domain'] = True
                    break
            
            # Check for suspicious keywords in domain
            if any(keyword in domain.lower() for keyword in self.suspicious_keywords):
                risk_score += 0.1
                risk_details['contains_suspicious_keywords'] = True
            
            # Check similarity to legitimate domains
            for legit_domain in self.legitimate_domains:
                # Simple Levenshtein-like similarity check
                if self._domain_similarity(domain.lower(), legit_domain.lower()) > 0.7:
                    if domain.lower() != legit_domain.lower():  # Not an exact match
                        risk_score += 0.4
                        risk_details['similar_to_legitimate'] = True
                        risk_details['similar_to'] = legit_domain
                        break
            
            # If URL has many subdomain levels, increase risk
            subdomain_count = domain.count('.')
            if subdomain_count > 2:
                risk_score += 0.1 * (subdomain_count - 2)
                
            # Normalize score
            risk_score = min(max(0.0, risk_score), 1.0)
            
        except Exception as e:
            logging.error(f"Error analyzing URL: {str(e)}")
            risk_score = 0.5  # Default to medium risk on error
            risk_details['error'] = str(e)
        
        return risk_score, risk_details
    
    def _domain_similarity(self, domain1, domain2):
        """
        Calculate similarity between two domains using a simple algorithm.
        
        Args:
            domain1 (str): First domain
            domain2 (str): Second domain
            
        Returns:
            float: Similarity score between 0 and 1
        """
        # Remove common prefixes like www.
        domain1 = re.sub(r'^www\.', '', domain1)
        domain2 = re.sub(r'^www\.', '', domain2)
        
        # Simple character-based similarity
        len1, len2 = len(domain1), len(domain2)
        if len1 == 0 or len2 == 0:
            return 0.0
            
        # Count matching characters
        matches = sum(c1 == c2 for c1, c2 in zip(domain1, domain2))
        
        # Calculate similarity ratio
        similarity = matches / max(len1, len2)
        
        return similarity
    
    def _analyze_qr_code(self, qr_data):
        """
        Analyze QR code data for tampering.
        
        Args:
            qr_data (dict): QR code data and txn_metadata
            
        Returns:
            tuple: (risk_score, risk_details)
        """
        risk_score = 0.0
        risk_details = {
            'tampering_detected': False,
            'original_receiver': '',
            'actual_receiver': '',
            'tampering_confidence': 0.0
        }
        
        try:
            # If tampering confidence is directly provided (for simulation)
            if 'tampering_confidence' in qr_data:
                tampering_confidence = float(qr_data['tampering_confidence'])
                risk_details['tampering_confidence'] = tampering_confidence
                risk_score = tampering_confidence
                
                if 'original_receiver' in qr_data and 'tampered_receiver' in qr_data:
                    risk_details['tampering_detected'] = True
                    risk_details['original_receiver'] = qr_data['original_receiver']
                    risk_details['actual_receiver'] = qr_data['tampered_receiver']
            
            # Else perform actual analysis if we have proper QR data
            elif 'payload' in qr_data and 'txn_metadata' in qr_data:
                # Check for discrepancies between txn_metadata and payload
                payload = qr_data['payload']
                txn_metadata = qr_data['txn_metadata']
                
                if 'receiver_id' in payload and 'receiver_id' in txn_metadata:
                    if payload['receiver_id'] != txn_metadata['receiver_id']:
                        risk_score = 0.9  # High risk if receiver IDs don't match
                        risk_details['tampering_detected'] = True
                        risk_details['original_receiver'] = txn_metadata['receiver_id']
                        risk_details['actual_receiver'] = payload['receiver_id']
                        risk_details['tampering_confidence'] = 0.9
                
                # Check for other signs of tampering
                if 'checksum' in txn_metadata and 'calculated_checksum' in qr_data:
                    if txn_metadata['checksum'] != qr_data['calculated_checksum']:
                        risk_score = max(risk_score, 0.8)
                        risk_details['tampering_detected'] = True
                        risk_details['checksum_mismatch'] = True
                        risk_details['tampering_confidence'] = max(
                            risk_details.get('tampering_confidence', 0.0),
                            0.8
                        )
        
        except Exception as e:
            logging.error(f"Error analyzing QR code: {str(e)}")
            risk_score = 0.5  # Default to medium risk on error
            risk_details['error'] = str(e)
        
        return risk_score, risk_details
    
    def analyze(self, transaction_data):
        """
        Analyze transaction txn_metadata for content-based fraud indicators.
        
        Args:
            transaction_data (dict): Transaction data including txn_metadata
            
        Returns:
            tuple: (risk_score, risk_details)
        """
        txn_metadata = transaction_data.get('txn_metadata', {})
        
        # Initialize scores and details
        url_score = 0.0
        qr_score = 0.0
        url_details = {}
        qr_details = {}
        
        # Check for payment URL in txn_metadata
        if 'payment_url' in txn_metadata:
            url_score, url_details = self._analyze_url(txn_metadata['payment_url'])
        
        # Check for QR code data in txn_metadata
        if 'qr_code_payload' in txn_metadata:
            qr_score, qr_details = self._analyze_qr_code(txn_metadata['qr_code_payload'])
        
        # Combine scores - take the higher risk from either URL or QR analysis
        combined_score = max(url_score, qr_score)
        
        # If we're simulating fraud, override with appropriate values
        if transaction_data.get('is_simulated', False):
            simulation_type = transaction_data.get('simulation_type', '')
            
            if simulation_type == 'phishing_url':
                combined_score = 0.85
                url_details = {
                    'url': txn_metadata.get('payment_url', ''),
                    'is_https': False,
                    'suspicious_domain': True,
                    'similar_to_legitimate': True,
                    'simulation': 'Simulated phishing URL detected'
                }
            
            elif simulation_type == 'qr_code_tampering':
                combined_score = 0.92
                qr_details = {
                    'tampering_detected': True,
                    'original_receiver': txn_metadata.get('qr_code_payload', {}).get('original_receiver', ''),
                    'actual_receiver': txn_metadata.get('qr_code_payload', {}).get('tampered_receiver', ''),
                    'tampering_confidence': 0.92,
                    'simulation': 'Simulated QR code tampering detected'
                }
        
        # Prepare combined details
        combined_details = {
            'url_analysis': url_details,
            'qr_analysis': qr_details,
            'content_risk_score': combined_score
        }
        
        return combined_score, combined_details