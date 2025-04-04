import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface PromotionCardProps {
  title: string
  description: string
  image: string
  href: string
}

export default function PromotionCard({ title, description, image, href }: PromotionCardProps) {
  return (
    <Link href={href}>
      <Card className="w-[200px] overflow-hidden hover:shadow-md transition-shadow">
        <div className="h-[80px] relative">
          <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

