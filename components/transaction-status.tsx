import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface TransactionStatusProps {
  status: "Success" | "Suspicious" | "Blocked"
}

export default function TransactionStatus({ status }: TransactionStatusProps) {
  switch (status) {
    case "Success":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Success
        </Badge>
      )
    case "Suspicious":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Suspicious
        </Badge>
      )
    case "Blocked":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Blocked
        </Badge>
      )
    default:
      return null
  }
}

