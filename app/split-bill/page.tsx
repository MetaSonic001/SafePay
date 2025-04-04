"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import { contacts } from "@/lib/data"
import { Checkbox } from "@/components/ui/checkbox"

export default function SplitBillPage() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal")
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [step, setStep] = useState<"select" | "configure" | "review">("select")

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.upiId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleContact = (upiId: string) => {
    if (selectedContacts.includes(upiId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== upiId))
      const newCustomAmounts = { ...customAmounts }
      delete newCustomAmounts[upiId]
      setCustomAmounts(newCustomAmounts)
    } else {
      setSelectedContacts([...selectedContacts, upiId])
    }
  }

  const handleNext = () => {
    if (step === "select") {
      if (selectedContacts.length > 0) {
        setStep("configure")
      }
    } else if (step === "configure") {
      if (amount && Number.parseFloat(amount) > 0) {
        // Initialize equal splits
        if (splitType === "equal") {
          const equalAmount = (Number.parseFloat(amount) / (selectedContacts.length + 1)).toFixed(2)
          const newCustomAmounts: Record<string, string> = {}
          selectedContacts.forEach((id) => {
            newCustomAmounts[id] = equalAmount
          })
          setCustomAmounts(newCustomAmounts)
        }
        setStep("review")
      }
    }
  }

  const handleBack = () => {
    if (step === "configure") {
      setStep("select")
    } else if (step === "review") {
      setStep("configure")
    }
  }

  const handleCustomAmountChange = (upiId: string, value: string) => {
    setCustomAmounts({
      ...customAmounts,
      [upiId]: value,
    })
  }

  const getTotalSplitAmount = () => {
    if (splitType === "equal") {
      return Number.parseFloat(amount)
    } else {
      return Object.values(customAmounts).reduce((sum, val) => sum + (Number.parseFloat(val) || 0), 0)
    }
  }

  const getYourShare = () => {
    if (!amount || Number.parseFloat(amount) <= 0) return "0.00"

    if (splitType === "equal") {
      return (Number.parseFloat(amount) / (selectedContacts.length + 1)).toFixed(2)
    } else {
      const totalSplit = getTotalSplitAmount()
      return (Number.parseFloat(amount) - totalSplit).toFixed(2)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case "select":
        return (
          <>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or UPI ID"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3 mb-6">
              {filteredContacts.map((contact) => (
                <Card
                  key={contact.upiId}
                  className={`cursor-pointer hover:bg-muted/50 ${selectedContacts.includes(contact.upiId) ? "border-primary" : ""}`}
                  onClick={() => toggleContact(contact.upiId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedContacts.includes(contact.upiId)}
                        onCheckedChange={() => toggleContact(contact.upiId)}
                        className="h-5 w-5"
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40&text=${contact.name.charAt(0)}`}
                          alt={contact.name}
                        />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.upiId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button className="w-full" size="lg" disabled={selectedContacts.length === 0} onClick={handleNext}>
              Next
            </Button>
          </>
        )
      case "configure":
        return (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Total Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    className="pl-8 text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  id="description"
                  placeholder="Dinner, Movie, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Split Type</label>
                <div className="flex gap-3">
                  <Button
                    variant={splitType === "equal" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setSplitType("equal")}
                  >
                    Equal Split
                  </Button>
                  <Button
                    variant={splitType === "custom" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setSplitType("custom")}
                  >
                    Custom Split
                  </Button>
                </div>
              </div>

              {splitType === "custom" && amount && Number.parseFloat(amount) > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-medium">Custom Amounts</p>
                  {selectedContacts.map((upiId) => {
                    const contact = contacts.find((c) => c.upiId === upiId)
                    if (!contact) return null

                    return (
                      <div key={upiId} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&text=${contact.name.charAt(0)}`}
                            alt={contact.name}
                          />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm flex-1">{contact.name}</p>
                        <div className="relative w-24">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
                            ₹
                          </span>
                          <Input
                            type="number"
                            className="pl-6 h-8 text-sm"
                            value={customAmounts[upiId] || ""}
                            onChange={(e) => handleCustomAmountChange(upiId, e.target.value)}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Back
              </Button>
              <Button className="flex-1" disabled={!amount || Number.parseFloat(amount) <= 0} onClick={handleNext}>
                Review
              </Button>
            </div>
          </>
        )
      case "review":
        return (
          <>
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">{description || "Split Bill"}</h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">₹{Number.parseFloat(amount).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Your Share</span>
                    <span className="font-medium">₹{getYourShare()}</span>
                  </div>

                  {selectedContacts.map((upiId) => {
                    const contact = contacts.find((c) => c.upiId === upiId)
                    if (!contact) return null

                    const shareAmount =
                      splitType === "equal"
                        ? (Number.parseFloat(amount) / (selectedContacts.length + 1)).toFixed(2)
                        : customAmounts[upiId] || "0.00"

                    return (
                      <div key={upiId} className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">{contact.name}'s Share</span>
                        <span className="font-medium">₹{shareAmount}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  // In a real app, this would send the split requests
                  alert("Split requests sent!")
                }}
              >
                Send Requests
              </Button>
            </div>
          </>
        )
    }
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
          <h1 className="text-xl font-bold">Split Bill</h1>
        </div>

        {renderStepContent()}
      </div>
    </main>
  )
}

