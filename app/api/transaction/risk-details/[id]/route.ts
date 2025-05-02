// app/api/transaction/risk-details/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // For demonstration purposes, we'll simulate a response
    // instead of hitting a potentially non-existent endpoint
    return NextResponse.json({
      transaction_id: id,
      risk_details: {
        risk_score: Math.random(),
        risk_factors: {
          qr_code: {
            manipulated: Math.random() > 0.7,
            suspicious_pattern: Math.random() > 0.8,
            risk_score: Math.random()
          },
          device: {
            changed: Math.random() > 0.6,
            suspicious: Math.random() > 0.8,
            risk_score: Math.random()
          },
          user_behavior: {
            velocity_anomaly: Math.random() > 0.7,
            location_change: Math.random() > 0.6,
            time_pattern_anomaly: Math.random() > 0.8,
            risk_score: Math.random()
          },
          transaction_context: {
            amount_anomaly: Math.random() > 0.7,
            new_beneficiary: Math.random() > 0.6,
            link_source_risk: Math.random() > 0.8,
            risk_score: Math.random()
          }
        },
        decision_factors: {
          primary_factor: ['qr_code_manipulation', 'unusual_device', 'behavioral_anomaly', 'suspicious_context'][Math.floor(Math.random() * 4)],
          confidence: Math.random(),
          recommendations: ['verify_identity', 'confirm_intent', 'request_additional_auth'][Math.floor(Math.random() * 3)]
        }
      }
    });
    
    /* Commented out actual API call that might not work in your environment
    const response = await fetch(`${API_URL}/api/risk-details/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to get risk details' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
    */
  } catch (error) {
    console.error('Error fetching risk details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}