"use client"

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error)
        }
      )
    }
  }, [value, size])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border rounded" />
      <p className="text-xs text-gray-500 mt-2">Scan to simulate payment</p>
    </div>
  )
}