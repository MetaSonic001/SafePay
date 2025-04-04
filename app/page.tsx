import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  QrCode,
  Send,
  Search,
  Bell,
  CreditCard,
  Smartphone,
  Zap,
  Gift,
  Receipt,
  Users,
  DollarSign,
  Wallet,
  Building,
  ChevronRight,
  Plus,
  ShieldCheck,
  TrendingUp,
  Droplet,
  Tv,
} from "lucide-react"
import { transactions, contacts } from "@/lib/data"
import TransactionStatus from "@/components/transaction-status"
import QuickActionButton from "@/components/quick-action-button"
import PromotionCard from "@/components/promotion-card"
import FraudAlertBanner from "@/components/fraud-alert-banner"

export default function Home() {
  // Simulate a recent fraud alert for demo purposes
  const hasRecentFraudAlert = true

  return (
    <main className="flex min-h-screen flex-col pb-20 bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>SH</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Hi, Shaun</p>
                <p className="text-xs opacity-80">shaun@okbank</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary/20 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" size="icon" className="text-white hover:bg-primary/20">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Balance */}
          <div className="mb-4">
            <p className="text-xs opacity-80 mb-1">Available Balance</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">₹24,350.75</p>
              <Link href="/balance">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-white hover:bg-primary/20">
                  View Details
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, UPI ID, or bank account"
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 w-full -mt-5">
        {/* Fraud Alert Banner (conditionally rendered) */}
        {hasRecentFraudAlert && (
          <div className="mb-4">
            <FraudAlertBanner
              title="Security Alert"
              message="We've detected a suspicious login attempt. Tap to review."
              href="/security/alerts"
            />
          </div>
        )}

        {/* Quick Actions */}
        <Card className="overflow-hidden shadow-md border-none">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <QuickActionButton icon={<Send className="h-6 w-6" />} label="Pay" href="/send-money" />
              <QuickActionButton icon={<QrCode className="h-6 w-6" />} label="Scan" href="/scan-qr" />
              <QuickActionButton icon={<DollarSign className="h-6 w-6" />} label="Request" href="/request-money" />
              <QuickActionButton icon={<Users className="h-6 w-6" />} label="Split" href="/split-bill" />
            </div>
          </CardContent>
        </Card>

        {/* People */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">People</h2>
            <Link href="/contacts" className="text-sm text-primary">
              View All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            <div className="flex flex-col items-center min-w-[72px]">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full mb-1 bg-primary/10 border-primary/20"
              >
                <Plus className="h-6 w-6 text-primary" />
              </Button>
              <span className="text-xs text-center">New</span>
            </div>
            {contacts.slice(0, 6).map((contact) => (
              <Link
                key={contact.upiId}
                href={`/send-money?to=${contact.upiId}`}
                className="flex flex-col items-center min-w-[72px]"
              >
                <Avatar className="h-14 w-14 mb-1">
                  <AvatarImage
                    src={`/placeholder.svg?height=56&width=56&text=${contact.name.charAt(0)}`}
                    alt={contact.name}
                  />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-center truncate w-full">{contact.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Businesses */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Businesses</h2>
            <Link href="/businesses" className="text-sm text-primary">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <QuickActionButton
              icon={<Smartphone className="h-6 w-6" />}
              label="Mobile"
              href="/recharge/mobile"
              variant="outline"
            />
            <QuickActionButton
              icon={<Zap className="h-6 w-6" />}
              label="Electricity"
              href="/bills/electricity"
              variant="outline"
            />
            <QuickActionButton
              icon={<CreditCard className="h-6 w-6" />}
              label="Credit Card"
              href="/bills/credit-card"
              variant="outline"
            />
            <QuickActionButton icon={<Receipt className="h-6 w-6" />} label="Bills" href="/bills" variant="outline" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3">
            <QuickActionButton
              icon={<Droplet className="h-6 w-6" />}
              label="Water"
              href="/bills/water"
              variant="outline"
            />
            <QuickActionButton icon={<Tv className="h-6 w-6" />} label="DTH" href="/bills/dth" variant="outline" />
            <QuickActionButton icon={<Gift className="h-6 w-6" />} label="Rewards" href="/rewards" variant="outline" />
            <QuickActionButton
              icon={<TrendingUp className="h-6 w-6" />}
              label="Investments"
              href="/investments"
              variant="outline"
            />
          </div>
        </div>

        {/* Promotions */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Offers & Rewards</h2>
            <Link href="/offers" className="text-sm text-primary">
              View All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            <PromotionCard
              title="10% Cashback"
              description="On your first transaction"
              image="/placeholder.svg?height=80&width=160&text=Cashback"
              href="/offers/cashback"
            />
            <PromotionCard
              title="Win ₹500"
              description="Pay 5 bills & get rewards"
              image="/placeholder.svg?height=80&width=160&text=Rewards"
              href="/offers/rewards"
            />
            <PromotionCard
              title="20% Off"
              description="On movie tickets"
              image="/placeholder.svg?height=80&width=160&text=Movies"
              href="/offers/movies"
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link href="/transactions" className="text-sm text-primary">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <Link href={`/transaction/${transaction.id}`} key={transaction.id}>
                <Card className="overflow-hidden hover:bg-gray-50 transition-colors">
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
                          <p className="font-medium">{transaction.receiver}</p>
                          <p className="text-sm text-muted-foreground">{transaction.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${transaction.sender === "Shaun" ? "text-red-500" : "text-green-500"}`}
                        >
                          {transaction.sender === "Shaun" ? "-" : "+"}₹{transaction.amount}
                        </p>
                        <TransactionStatus status={transaction.status} />
                      </div>
                    </div>
                    {transaction.status !== "Success" && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            {transaction.status === "Blocked"
                              ? "Transaction blocked for your security. Tap to view details."
                              : "Transaction flagged as suspicious. Tap to review."}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="mt-6 mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Bank Accounts</h2>
            <Link href="/bank-accounts" className="text-sm text-primary">
              Manage
            </Link>
          </div>
          <Card>
            <CardContent className="p-0">
              <Link href="/bank-accounts/1" className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">OK Bank</p>
                    <p className="text-sm text-muted-foreground">••••4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
                    Primary
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
              <div className="h-px bg-gray-200"></div>
              <Link href="/bank-accounts/2" className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">SBI Bank</p>
                    <p className="text-sm text-muted-foreground">••••8901</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <div className="h-px bg-gray-200"></div>
              <Link href="/add-bank-account" className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Add Bank Account</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
        <div className="max-w-md mx-auto flex justify-between px-2">
          <Link href="/" className="flex flex-col items-center py-2 px-3">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xs mt-1 font-medium text-primary">Home</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center py-2 px-3">
            <Receipt className="h-6 w-6 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Transactions</span>
          </Link>
          <Link href="/scan-qr" className="flex flex-col items-center py-2 px-3">
            <div className="bg-primary rounded-full p-3 -mt-5 shadow-lg">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-500">Scan</span>
          </Link>
          <Link href="/offers" className="flex flex-col items-center py-2 px-3">
            <Gift className="h-6 w-6 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Rewards</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 px-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg?height=24&width=24" alt="User" />
              <AvatarFallback>SH</AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1 text-gray-500">Profile</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

