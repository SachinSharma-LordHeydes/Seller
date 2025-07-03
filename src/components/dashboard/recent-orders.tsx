import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    status: "completed",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "ORD-002",
    customer: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    status: "processing",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "ORD-003",
    customer: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    status: "shipped",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "ORD-004",
    customer: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    status: "completed",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "ORD-005",
    customer: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    status: "pending",
    avatar: "/placeholder-user.jpg",
  },
]

export function RecentOrders() {
  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={order.avatar || "/placeholder.svg"} alt="Avatar" />
            <AvatarFallback>
              {order.customer
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customer}</p>
            <p className="text-sm text-muted-foreground">{order.email}</p>
          </div>
          <div className="ml-auto font-medium">
            <div className="text-right">
              <div>{order.amount}</div>
              <Badge
                variant={
                  order.status === "completed"
                    ? "default"
                    : order.status === "processing"
                      ? "secondary"
                      : order.status === "shipped"
                        ? "outline"
                        : "destructive"
                }
                className="text-xs"
              >
                {order.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
