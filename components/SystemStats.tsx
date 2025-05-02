"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { AlertTriangle, ShieldCheck, TrendingUp, Activity } from 'lucide-react'

export default function SystemStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/system-stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch system stats')
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching system stats:', err)
        setError('Failed to load system statistics')
        
        // Set mock data if real data fails
        setStats({
          total_transactions: 1245,
          fraud_detected: 87,
          fraud_rate: 6.98,
          avg_risk_score: 32.5,
          transaction_history: [
            { date: '2025-04-25', transactions: 156, fraud_detected: 12 },
            { date: '2025-04-26', transactions: 142, fraud_detected: 8 },
            { date: '2025-04-27', transactions: 158, fraud_detected: 11 },
            { date: '2025-04-28', transactions: 189, fraud_detected: 14 },
            { date: '2025-04-29', transactions: 201, fraud_detected: 16 },
            { date: '2025-04-30', transactions: 187, fraud_detected: 13 },
            { date: '2025-05-01', transactions: 212, fraud_detected: 13 }
          ]
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800">
        <CardContent className="py-4">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">
              {stats?.total_transactions?.toLocaleString?.() ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">+2.5% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">{stats?.fraud_detected}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.fraud_rate ? stats.fraud_rate.toFixed(1) : 'N/A'}% fraud rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold">
                {stats?.avg_risk_score ? stats.avg_risk_score.toFixed(1) : 'N/A'}
              </div>
                          <p className="text-xs text-muted-foreground">
              {stats.avg_risk_score < 30 ? 'Low risk overall' : 'Moderate risk level'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.transaction_history 
                ? stats.transaction_history[stats.transaction_history.length - 1].transactions 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.transaction_history && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.transaction_history}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => {
                      const date = new Date(val);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Transactions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fraud_detected" 
                    stroke="#ff5252" 
                    name="Fraud Detected" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}