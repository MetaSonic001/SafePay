// lib/risk-engine.ts
// Converted from the Python RiskEngine to TypeScript

class Config {
    static GRAPH_TEMPORAL_WEIGHT = 0.5;
    static CONTENT_ANALYSIS_WEIGHT = 0.5;
    static LOW_RISK_THRESHOLD = 0.3;
    static MEDIUM_RISK_THRESHOLD = 0.6;
    static HIGH_RISK_THRESHOLD = 0.8;
  }
  
  export class RiskEngine {
    private graph_temporal_weight: number;
    private content_analysis_weight: number;
    private low_risk_threshold: number;
    private medium_risk_threshold: number;
    private high_risk_threshold: number;
  
    constructor() {
      // Load config
      this.graph_temporal_weight = Config.GRAPH_TEMPORAL_WEIGHT;
      this.content_analysis_weight = Config.CONTENT_ANALYSIS_WEIGHT;
      
      // Risk thresholds
      this.low_risk_threshold = Config.LOW_RISK_THRESHOLD;
      this.medium_risk_threshold = Config.MEDIUM_RISK_THRESHOLD;
      this.high_risk_threshold = Config.HIGH_RISK_THRESHOLD;
    }
  
    private _get_user_transaction_stats(user_id: string) {
      // Mocked transaction stats for simulation purposes
      const stats = {
        'avg_amount': 800,
        'max_amount': 2000,
        'percentile_95': 1500,
        'avg_daily_count': 3,
        'max_hourly_count': 2
      };
      
      // For specific user simulations
      if (user_id === "high_risk_user") {
        stats['percentile_95'] = 500;  // Lower threshold to trigger high risk
      }
      
      return stats;
    }
  
    private _check_global_fraud_trends(transaction_data: any) {
      let risk_factor = 0.0;
      
      // Detect QR code tampering
      const txn_metadata = transaction_data.txn_metadata || {};
      if (txn_metadata.qr_manipulated) {
        risk_factor += 0.4;
      }
      
      // Check for device changes combined with other factors
      const device_info = transaction_data.device_info || {};
      if (device_info.device_changed) {
        risk_factor += 0.2;
        
        // Higher risk if location also changed
        const location = transaction_data.location || {};
        if (location.changed) {
          risk_factor += 0.2;
        }
      }
      
      // Check sender against known patterns
      const sender_id = transaction_data.sender_id;
      if (sender_id === "user123" && transaction_data.is_simulated) {
        risk_factor += 0.3;
      }
      
      // Check receiver against suspicious list
      const receiver_id = transaction_data.receiver_id;
      const suspicious_receivers = ["merchant999", "fakepayee", "merchant456"];
      if (suspicious_receivers.includes(receiver_id)) {
        risk_factor += 0.2;
      }
      
      // Check for payment URL patterns
      const payment_url = transaction_data.payment_url;
      if (payment_url && payment_url.includes("example.com")) {
        risk_factor += 0.1;
      }
      
      return Math.min(risk_factor, 0.8);  // Cap at 0.8
    }
  
    calculate_risk(
      graph_temporal_score: number, 
      content_analysis_score: number, 
      transaction_data: any, 
      graph_temporal_details: any = null, 
      content_analysis_details: any = null
    ) {
      try {
        // Extract and convert amount to float
        const amount = parseFloat(transaction_data.amount || '0');
        const user_id = transaction_data.user_id || transaction_data.sender_id || '';
        
        // Get user stats
        const user_stats = this._get_user_transaction_stats(user_id);
        
        // Check for simulated fraud
        const is_simulated = transaction_data.is_simulated || false;
        const simulation_type = transaction_data.simulation_type || '';
        
        // Base risk calculation
        let base_risk = 0.1;  // Default low risk
        
        // Amount risk - compare with user's history
        let amount_risk = 0.0;
        if (user_stats.percentile_95 > 0) {
          if (amount > user_stats.percentile_95 * 2) {
            amount_risk = 0.7;
          } else if (amount > user_stats.percentile_95) {
            amount_risk = 0.4;
          } else if (amount > user_stats.avg_amount * 1.5) {
            amount_risk = 0.2;
          }
        }
        
        // Check for fraud patterns
        const fraud_pattern_risk = this._check_global_fraud_trends(transaction_data);
        
        // Check for QR code tampering specifically
        const qr_code_data = transaction_data.qr_code_data || '';
        let qr_risk = 0.0;
        if (qr_code_data && qr_code_data.includes("fakehacker@fraud")) {
          qr_risk = 0.9;
        } else if (qr_code_data && qr_code_data.includes("suspicious")) {
          qr_risk = 0.7;
        }
        
        // Device and location risk
        const device_info = transaction_data.device_info || {};
        const location = transaction_data.location || {};
        let behavioral_risk = 0.0;
        
        if (device_info.device_changed && location.changed) {
          behavioral_risk = 0.6;
        } else if (device_info.device_changed) {
          behavioral_risk = 0.3;
        } else if (location.changed) {
          behavioral_risk = 0.2;
        }
        
        // Transaction metadata risk
        const metadata = transaction_data.transaction_metadata || {};
        let metadata_risk = 0.0;
        
        if (metadata.high_velocity) {
          metadata_risk += 0.3;
        }
        if (metadata.new_beneficiary) {
          metadata_risk += 0.2;
        }
        if ((metadata.login_attempts_24hrs || 0) > 5) {
          metadata_risk += 0.4;
        }
        if (['whatsapp', 'email', 'ad'].includes(metadata.link_source)) {
          metadata_risk += 0.2;
        }
        
        // Simulated fraud scenarios
        if (is_simulated) {
          if (simulation_type === 'qr_code_tampering') {
            qr_risk = 0.9;
          } else if (simulation_type === 'account_takeover') {
            behavioral_risk = 0.8;
          } else if (simulation_type === 'fake_upi') {
            qr_risk = 0.7;
            metadata_risk = 0.5;
          } else if (simulation_type === 'device_spoofing') {
            behavioral_risk = 0.6;
          }
        }
        
        // Combine all risk factors with weights
        const risk_score = (
          base_risk * 0.1 +
          amount_risk * 0.2 +
          fraud_pattern_risk * 0.2 +
          qr_risk * 0.3 +
          behavioral_risk * 0.2 +
          metadata_risk * 0.2 +
          graph_temporal_score * 0.1 +
          content_analysis_score * 0.1
        ) / 1.4;  // Normalize by sum of weights
        
        // Cap risk score between 0 and 1
        const finalRiskScore = Math.max(0.0, Math.min(1.0, risk_score));
        
        // Determine decision
        let decision = 'approve';
        if (finalRiskScore >= this.high_risk_threshold) {
          decision = 'decline';
        } else if (finalRiskScore >= this.medium_risk_threshold) {
          decision = 'review';
        }
        
        // Provide detailed risk factors
        const risk_details = {
          risk_breakdown: {
            amount_risk: amount_risk,
            fraud_pattern_risk: fraud_pattern_risk,
            qr_code_risk: qr_risk,
            behavioral_risk: behavioral_risk,
            metadata_risk: metadata_risk,
            graph_temporal_risk: graph_temporal_score,
            content_analysis_risk: content_analysis_score
          },
          user_stats: user_stats,
          amount: amount,
          qr_analyzed: Boolean(qr_code_data),
          device_analyzed: Boolean(Object.keys(device_info).length),
          location_analyzed: Boolean(Object.keys(location).length),
          metadata_analyzed: Boolean(Object.keys(metadata).length)
        };
        
        return [finalRiskScore, decision, risk_details];
      } catch (error) {
        console.error(`Error in risk calculation: ${error}`);
        // Return safe fallback
        return [0.5, 'review', { error: String(error) }];
      }
    }
  }