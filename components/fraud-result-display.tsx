"use client"

import { 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Shield, 
  AlertCircle,
  CheckCircle, 
  ArrowRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface FraudResultDisplayProps {
  result: {
    transaction_id?: string
    is_fraud?: boolean
    status?: string
    risk_score?: number
    reasons?: string[]
    error?: string
  }
}

export default function FraudResultDisplay({ result }: FraudResultDisplayProps) {
  if (result.error) {
    return (
      <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Processing Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300">{result.error}</p>
        </CardContent>
      </Card>
    )
  }

  // Determine status display
  const isFraud = result.is_fraud || result.status?.toLowerCase() === 'blocked' || 
                (result.risk_score && result.risk_score > 75)
  
  const isWarning = result.status?.toLowerCase() === 'suspicious' || 
                  (result.risk_score && result.risk_score > 50 && result.risk_score <= 75)
  
  const statusDisplay = isFraud 
    ? 'Fraudulent' 
    : isWarning 
      ? 'Suspicious' 
      : 'Safe'
  
  const riskScore = result.risk_score || (isFraud ? 85 : isWarning ? 65 : 20)
  
  // Style based on status
  const cardBg = isFraud 
    ? 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800' 
    : isWarning 
      ? 'border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800' 
      : 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800'
  
  const titleColor = isFraud 
    ? 'text-red-600 dark:text-red-400' 
    : isWarning 
      ? 'text-amber-600 dark:text-amber-400' 
      : 'text-green-600 dark:text-green-400'

  const StatusIcon = isFraud 
    ? AlertTriangle 
    : isWarning 
      ? Info 
      : ShieldCheck
  
  const progressColor = isFraud 
    ? 'bg-red-500' 
    : isWarning 
      ? 'bg-amber-500' 
      : 'bg-green-500'

  const badgeColor = isFraud 
    ? 'bg-red-500 hover:bg-red-600' 
    : isWarning 
      ? 'bg-amber-500 hover:bg-amber-600' 
      : 'bg-green-500 hover:bg-green-600'

  return (
    <div className="space-y-6">
      <Card className={cardBg}>
        <CardHeader className="pb-2">
          <CardTitle className={`${titleColor} flex items-center`}>
            <StatusIcon className="h-5 w-5 mr-2" />
            {isFraud 
              ? "Fraudulent Transaction Detected" 
              : isWarning 
                ? "Suspicious Transaction" 
                : "Transaction Appears Safe"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Status</p>
              <p className="text-lg font-medium">
                <Badge className={badgeColor}>
                  {statusDisplay}
                </Badge>
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
              <p className="text-lg font-medium">{result.transaction_id || "TXN12345678"}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
              <p className="text-sm font-bold">{riskScore}/100</p>
            </div>
            <Progress value={riskScore} className="h-2" indicatorClassName={progressColor} />
          </div>

          {(result.reasons && result.reasons.length > 0) && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Detection Reasons</p>
              <ul className="space-y-2">
                {result.reasons.map((reason, index) => (
                  <li 
                    key={index}
                    className={`text-sm px-3 py-2 rounded ${
                      isFraud 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : isWarning 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        {result.transaction_id && (
          <CardFooter className="flex justify-end">
            <Link href={`/transaction/${result.transaction_id}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                View Details <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>
      
      {/* Transaction Timeline Card */}
      {(isFraud || isWarning) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fraud Detection Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              <li className="mb-6 ml-4">
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                <time className="mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">Just now</time>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction Initiated</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">User attempted payment transaction</p>
              </li>
              <li className="mb-6 ml-4">
                <div className="absolute w-3 h-3 bg-amber-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-amber-700"></div>
                <time className="mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">1 second ago</time>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">Risk Factors Identified</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">System detected multiple risk signals</p>
              </li>
              <li className="ml-4">
                <div className={`absolute w-3 h-3 ${isFraud ? 'bg-red-500' : 'bg-green-500'} rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900`}></div>
                <time className="mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">2 seconds ago</time>
                <h3 className={`text-sm font-semibold ${isFraud ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {isFraud ? 'Transaction Blocked' : 'Transaction Flagged for Review'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isFraud ? 'Payment prevented based on high risk score' : 'Payment proceeding with additional verification'}
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}