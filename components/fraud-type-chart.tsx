"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { type: "Phishing", count: 24, fill: "hsl(var(--chart-1))" },
  { type: "QR Tampering", count: 18, fill: "hsl(var(--chart-2))" },
  { type: "Anomaly", count: 12, fill: "hsl(var(--chart-3))" },
  { type: "Impersonation", count: 9, fill: "hsl(var(--chart-4))" },
  { type: "Malware", count: 6, fill: "hsl(var(--chart-5))" },
]

export default function FraudTypeChart() {
  return (
    <ChartContainer
      config={{
        type: {
          label: "Fraud Type",
        },
        count: {
          label: "Count",
        },
      }}
      className="h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" />
          <YAxis dataKey="type" type="category" scale="band" />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

