import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowDown, ArrowUp, Filter } from "lucide-react"
import { transactions } from "@/lib/data"
import TransactionStatus from "@/components/transaction-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TransactionsPage() {
  // Group transactions by date
  const groupedTransactions: Record<string, typeof transactions> = {}

  transactions.forEach((transaction) => {
    const dateKey = transaction.time.split(",")[0] // "Today", "Yesterday", "2 days ago", etc.
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = []
    }
    groupedTransactions[dateKey].push(transaction)
  })

  return (
    <main className="flex min-h-screen flex-col items-center pb-20">
      <div className="w-full max-w-md px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Transactions</h1>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
              <div key={date} className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">{date}</h2>
                <div className="space-y-3">
                  {dateTransactions.map((transaction) => (
                    <Link href={`/transaction/${transaction.id}`} key={transaction.id}>
                      <Card className="overflow-hidden hover:bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`/placeholder.svg?height=40&width=40&text=${
                                    transaction.sender === "Shaun"
                                      ? transaction.receiver.charAt(0)
                                      : transaction.sender.charAt(0)
                                  }`}
                                  alt={transaction.sender === "Shaun" ? transaction.receiver : transaction.sender}
                                />
                                <AvatarFallback>
                                  {transaction.sender === "Shaun"
                                    ? transaction.receiver.charAt(0)
                                    : transaction.sender.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">
                                    {transaction.sender === "Shaun" ? transaction.receiver : transaction.sender}
                                  </p>
                                  {transaction.sender === "Shaun" ? (
                                    <ArrowUp className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <ArrowDown className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{transaction.time.split(",")[1]}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-semibold ${
                                  transaction.sender === "Shaun" ? "text-red-500" : "text-green-500"
                                }`}
                              >
                                {transaction.sender === "Shaun" ? "-" : "+"}₹{transaction.amount}
                              </p>
                              <TransactionStatus status={transaction.status} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="sent">
            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => {
              const sentTransactions = dateTransactions.filter((t) => t.sender === "Shaun")
              if (sentTransactions.length === 0) return null

              return (
                <div key={date} className="mb-6">
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">{date}</h2>
                  <div className="space-y-3">
                    {sentTransactions.map((transaction) => (
                      <Link href={`/transaction/${transaction.id}`} key={transaction.id}>
                        <Card className="overflow-hidden hover:bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={`/placeholder.svg?height=40&width=40&text=${transaction.receiver.charAt(0)}`}
                                    alt={transaction.receiver}
                                  />
                                  <AvatarFallback>{transaction.receiver.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{transaction.receiver}</p>
                                    <ArrowUp className="h-3 w-3 text-red-500" />
                                  </div>
                                  <p className="text-sm text-muted-foreground">{transaction.time.split(",")[1]}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-red-500">-₹{transaction.amount}</p>
                                <TransactionStatus status={transaction.status} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </TabsContent>

          <TabsContent value="received">
            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => {
              const receivedTransactions = dateTransactions.filter((t) => t.receiver === "Shaun")
              if (receivedTransactions.length === 0) return null

              return (
                <div key={date} className="mb-6">
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">{date}</h2>
                  <div className="space-y-3">
                    {receivedTransactions.map((transaction) => (
                      <Link href={`/transaction/${transaction.id}`} key={transaction.id}>
                        <Card className="overflow-hidden hover:bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={`/placeholder.svg?height=40&width=40&text=${transaction.sender.charAt(0)}`}
                                    alt={transaction.sender}
                                  />
                                  <AvatarFallback>{transaction.sender.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{transaction.sender}</p>
                                    <ArrowDown className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-sm text-muted-foreground">{transaction.time.split(",")[1]}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-500">+₹{transaction.amount}</p>
                                <TransactionStatus status={transaction.status} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

