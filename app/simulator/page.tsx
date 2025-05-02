"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import QRCodeDisplay from "@/components/qr-code-display"
import FraudResultDisplay from "@/components/fraud-result-display"

export default function TransactionSimulatorPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  // Form states
  const [amount, setAmount] = useState("1000")
  const [senderID, setSenderID] = useState("user123")
  const [receiverID, setReceiverID] = useState("merchant456")
  const [qrManipulated, setQrManipulated] = useState(false)
  const [deviceChanged, setDeviceChanged] = useState(false)
  const [locationChanged, setLocationChanged] = useState(false)
  const [highVelocity, setHighVelocity] = useState(false)
  const [newBeneficiary, setNewBeneficiary] = useState(false)
  const [linkSource, setLinkSource] = useState("direct")
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [qrPayload, setQrPayload] = useState("upi://pay?pa=legitimatemerchant@bank&pn=LegitStore&am=1000")
  const [activeTab, setActiveTab] = useState("basic")

  const presetQrNormal = "upi://pay?pa=legitimatemerchant@bank&pn=LegitStore&am=1000"
  const presetQrTampered = "upi://pay?pa=fakehacker@fraud&pn=LegitStore&am=1000"

  const simulateQRTampering = async () => {
    try {
      const response = await fetch('/api/simulate-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fraud_type: 'qr_code_tampering',
          sender_id: senderID,
          receiver_id: receiverID,
          amount: amount
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Simulation error:', error);
      setResult({ error: 'Failed to simulate QR tampering' });
    }
  }

  const simulateAccountTakeover = () => {
    setDeviceChanged(true)
    setLocationChanged(true)
    setLoginAttempts(7)
    setHighVelocity(true)
    setActiveTab("fraud")
  }

  const simulateFakeUPI = () => {
    setQrManipulated(true)
    setNewBeneficiary(true)
    setQrPayload("upi://pay?pa=fakepayment@suspicious&pn=QuickPay&am=1000")
    setActiveTab("qr")
  }

  const simulateDeviceSpoofing = () => {
    setDeviceChanged(true)
    setLinkSource("whatsapp")
    setLoginAttempts(3)
    setActiveTab("fraud")
  }

  const resetForm = () => {
    setAmount("1000")
    setSenderID("user123")
    setReceiverID("merchant456") 
    setQrManipulated(false)
    setDeviceChanged(false)
    setLocationChanged(false)
    setHighVelocity(false)
    setNewBeneficiary(false)
    setLinkSource("direct")
    setLoginAttempts(0)
    setQrPayload(presetQrNormal)
    setResult(null)
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      // Create transaction payload
      const payload = {
        sender_id: senderID,
        receiver_id: receiverID,
        amount: amount,
        qr_code_data: qrPayload,
        payment_url: linkSource !== "direct" ? `https://example.com/pay/${receiverID}` : null,
        device_info: {
          device_changed: deviceChanged,
          device_id: deviceChanged ? "new_device_xyz" : "regular_device_abc",
          os: "Android 12",
          model: "Pixel 6"
        },
        location: {
          changed: locationChanged,
          current: locationChanged ? "19.076,72.877" : "18.52,73.86", // Mumbai vs Pune
          last_known: "18.52,73.86" // Pune
        },
        user_agent: "Mozilla/5.0 Mobile Safari/537.36",
        ip_address: "192.168.1.1",
        transaction_metadata: {
          high_velocity: highVelocity,
          new_beneficiary: newBeneficiary,
          link_source: linkSource,
          login_attempts_24hrs: loginAttempts
        }
      }

      // Call API
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error simulating transaction:', error)
      setResult({ error: 'Failed to process transaction' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Transaction Fraud Simulator</h1>
        </div>

        {result ? (
          <div className="space-y-6">
            <FraudResultDisplay result={result} />
            <Button onClick={resetForm} className="w-full">Simulate Another Transaction</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preset Fraud Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Button onClick={simulateQRTampering} variant="outline" className="h-auto py-2">QR Tampering</Button>
                <Button onClick={simulateAccountTakeover} variant="outline" className="h-auto py-2">Account Takeover</Button>
                <Button onClick={simulateFakeUPI} variant="outline" className="h-auto py-2">Fake UPI Fraud</Button>
                <Button onClick={simulateDeviceSpoofing} variant="outline" className="h-auto py-2">Device Spoofing</Button>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="basic">Basic Details</TabsTrigger>
                <TabsTrigger value="fraud">Fraud Factors</TabsTrigger>
                <TabsTrigger value="qr">QR Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input 
                          id="amount" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-type">Transaction Type</Label>
                        <Select defaultValue="qr">
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qr">QR Code Payment</SelectItem>
                            <SelectItem value="upi">UPI Direct</SelectItem>
                            <SelectItem value="neft">NEFT Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sender">Sender ID</Label>
                        <Input 
                          id="sender" 
                          value={senderID} 
                          onChange={(e) => setSenderID(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="receiver">Receiver ID</Label>
                        <Input 
                          id="receiver" 
                          value={receiverID} 
                          onChange={(e) => setReceiverID(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="fraud" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Fraud Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="device-changed">Device Changed</Label>
                        <Switch 
                          id="device-changed" 
                          checked={deviceChanged} 
                          onCheckedChange={setDeviceChanged} 
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="location-changed">Location Changed</Label>
                        <Switch 
                          id="location-changed" 
                          checked={locationChanged} 
                          onCheckedChange={setLocationChanged} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="high-velocity">High Transaction Velocity</Label>
                        <Switch 
                          id="high-velocity" 
                          checked={highVelocity} 
                          onCheckedChange={setHighVelocity} 
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="new-beneficiary">New Beneficiary</Label>
                        <Switch 
                          id="new-beneficiary" 
                          checked={newBeneficiary} 
                          onCheckedChange={setNewBeneficiary} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="link-source">Link Clicked From</Label>
                      <Select value={linkSource} onValueChange={setLinkSource}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="ad">Advertisement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="login-attempts">Login Attempts (24h): {loginAttempts}</Label>
                      </div>
                      <Slider 
                        id="login-attempts"
                        min={0}
                        max={10}
                        step={1}
                        value={[loginAttempts]}
                        onValueChange={([value]) => setLoginAttempts(value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="qr" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>QR Code Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 pb-4">
                      <Label htmlFor="qr-manipulated">QR Manipulated</Label>
                      <Switch 
                        id="qr-manipulated" 
                        checked={qrManipulated} 
                        onCheckedChange={(checked) => {
                          setQrManipulated(checked)
                          if (checked) {
                            setQrPayload(presetQrTampered)
                          } else {
                            setQrPayload(presetQrNormal)
                          }
                        }} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="qr-payload">QR Payload</Label>
                      <Input 
                        id="qr-payload" 
                        value={qrPayload} 
                        onChange={(e) => setQrPayload(e.target.value)}
                      />
                    </div>
                    
                    <div className="pt-4 flex justify-center">
                      <QRCodeDisplay value={qrPayload} />
                    </div>
                    
                    {qrManipulated && (
                      <div className="flex items-center space-x-2 mt-4 p-2 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          This QR code has been manipulated and may redirect payments to a fraudulent account.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Processing..." : "Simulate Transaction"}
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}