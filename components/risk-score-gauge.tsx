"use client"

import { useEffect, useState } from "react"

interface RiskScoreGaugeProps {
  score: number // 0-100
}

export default function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 100)

    return () => clearTimeout(timer)
  }, [score])

  // Calculate the color based on the score
  const getColor = (score: number) => {
    if (score <= 40) return "#10b981" // Green
    if (score <= 70) return "#f59e0b" // Yellow/Amber
    return "#ef4444" // Red
  }

  // Calculate the rotation angle for the needle
  const angle = (animatedScore / 100) * 180 - 90

  return (
    <div className="relative w-full max-w-[200px] mx-auto">
      <div className="relative h-[100px] overflow-hidden">
        {/* Gauge background */}
        <div className="absolute w-[200px] h-[200px] rounded-full border-[20px] border-gray-100 top-0 left-1/2 transform -translate-x-1/2"></div>

        {/* Green zone */}
        <div className="absolute w-[200px] h-[200px] rounded-full border-[20px] border-transparent border-t-green-500 top-0 left-1/2 transform -translate-x-1/2 rotate-[135deg]"></div>

        {/* Yellow zone */}
        <div className="absolute w-[200px] h-[200px] rounded-full border-[20px] border-transparent border-t-yellow-500 top-0 left-1/2 transform -translate-x-1/2 rotate-[195deg]"></div>

        {/* Red zone */}
        <div className="absolute w-[200px] h-[200px] rounded-full border-[20px] border-transparent border-t-red-500 top-0 left-1/2 transform -translate-x-1/2 rotate-[255deg]"></div>

        {/* Needle */}
        <div
          className="absolute w-[4px] h-[70px] bg-gray-800 rounded-full top-[100px] left-1/2 transform -translate-x-1/2 origin-bottom transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        ></div>

        {/* Center circle */}
        <div className="absolute w-[20px] h-[20px] bg-gray-800 rounded-full top-[90px] left-1/2 transform -translate-x-1/2"></div>
      </div>

      {/* Score display */}
      <div className="text-center mt-4">
        <span className="text-3xl font-bold transition-colors duration-500" style={{ color: getColor(animatedScore) }}>
          {Math.round(animatedScore)}
        </span>
        <span className="text-lg text-gray-500">/100</span>
      </div>
    </div>
  )
}

