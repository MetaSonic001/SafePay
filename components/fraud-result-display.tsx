"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, ShieldCheck, AlertCircle, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TransactionResult {
  transaction_id?: string;
  processed?: boolean;
  status?: string;
  result?: {
    decision?: string;
    risk_score: number;
    risk_details?: {
      amount?: number;
      qr_analyzed?: boolean;
      device_analyzed?: boolean;
      location_analyzed?: boolean;
      metadata_analyzed?: boolean;
      user_stats?: {
        avg_amount?: number;
        percentile_95?: number;
        max_amount?: number;
        avg_daily_count?: number;
      };
      risk_breakdown?: Record<string, number>;
    };
  };
}

export default function FraudResultDisplay({ result }: { result: TransactionResult }) {
  const [statusData, setStatusData] = useState<TransactionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!result || !result.transaction_id) {
      setError("No valid transaction data found")
      setLoading(false)
      return
    }

    const fetchTransactionStatus = async () => {
      try {
        // First try to get the status directly from the result
        if (result.processed === true && result.status) {
          setStatusData(result)
          setLoading(false)
        } else {
          // If not processed, poll for updates
          const response = await fetch(`/api/transaction/status/${result.transaction_id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch transaction status')
          }
          const data = await response.json()
          setStatusData(data)
          setLoading(false)
        }
      } catch (err: unknown) {
        console.error("Error fetching transaction status:", err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setLoading(false)
      }
    }

    fetchTransactionStatus()
  }, [result])

  // Format risk score as percentage
  const formatRiskScore = (score: number | undefined | null): string => {
    if (score === undefined || score === null) return "N/A"
    return `${Math.round(score * 100)}%`
  }

  interface DecisionDisplayProps {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    text: string;
    badge: React.ReactNode;
  }

  const getDecisionDisplay = (decision: string): DecisionDisplayProps => {
    switch (decision) {
      case 'approve':
        return { 
          color: "text-green-600", 
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
          icon: <ShieldCheck className="h-6 w-6 text-green-600" />,
          text: "Transaction Approved",
          badge: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
        }
      case 'decline':
        return { 
          color: "text-red-600", 
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          text: "Transaction Declined",
          badge: <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>
        }
      case 'review':
        return { 
          color: "text-amber-600", 
          bgColor: "bg-amber-50 dark:bg-amber-950",
          borderColor: "border-amber-200 dark:border-amber-800",
          icon: <AlertCircle className="h-6 w-6 text-amber-600" />,
          text: "Transaction Needs Review",
          badge: <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Review</Badge>
        }
      default:
        return { 
          color: "text-gray-600", 
          bgColor: "bg-gray-50 dark:bg-gray-950",
          borderColor: "border-gray-200 dark:border-gray-800",
          icon: <AlertCircle className="h-6 w-6 text-gray-600" />,
          text: "Status Unknown",
          badge: <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>
        }
    }
  }

  interface RiskFactor {
    name: string;
    value: number;
  }

  const getRiskFactorDisplay = (name: string, value: number): React.ReactElement => {
    let textColor = "text-gray-600"
    let bgColor = "bg-gray-100"
    
    if (value > 0.7) {
      textColor = "text-red-700"
      bgColor = "bg-red-100"
    } else if (value > 0.4) {
      textColor = "text-amber-700"
      bgColor = "bg-amber-100"
    } else if (value > 0) {
      textColor = "text-green-700"
      bgColor = "bg-green-100"
    }
    
    return (
      <div key={name} className="flex items-center justify-between py-2">
        <span className="text-sm font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <Progress value={value * 100} className="w-24 h-2" />
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
            {Math.round(value * 100)}%
          </span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Processing transaction...</p>
            <p className="text-sm text-muted-foreground">This may take a few seconds</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-4" />
            <p className="text-lg font-medium">Error Processing Transaction</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!statusData || !statusData.result) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-8 w-8 text-amber-600 mb-4" />
            <p className="text-lg font-medium">No Data Available</p>
            <p className="text-sm text-muted-foreground">Transaction information is missing</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const decision = statusData.result.decision || statusData.status || "unknown"
  const riskScore = statusData.result.risk_score
  const riskDetails = statusData.result.risk_details || {}
  const riskBreakdown = riskDetails.risk_breakdown || {}
  const decisionDisplay = getDecisionDisplay(decision)
  
  return (
    <Card className="w-full">
      <CardHeader className={`${decisionDisplay.bgColor} ${decisionDisplay.borderColor} border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {decisionDisplay.icon}
            <CardTitle className={`text-lg ${decisionDisplay.color}`}>{decisionDisplay.text}</CardTitle>
          </div>
          {decisionDisplay.badge}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="summary">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score</span>
                <div className="flex items-center space-x-2">
                  <Progress value={riskScore * 100} className="w-32 h-3" />
                  <span className="font-semibold">{formatRiskScore(riskScore)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold mb-2">Risk Factors</h3>
                
                {Object.entries(riskBreakdown).map(([key, value]) => {
                  const name = key.replace(/_/g, ' ').replace(/risk/i, '').trim()
                  return getRiskFactorDisplay(name.charAt(0).toUpperCase() + name.slice(1), value)
                })}
                
                {Object.keys(riskBreakdown).length === 0 && (
                  <p className="text-sm text-muted-foreground">No detailed risk factors available</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Transaction ID</p>
                  <p className="text-xs text-muted-foreground truncate">{statusData.transaction_id}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-sm">{riskDetails.amount ? `₹${riskDetails.amount}` : 'N/A'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Analysis Performed</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant={riskDetails.qr_analyzed ? "default" : "outline"} className="justify-center">
                    QR Analysis
                  </Badge>
                  <Badge variant={riskDetails.device_analyzed ? "default" : "outline"} className="justify-center">
                    Device Analysis
                  </Badge>
                  <Badge variant={riskDetails.location_analyzed ? "default" : "outline"} className="justify-center">
                    Location Analysis
                  </Badge>
                  <Badge variant={riskDetails.metadata_analyzed ? "default" : "outline"} className="justify-center">
                    Metadata Analysis
                  </Badge>
                </div>
              </div>
              
              {riskDetails.user_stats && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">User Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Average Amount</p>
                        <p>₹{riskDetails.user_stats.avg_amount || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">95th Percentile</p>
                        <p>₹{riskDetails.user_stats.percentile_95 || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Max Amount</p>
                        <p>₹{riskDetails.user_stats.max_amount || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Daily Transactions</p>
                        <p>{riskDetails.user_stats.avg_daily_count || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}