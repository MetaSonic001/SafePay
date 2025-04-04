import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface TransactionResultProps {
  status: "Success" | "Suspicious" | "Blocked"
  message: string
  amount: number
  recipient: string
}

export default function TransactionResult({ status, message, amount, recipient }: TransactionResultProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 flex flex-col items-center text-center">
          {status === "Success" && (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          )}

          {status === "Suspicious" && (
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          )}

          {status === "Blocked" && (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}

          <h2 className="text-xl font-bold mb-2">
            {status === "Success"
              ? "Payment Successful"
              : status === "Suspicious"
                ? "Payment Under Review"
                : "Payment Blocked"}
          </h2>

          <p className="text-muted-foreground mb-6">{message}</p>

          <div className="w-full mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium">{recipient}</span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            <Link href="/" className="w-full">
              <Button className="w-full">Back to Home</Button>
            </Link>
            {status === "Suspicious" && (
              <Button variant="outline" className="w-full">
                Report Issue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

