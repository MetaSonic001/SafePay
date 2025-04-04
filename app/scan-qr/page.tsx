"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle, ShieldCheck, Info, CheckCircle, X, Camera, RefreshCw } from "lucide-react"
import TransactionResult from "@/components/transaction-result"
import { Progress } from "@/components/ui/progress"

export default function ScanQRPage() {
  const [scanned, setScanned] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fraudCheckComplete, setFraudCheckComplete] = useState(false)

  // Simulated QR scan result
  const qrData = {
    name: "Online Store XYZ",
    upiId: "store@xyzbank",
    amount: 1299,
    riskTag: "QR origin suspicious",
    riskLevel: "medium", // low, medium, high
  }

  // Simulate scanning animation
  useEffect(() => {
    if (scanning) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer)
            setScanning(false)
            setScanned(true)
            return 0
          }
          return prevProgress + 5
        })
      }, 100)

      return () => {
        clearInterval(timer)
      }
    }
  }, [scanning])

  const handleScan = () => {
    setScanning(true)
  }

  const handleConfirmPayment = () => {
    setFraudCheckComplete(true)

    // Simulate fraud check delay
    setTimeout(() => {
      setShowResult(true)
    }, 1500)
  }

  if (showResult) {
    // Simulate transaction result based on risk level
    const result =
      qrData.riskLevel === "high"
        ? { status: "Blocked" as const, message: "Transaction Blocked: Suspicious QR code detected" }
        : qrData.riskLevel === "medium"
          ? { status: "Suspicious" as const, message: "Transaction Under Review: QR origin suspicious" }
          : { status: "Success" as const, message: "Transaction Successful" }

    return (
      <TransactionResult
        status={result.status}
        message={result.message}
        amount={qrData.amount}
        recipient={qrData.name}
      />
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-md px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Scan QR Code</h1>
        </div>

        {!scanned ? (
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-6 border-2 border-dashed border-primary rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=256&width=256&text=QR+Code"
                alt="QR Code Scanner"
                width={256}
                height={256}
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary"></div>
              </div>

              {scanning && (
                <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center">
                  <div className="w-full px-8 mb-2">
                    <Progress value={progress} className="h-1" />
                  </div>
                  <p className="text-xs text-white bg-black/50 px-2 py-1 rounded">Scanning...</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-4">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                <Camera className="h-5 w-5" />
              </Button>
              <Button onClick={handleScan} className="px-6">
                {scanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Scanning...
                  </>
                ) : (
                  "Simulate Scan"
                )}
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                <Image src="/placeholder.svg?height=20&width=20&text=Gallery" alt="Gallery" width={20} height={20} />
              </Button>
            </div>

            <p className="text-center text-muted-foreground mb-4">Position the QR code within the frame to scan</p>

            <Card className="w-full">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Recent QR Scans</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=32&width=32&text=CS"
                          alt="Coffee Shop"
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Coffee Shop</p>
                        <p className="text-xs text-muted-foreground">Today, 09:30 AM</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">₹120</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=32&width=32&text=GM"
                          alt="Grocery Mart"
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Grocery Mart</p>
                        <p className="text-xs text-muted-foreground">Yesterday, 11:20 AM</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">₹850</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/placeholder.svg?height=40&width=40&text=XYZ"
                      alt={qrData.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <h2 className="text-lg font-semibold">{qrData.name}</h2>
                  </div>
                  {qrData.riskTag && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {qrData.riskTag}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{qrData.upiId}</p>
                <p className="text-2xl font-bold mb-6">₹{qrData.amount.toFixed(2)}</p>

                {fraudCheckComplete ? (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Fraud check complete - proceed with caution</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Running fraud detection...</span>
                      <span className="text-sm">{fraudCheckComplete ? "100%" : "75%"}</span>
                    </div>
                    <Progress value={fraudCheckComplete ? 100 : 75} className="h-2" />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setScanned(false)}>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleConfirmPayment} disabled={!fraudCheckComplete}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Confirm Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {qrData.riskLevel !== "low" && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Payment Risk Detected</h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      This QR code has been flagged as potentially suspicious. Proceed with caution.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-700">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Our fraud detection system has identified unusual patterns</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-yellow-700 mt-1">
                      <Info className="h-3 w-3" />
                      <span>Verify the merchant details before proceeding</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Merchant</span>
                    <span className="text-sm">{qrData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">UPI ID</span>
                    <span className="text-sm">{qrData.upiId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-sm font-medium">₹{qrData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <span className="text-sm">OK Bank (••••4567)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}

