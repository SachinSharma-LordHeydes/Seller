import { Progress } from "@/components/ui/progress"

const topProducts = [
  {
    name: "Wireless Headphones",
    sales: 1234,
    revenue: "$24,680",
    progress: 85,
  },
  {
    name: "Smart Watch",
    sales: 987,
    revenue: "$19,740",
    progress: 72,
  },
  {
    name: "Laptop Stand",
    sales: 756,
    revenue: "$15,120",
    progress: 58,
  },
  {
    name: "USB-C Cable",
    sales: 543,
    revenue: "$10,860",
    progress: 45,
  },
  {
    name: "Phone Case",
    sales: 432,
    revenue: "$8,640",
    progress: 38,
  },
]

export function TopProducts() {
  return (
    <div className="space-y-6">
      {topProducts.map((product, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.sales} sales • {product.revenue}
              </p>
            </div>
          </div>
          <Progress value={product.progress} className="h-2" />
        </div>
      ))}
    </div>
  )
}
