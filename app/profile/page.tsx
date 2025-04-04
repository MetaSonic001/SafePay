import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  User,
  Wallet,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { transactions } from "@/lib/data"
import { users } from "@/lib/data"
import TransactionStatus from "@/components/transaction-status"
import RiskScoreGauge from "@/components/risk-score-gauge"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const currentUser = users[0] // Using the first user as the current user
  const userTransactions = transactions
    .filter((t) => t.sender === currentUser.name || t.receiver === currentUser.name)
    .slice(0, 3)

  // Count suspicious or blocked transactions
  const suspiciousTransactions = transactions.filter(
    (t) =>
      (t.sender === currentUser.name || t.receiver === currentUser.name) &&
      (t.status === "Suspicious" || t.status === "Blocked"),
  )

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
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{currentUser.name}</h2>
          <p className="text-muted-foreground">{currentUser.upiId}</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
            <Button size="sm">
              <Share2 className="h-4 w-4 mr-1" /> Share UPI ID
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Account Security</h3>
            <Link href="/security/details" className="text-sm text-primary">
              View Details
            </Link>
          </div>

          <Card>
            <CardContent className="p-6">
              <RiskScoreGauge score={currentUser.riskScore} />
              <p className="text-center mt-4 text-sm text-muted-foreground">
                Your account security is {getRiskLevel(currentUser.riskScore)}
              </p>

              {suspiciousTransactions.length > 0 && (
                <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Security Alerts</p>
                      <p className="text-xs text-yellow-700">
                        You have {suspiciousTransactions.length} suspicious{" "}
                        {suspiciousTransactions.length === 1 ? "transaction" : "transactions"} that require your
                        attention
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-xs h-auto py-2">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Security Checkup
                </Button>
                <Button variant="outline" className="text-xs h-auto py-2">
                  <Clock className="h-4 w-4 mr-1" /> Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Link href="/transactions" className="text-sm text-primary">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {userTransactions.map((transaction) => (
              <Link href={`/transaction/${transaction.id}`} key={transaction.id}>
                <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${
                              transaction.sender === currentUser.name
                                ? transaction.receiver.charAt(0)
                                : transaction.sender.charAt(0)
                            }`}
                            alt={transaction.sender === currentUser.name ? transaction.receiver : transaction.sender}
                          />
                          <AvatarFallback>
                            {transaction.sender === currentUser.name
                              ? transaction.receiver.charAt(0)
                              : transaction.sender.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {transaction.sender === currentUser.name
                              ? `To: ${transaction.receiver}`
                              : `From: ${transaction.sender}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{transaction.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.sender === currentUser.name ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {transaction.sender === currentUser.name ? "-" : "+"}₹{transaction.amount}
                        </p>
                        <TransactionStatus status={transaction.status} />
                      </div>
                    </div>

                    {/* View Details button - only visible on hover */}
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 hidden group-hover:block">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            <Link href="/transactions">
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <Card>
            <CardContent className="p-0">
              <Link href="/profile/payment-methods" className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Payment Methods</p>
                    <p className="text-xs text-muted-foreground">Manage your cards and bank accounts</p>
                  </div>
                </div>
                <Badge variant="outline" className="mr-2">
                  2 Cards
                </Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="h-px bg-gray-200"></div>
              <Link href="/profile/security" className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Privacy & Security</p>
                    <p className="text-xs text-muted-foreground">Manage your security settings</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="h-px bg-gray-200"></div>
              <Link href="/profile/wallet" className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="font-medium">Wallet & Rewards</p>
                </div>
                <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                  250 Points
                </Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="h-px bg-gray-200"></div>
              <Link href="/profile/notifications" className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">Manage your notification preferences</p>
                  </div>
                </div>
                <Badge variant="outline" className="mr-2">
                  3 New
                </Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="h-px bg-gray-200"></div>
              <Link href="/help" className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Help & Support</p>
                    <p className="text-xs text-muted-foreground">Get help with your account</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </main>
  )
}

function getRiskLevel(score: number): string {
  if (score <= 40) return "good"
  if (score <= 70) return "moderate"
  return "at risk"
}

