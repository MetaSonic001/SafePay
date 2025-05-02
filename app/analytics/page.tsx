"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import SystemStats from "@/components/SystemStats"
import FraudTypeChart from "@/components/fraud-type-chart"

export default function AnalyticsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Fraud Analytics Dashboard</h1>
        </div>

        <div className="space-y-6">
          <SystemStats />
          
          <div className="grid gap-6 md:grid-cols-2">
            <FraudTypeChart />
            
            <Card>
              <CardHeader>
                <CardTitle>High-Risk Geolocations</CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-sm text-gray-500">
                  Map visualization would go here in production environment
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Transaction Patterns</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Custom transaction pattern visualization would go here in production
              </p>
              <Link href="/simulation">
                <Button>Test Fraud Detection</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}