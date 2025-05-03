import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid transaction data found' },
        { status: 400 }
      );
    }

    // Create a unique transaction ID
    const transactionId = `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Use the improved simulation function
    const result = simulateTransactionResult(data, transactionId);

    return NextResponse.json({
      transaction_id: transactionId,
      processed: true,
      status: result.decision,
      timestamp: new Date().toISOString(),
      result: result
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}


// Revised transaction simulation logic
function simulateTransactionResult(transactionData: any, transactionId: string) {
  // Extract all fraud factors from input data
  const qrManipulated = transactionData.txn_metadata?.qr_manipulated || false;
  const deviceChanged = transactionData.device_info?.device_changed || false;
  const locationChanged = transactionData.location?.changed || false;
  const highVelocity = transactionData.transaction_metadata?.high_velocity || false;
  const newBeneficiary = transactionData.transaction_metadata?.new_beneficiary || false;
  const loginAttempts = transactionData.transaction_metadata?.login_attempts_24hrs || 0;
  const linkSource = transactionData.transaction_metadata?.link_source || 'direct';
  const amountValue = parseFloat(transactionData.amount || '0');

  // Calculate individual risk factors
  const qrRisk = calculateQRRisk(transactionData.qr_code_data, qrManipulated);
  const deviceRisk = calculateDeviceRisk(deviceChanged);
  const locationRisk = calculateLocationRisk(locationChanged);
  const velocityRisk = calculateVelocityRisk(highVelocity);
  const beneficiaryRisk = calculateBeneficiaryRisk(newBeneficiary);
  const loginRisk = calculateLoginRisk(loginAttempts);
  const linkRisk = calculateLinkRisk(linkSource);
  const amountRisk = calculateAmountRisk(amountValue);

  // === Primary Fraud Detection Rules ===

  // 1. Clear fraud indicators that should trigger immediate decline
  const clearFraudIndicators = [
    // QR code has been tampered with or contains suspicious content
    qrManipulated ||
    (transactionData.qr_code_data &&
      (transactionData.qr_code_data.includes('fakehacker@fraud') ||
        transactionData.qr_code_data.includes('suspicious'))),

    // Multiple high-risk behaviors together
    (deviceChanged && loginAttempts > 3),
    (deviceChanged && locationChanged && highVelocity),
    (linkSource === 'whatsapp' && newBeneficiary && amountValue > 1000),

    // Excessive login attempts
    loginAttempts > 6
  ];

  // Decision based on clear fraud indicators
  if (clearFraudIndicators.some(indicator => indicator === true)) {
    return generateDeclineResult(transactionId, transactionData, 'high_confidence', {
      qrRisk, deviceRisk, locationRisk, velocityRisk,
      beneficiaryRisk, loginRisk, linkRisk, amountRisk
    });
  }

  // 2. Calculate weighted risk score for complex scenarios
  const riskWeights = {
    qr: 0.25,
    device: 0.15,
    location: 0.15,
    velocity: 0.10,
    beneficiary: 0.10,
    login: 0.10,
    link: 0.05,
    amount: 0.10
  };

  const weightedRiskScore = (
    qrRisk * riskWeights.qr +
    deviceRisk * riskWeights.device +
    locationRisk * riskWeights.location +
    velocityRisk * riskWeights.velocity +
    beneficiaryRisk * riskWeights.beneficiary +
    loginRisk * riskWeights.login +
    linkRisk * riskWeights.link +
    amountRisk * riskWeights.amount
  );

  // 3. Decision based on weighted risk score
  if (weightedRiskScore >= 0.65) {
    return generateDeclineResult(transactionId, transactionData, 'risk_score', {
      qrRisk, deviceRisk, locationRisk, velocityRisk,
      beneficiaryRisk, loginRisk, linkRisk, amountRisk
    });
  } else if (weightedRiskScore >= 0.4) {
    return generateReviewResult(transactionId, transactionData, {
      qrRisk, deviceRisk, locationRisk, velocityRisk,
      beneficiaryRisk, loginRisk, linkRisk, amountRisk
    });
  } else {
    return generateApproveResult(transactionId, transactionData, {
      qrRisk, deviceRisk, locationRisk, velocityRisk,
      beneficiaryRisk, loginRisk, linkRisk, amountRisk
    });
  }
}

// === Risk Calculation Functions ===

function calculateQRRisk(qrCodeData: string | undefined, qrManipulated: boolean): number {
  if (qrManipulated) return 0.95;
  if (!qrCodeData) return 0.05;

  if (qrCodeData.includes('fakehacker@fraud')) return 0.95;
  if (qrCodeData.includes('suspicious')) return 0.85;
  if (qrCodeData.includes('fake')) return 0.75;
  if (!qrCodeData.includes('legitimatemerchant@bank') &&
    !qrCodeData.includes('pa=')) return 0.65;

  return 0.05; // Normal QR code
}

function calculateDeviceRisk(deviceChanged: boolean): number {
  return deviceChanged ? 0.80 : 0.05;
}

function calculateLocationRisk(locationChanged: boolean): number {
  return locationChanged ? 0.70 : 0.05;
}

function calculateVelocityRisk(highVelocity: boolean): number {
  return highVelocity ? 0.75 : 0.05;
}

function calculateBeneficiaryRisk(newBeneficiary: boolean): number {
  return newBeneficiary ? 0.60 : 0.05;
}

function calculateLoginRisk(loginAttempts: number): number {
  if (loginAttempts > 6) return 0.90;
  if (loginAttempts > 4) return 0.75;
  if (loginAttempts > 2) return 0.40;
  if (loginAttempts > 0) return 0.15;
  return 0.05;
}

function calculateLinkRisk(linkSource: string): number {
  switch (linkSource) {
    case 'whatsapp': return 0.70;
    case 'email': return 0.60;
    case 'ad': return 0.50;
    case 'direct': return 0.05;
    default: return 0.30;
  }
}

function calculateAmountRisk(amount: number): number {
  if (amount > 5000) return 0.85;
  if (amount > 2000) return 0.65;
  if (amount > 1000) return 0.35;
  if (amount > 500) return 0.15;
  return 0.05;
}

// === Result Generation Functions ===

function generateDeclineResult(transactionId: string, transactionData: any, reason: string, risks: any) {
  const {
    qrRisk, deviceRisk, locationRisk, velocityRisk,
    beneficiaryRisk, loginRisk, linkRisk, amountRisk
  } = risks;

  const riskScore = Math.max(
    qrRisk, deviceRisk, locationRisk, velocityRisk,
    beneficiaryRisk, loginRisk, linkRisk, amountRisk
  );

  // Determine fraud type based on highest risk factor
  let fraudType = 'unknown';
  let detectionMethod = 'combined_factors';
  let confidence = riskScore;

  if (qrRisk > 0.7) {
    fraudType = 'qr_code_tampering';
    detectionMethod = 'payload_analysis';
  } else if (deviceRisk > 0.7 || locationRisk > 0.7) {
    fraudType = 'account_takeover';
    detectionMethod = 'behavioral_analysis';
  } else if (linkRisk > 0.5 && risks.newBeneficiary) {
    fraudType = 'fake_upi';
    detectionMethod = 'pattern_recognition';
  } else if (velocityRisk > 0.7 && loginRisk > 0.5) {
    fraudType = 'device_spoofing';
    detectionMethod = 'behavioral_anomaly';
  }

  return {
    transaction_id: transactionId,
    decision: 'decline',
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
        metadata_risk: (velocityRisk + beneficiaryRisk + loginRisk + linkRisk) / 4,
        amount_risk: amountRisk,
        fraud_pattern_risk: riskScore * 0.9,
        graph_temporal_risk: velocityRisk * 0.8,
        content_analysis_risk: qrRisk * 0.9
      }
    },
    fraud_details: {
      type: fraudType,
      confidence: confidence,
      detection_method: detectionMethod,
      decline_reason: reason,
      device_changed: !!transactionData.device_info?.device_changed,
      location_changed: !!transactionData.location?.changed,
      login_attempts: transactionData.transaction_metadata?.login_attempts_24hrs || 0,
      new_beneficiary: !!transactionData.transaction_metadata?.new_beneficiary,
      link_source: transactionData.transaction_metadata?.link_source || 'direct',
      transaction_velocity: transactionData.transaction_metadata?.high_velocity ? 'high' : 'normal'
    }
  };
}

function generateReviewResult(transactionId: string, transactionData: any, risks: any) {
  const {
    qrRisk, deviceRisk, locationRisk, velocityRisk,
    beneficiaryRisk, loginRisk, linkRisk, amountRisk
  } = risks;

  const avgRisk = (
    qrRisk + deviceRisk + locationRisk + velocityRisk +
    beneficiaryRisk + loginRisk + linkRisk + amountRisk
  ) / 8;

  return {
    transaction_id: transactionId,
    decision: 'review',
    risk_score: avgRisk,
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
        metadata_risk: (velocityRisk + beneficiaryRisk + loginRisk + linkRisk) / 4,
        amount_risk: amountRisk,
        fraud_pattern_risk: 0.3,
        graph_temporal_risk: 0.3,
        content_analysis_risk: 0.3
      }
    },
    review_reason: identifyTopRiskFactors(risks)
  };
}

function generateApproveResult(transactionId: string, transactionData: any, risks: any) {
  const {
    qrRisk, deviceRisk, locationRisk, velocityRisk,
    beneficiaryRisk, loginRisk, linkRisk, amountRisk
  } = risks;

  const avgRisk = (
    qrRisk + deviceRisk + locationRisk + velocityRisk +
    beneficiaryRisk + loginRisk + linkRisk + amountRisk
  ) / 8;

  return {
    transaction_id: transactionId,
    decision: 'approve',
    risk_score: avgRisk,
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
        metadata_risk: (velocityRisk + beneficiaryRisk + loginRisk + linkRisk) / 4,
        amount_risk: amountRisk,
        fraud_pattern_risk: 0.05,
        graph_temporal_risk: 0.05,
        content_analysis_risk: 0.05
      }
    }
  };
}

function identifyTopRiskFactors(risks: any) {
  const riskFactors = [
    { name: 'QR code', value: risks.qrRisk },
    { name: 'Device change', value: risks.deviceRisk },
    { name: 'Location change', value: risks.locationRisk },
    { name: 'Transaction velocity', value: risks.velocityRisk },
    { name: 'New beneficiary', value: risks.beneficiaryRisk },
    { name: 'Login attempts', value: risks.loginRisk },
    { name: 'Link source', value: risks.linkRisk },
    { name: 'Transaction amount', value: risks.amountRisk }
  ];

  // Sort by risk value descending
  riskFactors.sort((a, b) => b.value - a.value);

  // Return top 3 risk factors
  return riskFactors.slice(0, 3).map(factor => ({
    factor: factor.name,
    risk_level: factor.value > 0.7 ? 'high' : factor.value > 0.4 ? 'medium' : 'low'
  }));
}