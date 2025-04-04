import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import FraudTypeChart from "@/components/fraud-type-chart"
import FraudStatusChart from "@/components/fraud-status-chart"
import TargetedUsersTable from "@/components/targeted-users-table"

export default function AnalyticsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-md px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Fraud Analytics</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Fraud by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <FraudTypeChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transaction Status</CardTitle>
            </CardHeader>
            <CardContent>
              <FraudStatusChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Most Targeted Users</CardTitle>
            </CardHeader>
            <CardContent>
              <TargetedUsersTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

