import { NextResponse } from 'next/server';

const FLASK_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Forward to Flask API
    const flaskResponse = await fetch(`${FLASK_API_URL}/api/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!flaskResponse.ok) {
      const errorData = await flaskResponse.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to process transaction' },
        { status: flaskResponse.status }
      );
    }

    const flaskData = await flaskResponse.json();

    if (flaskData.transaction_id) {
      // For demo purposes, we'll simulate the processing
      // and return a response immediately with fraud analysis
      
      // Create a result with risk details based on the submitted data
      const result = simulateTransactionResult(data);
      
      return NextResponse.json({
        transaction_id: flaskData.transaction_id,
        processed: true,
        status: result.decision,
        result: result
      });
    }

    return NextResponse.json(flaskData);
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to simulate transaction results
function simulateTransactionResult(transactionData: any) {
  // Generate risk factors based on the input data
  const qrManipulated = transactionData.txn_metadata?.qr_manipulated || false;
  const deviceChanged = transactionData.device_info?.device_changed || false;
  const locationChanged = transactionData.location?.changed || false;
  const highVelocity = transactionData.transaction_metadata?.high_velocity || false;
  const newBeneficiary = transactionData.transaction_metadata?.new_beneficiary || false;
  const loginAttempts = transactionData.transaction_metadata?.login_attempts_24hrs || 0;
  const linkSource = transactionData.transaction_metadata?.link_source || 'direct';
  
  // Calculate risk scores for different components
  const qrRisk = qrManipulated ? 0.8 : 
                 (transactionData.qr_code_data?.includes('fakehacker@fraud') ? 0.9 : 
                 (transactionData.qr_code_data?.includes('suspicious') ? 0.7 : 0.1));
  
  const deviceRisk = deviceChanged ? 0.6 : 0.1;
  const locationRisk = locationChanged ? 0.5 : 0.1;
  const metadataRisk = calculateMetadataRisk(highVelocity, newBeneficiary, loginAttempts, linkSource);
  
  // Calculate total risk score
  const riskScore = (qrRisk * 0.4 + deviceRisk * 0.2 + locationRisk * 0.2 + metadataRisk * 0.2);
  
  // Determine decision based on risk score
  let decision = 'approve';
  if (riskScore >= 0.7) {
    decision = 'decline';
  } else if (riskScore >= 0.4) {
    decision = 'review';
  }
  
  return {
    decision: decision,
    risk_score: riskScore,
    risk_details: {
      amount: parseFloat(transactionData.amount || '0'),
      qr_analyzed: !!transactionData.qr_code_data,
      device_analyzed: !!transactionData.device_info,
      location_analyzed: !!transactionData.location,
      metadata_analyzed: !!transactionData.transaction_metadata,
      user_stats: {
        avg_amount: 800,
        max_amount: 2000,
        percentile_95: 1500,
        avg_daily_count: 3,
        max_hourly_count: 2
      },
      risk_breakdown: {
        qr_code_risk: qrRisk,
        behavioral_risk: (deviceRisk + locationRisk) / 2,
        metadata_risk: metadataRisk,
        amount_risk: calculateAmountRisk(transactionData.amount),
        fraud_pattern_risk: qrManipulated ? 0.7 : 0.2,
        graph_temporal_risk: 0.3,
        content_analysis_risk: 0.2
      }
    }
  };
}

function calculateMetadataRisk(highVelocity: boolean, newBeneficiary: boolean, loginAttempts: number, linkSource: string) {
  let risk = 0;
  
  if (highVelocity) risk += 0.3;
  if (newBeneficiary) risk += 0.2;
  if (loginAttempts > 5) risk += 0.4;
  if (linkSource && linkSource !== 'direct') risk += 0.2;
  
  return Math.min(risk, 0.9); // Cap at 0.9
}

function calculateAmountRisk(amount: string) {
  const amountValue = parseFloat(amount || '0');
  if (amountValue > 2000) return 0.7;
  if (amountValue > 1500) return 0.5;
  if (amountValue > 1000) return 0.3;
  return 0.1;
}