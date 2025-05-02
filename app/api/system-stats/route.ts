// app/api/system-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // For demonstration purposes, we'll simulate a response
    // instead of hitting a potentially non-existent endpoint
    return NextResponse.json({
      total_transactions: Math.floor(Math.random() * 10000) + 5000,
      fraud_detected: Math.floor(Math.random() * 500) + 100,
      system_health: "optimal",
      detection_rate: 0.925 + (Math.random() * 0.05),
      false_positive_rate: 0.02 + (Math.random() * 0.01),
      last_updated: new Date().toISOString(),
      fraud_trends: {
        qr_tampering: Math.floor(Math.random() * 100) + 20,
        account_takeover: Math.floor(Math.random() * 100) + 30,
        fake_upi: Math.floor(Math.random() * 100) + 25,
        device_spoofing: Math.floor(Math.random() * 100) + 15,
        other: Math.floor(Math.random() * 100) + 10
      },
      today_stats: {
        transactions: Math.floor(Math.random() * 1000) + 200,
        flagged: Math.floor(Math.random() * 50) + 10,
        approved: Math.floor(Math.random() * 900) + 180,
        declined: Math.floor(Math.random() * 20) + 5
      }
    });
    
    /* Commented out actual API call that might not work in your environment
    const response = await fetch(`${API_URL}/api/system-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache this request
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to get system stats' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
    */
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}