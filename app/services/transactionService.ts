// app/services/transactionService.ts

/**
 * Service for interacting with the transaction API
 */
export interface TransactionRequest {
    sender_id: string;
    receiver_id: string;
    amount: number;
    payment_url?: string;
    qr_code_data?: string;
    device_info?: any;
    location?: { latitude: number; longitude: number };
    user_agent?: string;
    ip_address?: string;
  }
  
  export interface TransactionResponse {
    transaction_id: string;
    status: 'pending' | 'processing' | 'approved' | 'blocked' | 'pending_verification';
    risk_score?: number;
    message?: string;
  }
  
  export interface TransactionStatus {
    transaction_id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    timestamp: string;
    status: 'pending' | 'processing' | 'approved' | 'blocked' | 'pending_verification';
    risk_score: number;
    processed: boolean;
  }
  
  export interface RiskDetails {
    transaction_id: string;
    risk_score: number;
    status: string;
    graph_temporal_score: number;
    content_analysis_score: number;
    risk_details: {
      content_analysis: any;
      graph_temporal: any;
      dynamic_adjustments?: any;
    };
    explanation: {
      summary: string;
      key_factors: string[];
      recommendations: string[];
    };
  }
  
  export interface SystemStats {
    system_stats: {
      transactions_24h: number;
      blocked_24h: number;
      pending_verification_24h: number;
      fraud_rate_percentage: number;
      transaction_volume_24h: number;
      last_threshold_update: string;
    };
    current_thresholds: any;
  }
  
  /**
   * Submit a new transaction for fraud detection
   */
  export async function submitTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process transaction');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }
  
  /**
   * Get the status of a transaction
   */
  export async function getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      const response = await fetch(`/api/transaction/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get transaction status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed risk analysis for a transaction
   */
  export async function getTransactionRiskDetails(transactionId: string): Promise<RiskDetails> {
    try {
      const response = await fetch(`/api/transaction/risk-details/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get risk details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting risk details:', error);
      throw error;
    }
  }
  
  /**
   * Get system statistics and current rule thresholds
   */
  export async function getSystemStats(): Promise<SystemStats> {
    try {
      const response = await fetch('/api/system-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Don't cache this request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get system stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }