"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import { contacts } from "@/lib/data"
import TransactionResult from "@/components/transaction-result"

export default function SendMoneyPage() {
  const [selectedContact, setSelectedContact] = useState<(typeof contacts)[0] | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [transactionResult, setTransactionResult] = useState<{
    status: "Success" | "Blocked" | "Suspicious"
    message: string
  } | null>(null)

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.upiId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleProceed = () => {
    if (!selectedContact || !amount) return

    // Simulate transaction result based on contact's risk score
    let result
    if (selectedContact.riskScore > 70) {
      result = {
        status: "Blocked" as const,
        message: "Transaction Blocked: High anomaly score detected",
      }
    } else if (selectedContact.riskScore > 40) {
      result = {
        status: "Suspicious" as const,
        message: "Transaction Under Review: Network-based fraud suspicion",
      }
    } else {
      result = {
        status: "Success" as const,
        message: "Transaction Successful",
      }
    }

    setTransactionResult(result)
    setShowResult(true)
  }

  if (showResult && transactionResult) {
    return (
      <TransactionResult
        status={transactionResult.status}
        message={transactionResult.message}
        amount={Number.parseFloat(amount)}
        recipient={selectedContact?.name || ""}
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
          <h1 className="text-xl font-bold">Send Money</h1>
        </div>

        {!selectedContact ? (
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

            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <Card
                  key={contact.upiId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedContact(contact)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
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
          </>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={`/placeholder.svg?height=48&width=48&text=${selectedContact.name.charAt(0)}`}
                      alt={selectedContact.name}
                    />
                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedContact.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedContact.upiId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Amount
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
                <label htmlFor="note" className="block text-sm font-medium mb-1">
                  Note (Optional)
                </label>
                <Input
                  id="note"
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!amount || Number.parseFloat(amount) <= 0}
                onClick={handleProceed}
              >
                Proceed to Pay
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

