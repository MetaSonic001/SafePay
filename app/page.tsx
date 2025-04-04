import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  RefreshCw,
  ScanLine,
  MoreHorizontal,
} from "lucide-react";
import { transactions, contacts } from "@/lib/data";
import TransactionStatus from "@/components/transaction-status";
import QuickActionButton from "@/components/quick-action-button";
import PromotionCard from "@/components/promotion-card";
import FraudAlertBanner from "@/components/fraud-alert-banner";

export default function Home() {
  // Simulate a recent fraud alert for demo purposes
  const hasRecentFraudAlert = true;

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white pb-10">
        <div className="max-w-md mx-auto px-6 pt-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/30 ring-2 ring-white/10">
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt="User"
                />
                <AvatarFallback>SH</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Hi, Shaun!</p>
                <div className="flex items-center">
                  <p className="text-xs opacity-80">shaun@okbank</p>
                  <ChevronRight className="h-3 w-3 opacity-80 ml-1" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/refresh">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Balance Display */}
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-white/80 mb-2">
              Total Balance
            </p>
            <h1 className="text-4xl font-bold mb-2">₹24,350.75</h1>
            <div className="flex justify-center gap-2">
              <Link href="/balance-details">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 px-4 rounded-full border border-white/20 text-white bg-white/10 hover:bg-white/20"
                >
                  View Details
                </Button>
              </Link>
              <Link href="/add-money">
                <Button
                  size="sm"
                  className="text-xs h-8 px-4 rounded-full bg-white text-blue-700 hover:bg-white/90"
                >
                  Add Money
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 w-full -mt-6 pb-24">
        {/* Search Bar Card */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden mb-6">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, UPI ID or bank account"
                className="pl-9 bg-gray-50 border-0 shadow-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Fraud Alert Banner (conditionally rendered) */}
        {hasRecentFraudAlert && (
          <div className="mb-6">
            <Card className="bg-red-50 border-l-4 border-l-red-500 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <ShieldCheck className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-700 text-sm">
                      Security Alert
                    </h3>
                    <p className="text-xs text-red-600">
                      We've detected a suspicious login attempt. Tap to review.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2">
            <Link href="/send-money" className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-blue-50 hover:bg-blue-100 mb-2"
              >
                <Send className="h-6 w-6 text-blue-600" />
              </Button>
              <span className="text-xs font-medium">Pay</span>
            </Link>
            <Link href="/scan-qr" className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-purple-50 hover:bg-purple-100 mb-2"
              >
                <ScanLine className="h-6 w-6 text-purple-600" />
              </Button>
              <span className="text-xs font-medium">Scan</span>
            </Link>
            <Link href="/request-money" className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-green-50 hover:bg-green-100 mb-2"
              >
                <DollarSign className="h-6 w-6 text-green-600" />
              </Button>
              <span className="text-xs font-medium">Request</span>
            </Link>
            <Link href="/split-bill" className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-amber-50 hover:bg-amber-100 mb-2"
              >
                <Users className="h-6 w-6 text-amber-600" />
              </Button>
              <span className="text-xs font-medium">Split</span>
            </Link>
          </div>
        </div>

        {/* People */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">People</h2>
            <Link
              href="/contacts"
              className="text-sm text-blue-600 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1">
            <div className="flex flex-col items-center min-w-[72px]">
              <Button
                variant="outline"
                size="icon"
                className="h-16 w-16 rounded-full mb-2 bg-gray-50 border-gray-200 hover:bg-gray-100"
              >
                <Plus className="h-7 w-7 text-blue-600" />
              </Button>
              <span className="text-xs font-medium">New</span>
            </div>
            {contacts.slice(0, 6).map((contact) => (
              <Link
                key={contact.upiId}
                href={`/send-money?to=${contact.upiId}`}
                className="flex flex-col items-center min-w-[72px]"
              >
                <Avatar className="h-16 w-16 mb-2 ring-2 ring-gray-100">
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64&text=${contact.name.charAt(
                      0
                    )}`}
                    alt={contact.name}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-center truncate w-full">
                  {contact.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bills & Utilities */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Bills & Utilities</h2>
            <Link
              href="/businesses"
              className="text-sm text-blue-600 font-medium"
            >
              View All
            </Link>
          </div>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-6">
                <Link
                  href="/recharge/mobile"
                  className="flex flex-col items-center"
                >
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium">Mobile</span>
                </Link>
                <Link
                  href="/bills/electricity"
                  className="flex flex-col items-center"
                >
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium">Electricity</span>
                </Link>
                <Link href="/bills/dth" className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <Tv className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-xs font-medium">DTH</span>
                </Link>
                <Link
                  href="/bills/credit-card"
                  className="flex flex-col items-center"
                >
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium">Cards</span>
                </Link>
              </div>

              <div className="h-px bg-gray-100 my-4"></div>

              <div className="grid grid-cols-4 gap-6">
                <Link
                  href="/bills/water"
                  className="flex flex-col items-center"
                >
                  <div className="h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center mb-2">
                    <Droplet className="h-5 w-5 text-cyan-600" />
                  </div>
                  <span className="text-xs font-medium">Water</span>
                </Link>
                <Link
                  href="/investments"
                  className="flex flex-col items-center"
                >
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium">Invest</span>
                </Link>
                <Link href="/rewards" className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                    <Gift className="h-5 w-5 text-pink-600" />
                  </div>
                  <span className="text-xs font-medium">Rewards</span>
                </Link>
                <Link
                  href="/more-options"
                  className="flex flex-col items-center"
                >
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-xs font-medium">More</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link
              href="/transactions"
              className="text-sm text-blue-600 font-medium"
            >
              View All
            </Link>
          </div>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-md">
            <CardContent className="p-0">
              {transactions.slice(0, 3).map((transaction, index) => (
                <Link
                  href={`/transaction/${transaction.id}`}
                  key={transaction.id}
                >
                  <div
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      index !== transactions.slice(0, 3).length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 bg-blue-50">
                          <AvatarImage
                            src={`/placeholder.svg?height=48&width=48&text=${transaction.receiver.charAt(
                              0
                            )}`}
                            alt={transaction.receiver}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                            {transaction.receiver.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{transaction.receiver}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.sender === "Shaun"
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.sender === "Shaun" ? "-" : "+"}₹
                          {transaction.amount}
                        </p>
                        <TransactionStatus
                          status={
                            transaction.status as
                              | "Success"
                              | "Suspicious"
                              | "Blocked"
                          }
                        />
                      </div>
                    </div>
                    {transaction.status !== "Success" && (
                      <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                        <div className="flex items-start gap-2 bg-red-50 p-2 rounded-lg">
                          <ShieldCheck className="h-4 w-4 text-red-500 mt-0.5" />
                          <p className="text-xs text-red-600">
                            {transaction.status === "Blocked"
                              ? "Transaction blocked for your security. Tap to view details."
                              : "Transaction flagged as suspicious. Tap to review."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Promotions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Offers & Rewards</h2>
            <Link href="/offers" className="text-sm text-blue-600 font-medium">
              View All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            <Card className="min-w-[200px] flex-shrink-0 border-0 shadow-md overflow-hidden rounded-xl">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardContent className="p-4">
                <h3 className="font-bold text-md mb-1">10% Cashback</h3>
                <p className="text-xs text-gray-500">
                  On your first transaction
                </p>
                <Link href="/offers/cashback">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-full h-8 text-xs font-medium"
                  >
                    View Offer
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="min-w-[200px] flex-shrink-0 border-0 shadow-md overflow-hidden rounded-xl">
              <div className="h-24 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-4">
                <h3 className="font-bold text-md mb-1">Win ₹500</h3>
                <p className="text-xs text-gray-500">
                  Pay 5 bills & get rewards
                </p>
                <Link href="/offers/rewards">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-full h-8 text-xs font-medium"
                  >
                    View Offer
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="min-w-[200px] flex-shrink-0 border-0 shadow-md overflow-hidden rounded-xl">
              <div className="h-24 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <CardContent className="p-4">
                <h3 className="font-bold text-md mb-1">20% Off</h3>
                <p className="text-xs text-gray-500">On movie tickets</p>
                <Link href="/offers/movies">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-full h-8 text-xs font-medium"
                  >
                    View Offer
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Bank Accounts</h2>
            <Link
              href="/bank-accounts"
              className="text-sm text-blue-600 font-medium"
            >
              Manage
            </Link>
          </div>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-md">
            <CardContent className="p-0">
              <Link
                href="/bank-accounts/1"
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">OK Bank</p>
                    <p className="text-xs text-gray-500 mt-0.5">••••4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge className="mr-3 bg-green-100 text-green-700 border-0 h-6">
                    Primary
                  </Badge>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
              <div className="h-px bg-gray-100"></div>
              <Link
                href="/bank-accounts/2"
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">SBI Bank</p>
                    <p className="text-xs text-gray-500 mt-0.5">••••8901</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
              <div className="h-px bg-gray-100"></div>
              <Link
                href="/add-bank-account"
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Add Bank Account</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Link a new account
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto flex justify-between px-6 py-2">
          <Link href="/" className="flex flex-col items-center py-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            <span className="text-xs mt-1 font-medium text-blue-600">Home</span>
          </Link>
          <Link
            href="/transactions"
            className="flex flex-col items-center py-2"
          >
            <Receipt className="h-6 w-6 text-gray-400" />
            <span className="text-xs mt-1 text-gray-500">History</span>
          </Link>
          <Link href="/scan-qr" className="flex flex-col items-center py-2">
            <div className="bg-blue-600 rounded-full p-3 -mt-8 shadow-lg border-4 border-white">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-gray-500">Scan</span>
          </Link>
          <Link href="/offers" className="flex flex-col items-center py-2">
            <Gift className="h-6 w-6 text-gray-400" />
            <span className="text-xs mt-1 text-gray-500">Rewards</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src="/placeholder.svg?height=24&width=24"
                alt="User"
              />
              <AvatarFallback className="bg-gray-100 text-gray-700">
                SH
              </AvatarFallback>
            </Avatar>
            <span className="text-xs mt-1 text-gray-500">Profile</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
