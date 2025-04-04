import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const targetedUsers = [
  {
    name: "Ravi Kumar",
    upiId: "ravi@okbank",
    fraudAttempts: 5,
    riskLevel: "high",
  },
  {
    name: "Priya Singh",
    upiId: "priya@yesbank",
    fraudAttempts: 3,
    riskLevel: "medium",
  },
  {
    name: "Amit Patel",
    upiId: "amit@sbibank",
    fraudAttempts: 2,
    riskLevel: "medium",
  },
]

export default function TargetedUsersTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">User</th>
            <th className="pb-2 font-medium">Attempts</th>
            <th className="pb-2 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {targetedUsers.map((user) => (
            <tr key={user.upiId} className="border-t">
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=${user.name.charAt(0)}`}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.upiId}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 text-sm">{user.fraudAttempts}</td>
              <td className="py-3">
                {user.riskLevel === "high" ? (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    High
                  </Badge>
                ) : user.riskLevel === "medium" ? (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Medium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Low
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

