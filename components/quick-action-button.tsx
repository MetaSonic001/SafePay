import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface QuickActionButtonProps {
  icon: React.ReactNode
  label: string
  href: string
  variant?: "default" | "outline"
}

export default function QuickActionButton({ icon, label, href, variant = "default" }: QuickActionButtonProps) {
  return (
    <Link href={href} className="flex flex-col items-center">
      <Button
        variant={variant}
        size="icon"
        className={`h-14 w-14 rounded-full mb-1 ${
          variant === "default" ? "" : "bg-primary/10 border-primary/20 hover:bg-primary/20"
        }`}
      >
        {icon}
      </Button>
      <span className="text-xs text-center">{label}</span>
    </Link>
  )
}

