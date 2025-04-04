"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Share2, Copy } from "lucide-react"
import { contacts } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RequestMoneyPage() {
  const [selectedContact, setSelectedContact] = useState<(typeof contacts)[0] | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.upiId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRequest = () => {
    if (!selectedContact || !amount) return
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Share2 className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-xl font-bold mb-2">Request Sent</h2>

            <p className="text-muted-foreground mb-6">
              Your payment request of ₹{Number.parseFloat(amount).toFixed(2)} has been sent to {selectedContact?.name}
            </p>

            <div className="w-full mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">₹{Number.parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">{selectedContact?.name}</span>
              </div>
              {note && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Note</span>
                  <span className="font-medium">{note}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col w-full gap-3">
              <Link href="/" className="w-full">
                <Button className="w-full">Back to Home</Button>
              </Link>
              <Button variant="outline" className="w-full">
                Send a Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
          <h1 className="text-xl font-bold">Request Money</h1>
        </div>

        <Tabs defaultValue="contacts" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="link">Payment Link</TabsTrigger>
          </TabsList>
          <TabsContent value="contacts">
            {!selectedContact ? (
              <>
                <div className="relative mb-6 mt-4">
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
              <div className="space-y-6 mt-4">
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
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
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
                    <Textarea
                      id="note"
                      placeholder="What's this for?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!amount || Number.parseFloat(amount) <= 0}
                    onClick={handleRequest}
                  >
                    Request ₹{amount ? Number.parseFloat(amount).toFixed(2) : "0.00"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="link">
            <div className="space-y-6 mt-4">
              <div>
                <label htmlFor="link-amount" className="block text-sm font-medium mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="link-amount"
                    type="number"
                    placeholder="0"
                    className="pl-8 text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="link-note" className="block text-sm font-medium mb-1">
                  Note (Optional)
                </label>
                <Textarea
                  id="link-note"
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              {amount && Number.parseFloat(amount) > 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium mb-2">Payment Link</p>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <p className="text-sm truncate mr-2">https://pay.safepay.com/r/shaun/{amount}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" className="w-full">
                        <Share2 className="h-4 w-4 mr-2" /> Share
                      </Button>
                      <Button className="w-full">
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-center text-muted-foreground">Enter an amount to generate a payment link</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

