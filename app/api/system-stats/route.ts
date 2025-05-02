// app/api/system-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    // Make API call to Flask backend to get system stats
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
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}