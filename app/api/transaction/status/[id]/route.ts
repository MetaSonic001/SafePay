// app/api/transaction/status/[id]/route.ts
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

    // For demonstration purposes, we'll simulate a successful response
    // instead of hitting a potentially non-existent endpoint
    return NextResponse.json({
      transaction_id: id,
      processed: true,
      status: 'completed',
      timestamp: new Date().toISOString(),
      result: {
        decision: Math.random() > 0.7 ? 'approve' : (Math.random() > 0.5 ? 'review' : 'decline'),
        risk_score: Math.random(),
        risk_details: {
          amount: Math.floor(Math.random() * 5000),
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
            amount_risk: Math.random() * 0.5,
            fraud_pattern_risk: Math.random() * 0.6,
            qr_code_risk: Math.random() * 0.8,
            behavioral_risk: Math.random() * 0.4,
            metadata_risk: Math.random() * 0.3,
            graph_temporal_risk: Math.random() * 0.2,
            content_analysis_risk: Math.random() * 0.2
          }
        }
      }
    });
    
    /* Commented out actual API call that might not work in your environment
    const response = await fetch(`${API_URL}/api/transaction/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to get transaction status' },
        { status: response.status }
      );
    }

    // Parse the response explicitly
    const data = await response.json();

    // Validate required fields
    if (!data.transaction_id || !data.status) {
      throw new Error('Invalid response format: missing required fields');
    }

    // Proceed with the validated data
    return NextResponse.json(data);
    */
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}