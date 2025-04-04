import Link from "next/link"
import { AlertTriangle } from "lucide-react"

interface FraudAlertBannerProps {
  title: string
  message: string
  href: string
}

export default function FraudAlertBanner({ title, message, href }: FraudAlertBannerProps) {
  return (
    <Link href={href}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3 hover:bg-yellow-100 transition-colors">
        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-medium text-sm text-yellow-800">{title}</h3>
          <p className="text-xs text-yellow-700">{message}</p>
        </div>
      </div>
    </Link>
  )
}

