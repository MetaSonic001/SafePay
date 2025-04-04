"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Blocked", value: 32, fill: "#ef4444" },
  { name: "Suspicious", value: 45, fill: "#f59e0b" },
  { name: "Success", value: 123, fill: "#10b981" },
]

export default function FraudStatusChart() {
  return (
    <ChartContainer
      config={{
        name: {
          label: "Status",
        },
        value: {
          label: "Transactions",
        },
      }}
      className="h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

