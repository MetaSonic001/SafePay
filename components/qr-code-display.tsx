"use client"
import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

export default function QRCodeDisplay({ value }: { value: string }) {
  const qrRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Import QRCodeStyling dynamically to avoid SSR issues
        const QRCodeStyling = (await import('qr-code-styling')).default
        
        if (!qrRef.current) return
        // Clear previous QR code
        while (qrRef.current.firstChild) {
          qrRef.current.removeChild(qrRef.current.firstChild)
        }
        
        const qrCode = new QRCodeStyling({
          width: 200,
          height: 200,
          data: value || "No data provided",
          dotsOptions: {
            color: "#000000",
            type: "square"
          },
          backgroundOptions: {
            color: "#ffffff",
          },
          cornersSquareOptions: {
            color: "#000000",
            type: "square",
          },
          cornersDotOptions: {
            color: "#000000",
            type: "square",
          },
        })
        
        qrCode.append(qrRef.current)
      } catch (err) {
        console.error("QR code generation error:", err)
        setError("Failed to generate QR code")
      }
    }
    
    generateQRCode()
  }, [value])

  if (error) {
    return (
      <Card className="w-52 h-52 flex items-center justify-center">
        <p className="text-sm text-red-500">Error: {error}</p>
      </Card>
    )
  }

  return (
    <Card className="w-52 h-52 flex items-center justify-center p-4">
      <div ref={qrRef} className="qr-code-container" />
    </Card>
  )
}