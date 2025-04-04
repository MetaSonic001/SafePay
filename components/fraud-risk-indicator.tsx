interface FraudRiskIndicatorProps {
  score: number // 0-100
}

export default function FraudRiskIndicator({ score }: FraudRiskIndicatorProps) {
  // Determine color and label based on score
  let color = ""
  let label = ""

  if (score <= 30) {
    color = "text-green-500"
    label = "Low"
  } else if (score <= 60) {
    color = "text-yellow-500"
    label = "Medium"
  } else {
    color = "text-red-500"
    label = "High"
  }

  return (
    <div className="flex items-center gap-1">
      <div
        className={`h-2 w-2 rounded-full ${
          score <= 30 ? "bg-green-500" : score <= 60 ? "bg-yellow-500" : "bg-red-500"
        }`}
      ></div>
      <span className={`font-medium ${color}`}>
        {score}/100 ({label})
      </span>
    </div>
  )
}

