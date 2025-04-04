import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Share2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  ShieldAlert,
  Info,
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
} from "lucide-react"
import { transactions } from "@/lib/data"
import TransactionStatus from "@/components/transaction-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FraudRiskIndicator from "@/components/fraud-risk-indicator"

export default function TransactionDetailPage({ params }: { params: { id: string } }) {
  const transaction = transactions.find((t) => t.id === params.id)

  if (!transaction) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-lg font-medium">Transaction not found</p>
        <Link href="/transactions" className="mt-4">
          <Button>Back to Transactions</Button>
        </Link>
      </div>
    )
  }

  const isSent = transaction.sender === "Shaun"

  // Determine if we should show fraud details based on status
  const showFraudDetails = transaction.status === "Suspicious" || transaction.status === "Blocked"

  // Get location data (in a real app, this would come from the transaction)
  const locationData = {
    city: "Mumbai",
    device: "iPhone 13",
    ipAddress: "192.168.1.XX",
    time: transaction.time,
  }

  return (
    <main className="flex min-h-screen flex-col items-center pb-20">
      <div className="w-full max-w-md px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/transactions">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Transaction Details</h1>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {transaction.status === "Success" && (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            {transaction.status === "Suspicious" && (
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            )}
            {transaction.status === "Blocked" && (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          <p className={`text-2xl font-bold ${isSent ? "text-red-500" : "text-green-500"}`}>
            {isSent ? "-" : "+"}₹{transaction.amount}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <TransactionStatus status={transaction.status} />
            {transaction.status === "Suspicious" && <p className="text-xs text-yellow-700">{transaction.reason}</p>}
            {transaction.status === "Blocked" && <p className="text-xs text-red-700">{transaction.reason}</p>}
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            {showFraudDetails && <TabsTrigger value="security">Security Analysis</TabsTrigger>}
            {!showFraudDetails && <TabsTrigger value="receipt">Receipt</TabsTrigger>}
          </TabsList>

          <TabsContent value="details">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-medium">{transaction.id}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium">{transaction.time}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">{transaction.method}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">{isSent ? "Paid To" : "Received From"}</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`/placeholder.svg?height=24&width=24&text=${
                            isSent ? transaction.receiver.charAt(0) : transaction.sender.charAt(0)
                          }`}
                          alt={isSent ? transaction.receiver : transaction.sender}
                        />
                        <AvatarFallback>
                          {isSent ? transaction.receiver.charAt(0) : transaction.sender.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{isSent ? transaction.receiver : transaction.sender}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">UPI Reference ID</span>
                    <span className="font-medium text-xs">UPI{Math.floor(Math.random() * 1000000000)}</span>
                  </div>

                  {transaction.riskScore && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Risk Score</span>
                      <FraudRiskIndicator score={transaction.riskScore} />
                    </div>
                  )}

                  {transaction.fraudType && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Fraud Type</span>
                      <span className="font-medium text-red-500">{transaction.fraudType}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Security Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our fraud detection system flagged this transaction based on the following factors:
                  </p>

                  <div className="space-y-4">
                    {transaction.fraudType === "Phishing" && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Phishing Detection</p>
                          <p className="text-xs text-muted-foreground">
                            This transaction was initiated from a known phishing URL that mimics a legitimate payment
                            site.
                          </p>
                        </div>
                      </div>
                    )}

                    {transaction.fraudType === "Anomaly" && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Unusual Transaction Pattern</p>
                          <p className="text-xs text-muted-foreground">
                            This transaction deviates significantly from your normal spending patterns in terms of
                            amount and recipient.
                          </p>
                        </div>
                      </div>
                    )}

                    {transaction.fraudType === "QR Tampering" && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">QR Code Manipulation</p>
                          <p className="text-xs text-muted-foreground">
                            The QR code used for this transaction appears to have been tampered with or redirected.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Unusual Location</p>
                        <p className="text-xs text-muted-foreground">
                          Transaction initiated from {locationData.city}, which differs from your usual transaction
                          locations.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">High-Risk Recipient</p>
                        <p className="text-xs text-muted-foreground">
                          The recipient account has been associated with multiple suspicious transactions recently.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">What should you do?</h4>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                      <span>Contact our support team immediately if you did not authorize this transaction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                      <span>Change your UPI PIN and app password as a precaution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-0.5" />
                      <span>Review your recent transactions for any other suspicious activity</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" /> Share Details
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700">
                <ShieldAlert className="h-4 w-4 mr-2" /> Report Fraud
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="receipt">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col items-center mb-4 pt-2">
                  <Image
                    src="/placeholder.svg?height=60&width=120&text=SafePay"
                    alt="SafePay Logo"
                    width={120}
                    height={60}
                    className="mb-2"
                  />
                  <h3 className="font-semibold">Payment Receipt</h3>
                  <p className="text-xs text-muted-foreground">Transaction ID: {transaction.id}</p>
                </div>

                <div className="border-t border-b py-4 my-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Amount:</span>
                    <span className="text-sm font-semibold">₹{transaction.amount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Date:</span>
                    <span className="text-sm">{transaction.time}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">{isSent ? "Paid To:" : "Received From:"}</span>
                    <span className="text-sm">{isSent ? transaction.receiver : transaction.sender}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Payment Method:</span>
                    <span className="text-sm">{transaction.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <span className="text-sm font-semibold text-green-600">Completed</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=100&width=100&text=QR"
                    alt="Receipt QR Code"
                    width={100}
                    height={100}
                  />
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Scan this QR code to view the digital receipt
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" /> Share Receipt
              </Button>
              <Button className="flex-1">
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional actions */}
        <div className="space-y-3 mt-4">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <Info className="h-4 w-4" /> View Transaction Timeline
          </Button>

          {transaction.status === "Suspicious" && (
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-yellow-600 border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
            >
              <Clock className="h-4 w-4" /> Check Transaction Status
            </Button>
          )}

          {transaction.status === "Blocked" && (
            <Button className="w-full flex items-center justify-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Dispute Transaction
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

