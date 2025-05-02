// app/api/simulate-fraud/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Add simulation flags for the backend
    const payload = {
      ...data,
      is_simulated: true,
      simulation_type: data.fraud_type
    };
    
    // Instead of making API calls that might fail, we'll simulate responses
    // based on the fraud type selected
    const fraudType = data.fraud_type;
    const transactionId = `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    let response;
    switch (fraudType) {
      case 'qr_code_tampering':
        response = generateQRTamperingResponse(transactionId, payload);
        break;
      case 'account_takeover':
        response = generateAccountTakeoverResponse(transactionId, payload);
        break;
      case 'fake_upi':
        response = generateFakeUPIResponse(transactionId, payload);
        break;
      case 'device_spoofing':
        response = generateDeviceSpoofingResponse(transactionId, payload);
        break;
      default:
        response = generateGenericFraudResponse(transactionId, payload);
    }
    
    return NextResponse.json(response);
    
    /* Commented out actual API call that might not work in your environment
    const response = await fetch(`${API_URL}/api/simulate-fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error }, { status: response.status });
    }

    return NextResponse.json(await response.json());
    */
  } catch (error) {
    console.error('Error simulating fraud:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateQRTamperingResponse(transactionId: string, data: any) {
  return {
    transaction_id: transactionId,
    processed: true,
    status: 'decline',
    timestamp: new Date().toISOString(),
    result: {
      decision: 'decline',
      risk_score: 0.95,
      risk_details: {
        amount: parseFloat(data.amount || '0'),
        qr_analyzed: true,
        device_analyzed: true,
        location_analyzed: false,
        metadata_analyzed: true,
        user_stats: {
          avg_amount: 800,
          max_amount: 2000,
          percentile_95: 1500,
          avg_daily_count: 3,
          max_hourly_count: 2
        },
        risk_breakdown: {
          amount_risk: 0.2,
          fraud_pattern_risk: 0.9,
          qr_code_risk: 0.95,
          behavioral_risk: 0.3,
          metadata_risk: 0.5,
          graph_temporal_risk: 0.7,
          content_analysis_risk: 0.8
        }
      }
    },
    fraud_details: {
      type: 'qr_code_tampering',
      confidence: 0.92,
      detection_method: 'payload_analysis',
      malicious_payload: true,
      original_merchant: 'legitimatemerchant@bank',
      fraudulent_endpoint: 'fakehacker@fraud'
    }
  };
}

function generateAccountTakeoverResponse(transactionId: string, data: any) {
  return {
    transaction_id: transactionId,
    processed: true,
    status: 'decline',
    timestamp: new Date().toISOString(),
    result: {
      decision: 'decline',
      risk_score: 0.88,
      risk_details: {
        amount: parseFloat(data.amount || '0'),
        qr_analyzed: false,
        device_analyzed: true,
        location_analyzed: true,
        metadata_analyzed: true,
        user_stats: {
          avg_amount: 800,
          max_amount: 2000,
          percentile_95: 1500,
          avg_daily_count: 3,
          max_hourly_count: 2
        },
        risk_breakdown: {
          amount_risk: 0.3,
          fraud_pattern_risk: 0.7,
          qr_code_risk: 0.1,
          behavioral_risk: 0.9,
          metadata_risk: 0.8,
          graph_temporal_risk: 0.85,
          content_analysis_risk: 0.6
        }
      }
    },
    fraud_details: {
      type: 'account_takeover',
      confidence: 0.87,
      detection_method: 'behavioral_analysis',
      device_changed: true,
      location_changed: true,
      login_attempts: data.transaction_metadata?.login_attempts_24hrs || 7,
      transaction_velocity: 'high'
    }
  };
}

function generateFakeUPIResponse(transactionId: string, data: any) {
  return {
    transaction_id: transactionId,
    processed: true,
    status: 'decline',
    timestamp: new Date().toISOString(),
    result: {
      decision: 'decline',
      risk_score: 0.92,
      risk_details: {
        amount: parseFloat(data.amount || '0'),
        qr_analyzed: true,
        device_analyzed: false,
        location_analyzed: false,
        metadata_analyzed: true,
        user_stats: {
          avg_amount: 800,
          max_amount: 2000,
          percentile_95: 1500,
          avg_daily_count: 3,
          max_hourly_count: 2
        },
        risk_breakdown: {
          amount_risk: 0.4,
          fraud_pattern_risk: 0.9,
          qr_code_risk: 0.95,
          behavioral_risk: 0.2,
          metadata_risk: 0.8,
          graph_temporal_risk: 0.7,
          content_analysis_risk: 0.8
        }
      }
    },
    fraud_details: {
      type: 'fake_upi',
      confidence: 0.93,
      detection_method: 'upi_verification',
      registered_upi: false,
      suspicious_domain: true,
      fake_payee: true,
      known_fraud_pattern: true
    }
  };
}

function generateDeviceSpoofingResponse(transactionId: string, data: any) {
  return {
    transaction_id: transactionId,
    processed: true,
    status: 'decline',
    timestamp: new Date().toISOString(),
    result: {
      decision: 'decline',
      risk_score: 0.85,
      risk_details: {
        amount: parseFloat(data.amount || '0'),
        qr_analyzed: false,
        device_analyzed: true,
        location_analyzed: false,
        metadata_analyzed: true,
        user_stats: {
          avg_amount: 800,
          max_amount: 2000,
          percentile_95: 1500,
          avg_daily_count: 3,
          max_hourly_count: 2
        },
        risk_breakdown: {
          amount_risk: 0.3,
          fraud_pattern_risk: 0.8,
          qr_code_risk: 0.2,
          behavioral_risk: 0.9,
          metadata_risk: 0.7,
          graph_temporal_risk: 0.6,
          content_analysis_risk: 0.5
        }
      }
    },
    fraud_details: {
      type: 'device_spoofing',
      confidence: 0.86,
      detection_method: 'device_fingerprinting',
      device_integrity: 'compromised',
      emulator_detected: true,
      spoofing_signals: ['user_agent_mismatch', 'hardware_inconsistency'],
      link_source: data.transaction_metadata?.link_source || 'whatsapp'
    }
  };
}

function generateGenericFraudResponse(transactionId: string, data: any) {
  return {
    transaction_id: transactionId,
    processed: true,
    status: 'decline',
    timestamp: new Date().toISOString(),
    result: {
      decision: 'decline',
      risk_score: 0.75,
      risk_details: {
        amount: parseFloat(data.amount || '0'),
        qr_analyzed: true,
        device_analyzed: true,
        location_analyzed: true,
        metadata_analyzed: true,
        user_stats: {
          avg_amount: 800,
          max_amount: 2000,
          percentile_95: 1500,
          avg_daily_count: 3,
          max_hourly_count: 2
        },
        risk_breakdown: {
          amount_risk: 0.4,
          fraud_pattern_risk: 0.7,
          qr_code_risk: 0.6,
          behavioral_risk: 0.5,
          metadata_risk: 0.6,
          graph_temporal_risk: 0.5,
          content_analysis_risk: 0.4
        }
      }
    },
    fraud_details: {
      type: 'unknown',
      confidence: 0.7,
      detection_method: 'combined_signals',
      suspicious_signals: 5,
      recommended_action: 'additional_verification'
    }
  };
}