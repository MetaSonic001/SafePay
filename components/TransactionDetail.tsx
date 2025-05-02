"use client"
import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  Smartphone, 
  DollarSign,
  QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface TransactionDetailProps {
  transactionId: string
}

export default function TransactionDetail({ transactionId }: TransactionDetailProps) {
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [riskDetails, setRiskDetails] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await fetch(`/api/transaction/timeline/${transactionId}`);
        if (response.ok) {
          setTimeline(await response.json());
        }
      } catch (error) {
        console.error('Error fetching timeline:', error);
      }
    };
    
    if (transactionId) fetchTimeline();
  }, [transactionId]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true)
      
      try {
        // Fetch transaction status
        const transactionResponse = await fetch(`/api/transaction/status/${transactionId}`)
        
        if (!transactionResponse.ok) {
          throw new Error('Failed to fetch transaction details')
        }
        
        const transactionData = await transactionResponse.json()
        setTransaction(transactionData)
        
        // Fetch risk details if available
        try {
          const riskResponse = await fetch(`/api/transaction/risk-details/${transactionId}`)
          
          if (riskResponse.ok) {
            const riskData = await riskResponse.json()
            setRiskDetails(riskData)
          }
        } catch (riskErr) {
          console.error('Error fetching risk details:', riskErr)
        }
        
      } catch (err) {
        console.error('Error fetching transaction data:', err)
        setError('Failed to load transaction details')
      } finally {
        setLoading(false)
      }
    }
    
    if (transactionId) {
      fetchTransactionData()
    }
  }, [transactionId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <CardTitle className="text-red-600 dark:text-red-400">Error Loading Transaction</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300">{error || 'Transaction not found'}</p>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  // Determine transaction status styling
  const isFraud = transaction.status?.toLowerCase() === 'blocked' || 
                  transaction.is_fraud || 
                  (transaction.risk_score && transaction.risk_score > 75)
  
  const isWarning = transaction.status?.toLowerCase() === 'suspicious' || 
                   (transaction.risk_score && transaction.risk_score > 50 && transaction.risk_score <= 75)
  
  const statusColor = isFraud 
    ? 'bg-red-500 hover:bg-red-600' 
    : isWarning 
      ? 'bg-amber-500 hover:bg-amber-600' 
      : 'bg-green-500 hover:bg-green-600'
  
  const StatusIcon = isFraud ? AlertTriangle : ShieldCheck
  const statusIconColor = isFraud ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-green-500'

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Transaction Details</h1>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Transaction #{transaction.transaction_id}</CardTitle>
            <Badge className={statusColor}>
              {transaction.status || (isFraud ? 'Fraudulent' : isWarning ? 'Suspicious' : 'Completed')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4" />Amount
                </h3>
                <p className="text-lg font-bold">₹{transaction.amount || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />Date & Time
                </h3>
                <p>
                  {transaction.timestamp 
                    ? new Date(transaction.timestamp).toLocaleString() 
                    : 'N/A'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />Sender
                </h3>
                <p>{transaction.sender_id || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />Receiver
                </h3>
                <p>{transaction.receiver_id || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <Smartphone className="h-4 w-4" />Device Information
                </h3>
                <p>{transaction.device_info?.model || 'Unknown device'}</p>
                <p className="text-sm text-gray-500">{transaction.device_info?.os || 'Unknown OS'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />Location
                </h3>
                <p>{transaction.location?.current || 'Location not available'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                  <QrCode className="h-4 w-4" />QR Information
                </h3>
                <p className="text-sm break-all">{transaction.qr_code_data || 'No QR data available'}</p>
              </div>
            </div>
          </div>
          
          {riskDetails && (
            <>
              <Separator />
              
              <div>
                <h3 className="text-base font-medium mb-2 flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 ${statusIconColor}`} />
                  Risk Assessment
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Risk Score</h4>
                    <p className="text-lg font-bold">{riskDetails.risk_score || 'N/A'}/100</p>
                  </div>
                  
                  {riskDetails.reasons && riskDetails.reasons.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Risk Factors</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {riskDetails.reasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}