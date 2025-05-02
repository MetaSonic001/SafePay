// app/api/transaction/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.sender_id || !data.receiver_id || !data.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: sender_id, receiver_id, amount' },
        { status: 400 }
      );
    }
    
    // Format the transaction data for the backend
    const transaction = {
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      amount: parseFloat(data.amount),
      txn_metadata: JSON.stringify({
        payment_url: data.payment_url || null,
        qr_code_data: data.qr_code_data || null,
        device_info: data.device_info || {},
        location: data.location || null,
        user_agent: data.user_agent || null,
        ip_address: data.ip_address || null,
        timestamp: new Date().toISOString()
      })
    };
    
    // Make API call to Flask backend
    const response = await fetch(`${API_URL}/api/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to process transaction' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}