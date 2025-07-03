import { Button } from "@/components/ui/button"
import { Plus, Package, ShoppingCart, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="space-y-3">
      <Button asChild className="w-full justify-start">
        <Link href="/products/add">
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start bg-transparent">
        <Link href="/orders/new">
          <ShoppingCart className="mr-2 h-4 w-4" />
          View New Orders
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start bg-transparent">
        <Link href="/products/inventory">
          <Package className="mr-2 h-4 w-4" />
          Check Inventory
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start bg-transparent">
        <Link href="/marketing/campaigns">
          <TrendingUp className="mr-2 h-4 w-4" />
          Create Campaign
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start bg-transparent">
        <Link href="/customers/messages">
          <MessageSquare className="mr-2 h-4 w-4" />
          Customer Messages
        </Link>
      </Button>
    </div>
  )
}
