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
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }