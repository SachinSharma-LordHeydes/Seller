"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Printer,
  Mail,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboardStore, type Order } from "@/lib/store"
import { toast } from "sonner"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Package className="h-3 w-3 sm:h-4 sm:w-4" />
    case "processing":
      return <Package className="h-3 w-3 sm:h-4 sm:w-4" />
    case "shipped":
      return <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
    case "delivered":
      return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
    case "cancelled":
    case "returned":
      return <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
    default:
      return <Package className="h-3 w-3 sm:h-4 sm:w-4" />
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "secondary"
    case "processing":
      return "default"
    case "shipped":
      return "outline"
    case "delivered":
      return "default"
    case "cancelled":
    case "returned":
      return "destructive"
    default:
      return "secondary"
  }
}

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive"
    case "normal":
      return "secondary"
    case "low":
      return "outline"
    default:
      return "secondary"
  }
}

export default function OrdersPage() {
  const {
    orders,
    selectedOrders,
    orderFilters,
    updateOrderStatus,
    bulkUpdateOrders,
    selectOrder,
    selectAllOrders,
    clearSelectedOrders,
    setOrderFilters,
  } = useDashboardStore()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(orderFilters.search.toLowerCase()) ||
      order.id.toLowerCase().includes(orderFilters.search.toLowerCase())
    const matchesStatus = orderFilters.status === "all" || order.status === orderFilters.status
    const matchesPriority = orderFilters.priority === "all" || order.priority === orderFilters.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first")
      return
    }

    switch (action) {
      case "mark_processing":
        bulkUpdateOrders(selectedOrders, "processing")
        toast.success(`${selectedOrders.length} orders marked as processing`)
        break
      case "mark_shipped":
        bulkUpdateOrders(selectedOrders, "shipped")
        toast.success(`${selectedOrders.length} orders marked as shipped`)
        break
      case "print_labels":
        toast.success(`Printing labels for ${selectedOrders.length} orders`)
        break
      case "export":
        toast.success(`Exporting ${selectedOrders.length} orders`)
        break
      default:
        break
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus)
    toast.success(`Order ${orderId} updated to ${newStatus}`)
  }

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter((order) => order.status === status)
  }

  return (
    <div className="flex-1 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Exporting orders...")}
            className="text-xs sm:text-sm"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
            <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8 text-sm"
            value={orderFilters.search}
            onChange={(e) => setOrderFilters({ search: e.target.value })}
          />
        </div>
        <div className="flex space-x-2">
          <Select value={orderFilters.status} onValueChange={(value) => setOrderFilters({ status: value })}>
            <SelectTrigger className="w-full sm:w-[140px] text-xs sm:text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orderFilters.priority} onValueChange={(value) => setOrderFilters({ priority: value })}>
            <SelectTrigger className="w-full sm:w-[120px] text-xs sm:text-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {selectedOrders.length} order(s) selected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => handleBulkAction("mark_processing")} className="text-xs">
                  Mark Processing
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("mark_shipped")} className="text-xs">
                  Mark Shipped
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("print_labels")}
                  className="text-xs"
                >
                  <Printer className="mr-1 h-3 w-3" />
                  Print
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("export")} className="text-xs">
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={clearSelectedOrders} className="text-xs bg-transparent">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 text-xs sm:text-sm">
          <TabsTrigger value="all" className="px-2">
            All ({filteredOrders.length})
          </TabsTrigger>
          <TabsTrigger value="new" className="px-2">
            New ({getOrdersByStatus("pending").length})
          </TabsTrigger>
          <TabsTrigger value="processing" className="px-2">
            Processing ({getOrdersByStatus("processing").length})
          </TabsTrigger>
          <TabsTrigger value="shipped" className="px-2">
            Shipped ({getOrdersByStatus("shipped").length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="px-2">
            Delivered ({getOrdersByStatus("delivered").length})
          </TabsTrigger>
          <TabsTrigger value="returns" className="px-2">
            Returns ({getOrdersByStatus("returned").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Order Management</CardTitle>
              <CardDescription className="text-sm">Manage and track all your orders in one place.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8 sm:w-12">
                        <Checkbox
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onCheckedChange={selectAllOrders}
                        />
                      </TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">Order ID</TableHead>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm">Customer</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Priority</TableHead>
                      <TableHead className="text-xs sm:text-sm">Total</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">Items</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => selectOrder(order.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">{order.id}</TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{order.customer}</div>
                            <div className="text-xs text-muted-foreground truncate">{order.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(order.status)}
                            className="flex items-center gap-1 w-fit text-xs"
                          >
                            {getStatusIcon(order.status)}
                            <span className="hidden sm:inline">{order.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant={getPriorityVariant(order.priority)} className="text-xs">
                            {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">{order.total}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">{order.items}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{order.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-base sm:text-lg">Order Details - {order.id}</DialogTitle>
                                  <DialogDescription className="text-sm">
                                    Complete order information and management options
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                      <div className="space-y-3 sm:space-y-4">
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm sm:text-base">
                                            Customer Information
                                          </h4>
                                          <div className="space-y-1">
                                            <p className="text-sm">{selectedOrder.customer}</p>
                                            <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm sm:text-base">Order Status</h4>
                                          <Badge variant={getStatusVariant(selectedOrder.status)} className="text-xs">
                                            {selectedOrder.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm sm:text-base">Priority</h4>
                                          <Badge
                                            variant={getPriorityVariant(selectedOrder.priority)}
                                            className="text-xs"
                                          >
                                            {selectedOrder.priority}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="space-y-3 sm:space-y-4">
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm sm:text-base">Shipping Address</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedOrder.shippingAddress}
                                          </p>
                                        </div>
                                        {selectedOrder.trackingNumber && (
                                          <div>
                                            <h4 className="font-medium mb-2 text-sm sm:text-base">Tracking Number</h4>
                                            <p className="text-sm font-mono bg-muted p-2 rounded">
                                              {selectedOrder.trackingNumber}
                                            </p>
                                          </div>
                                        )}
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm sm:text-base">Order Total</h4>
                                          <p className="text-base sm:text-lg font-semibold">{selectedOrder.total}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-3 text-sm sm:text-base">Order Items</h4>
                                      <div className="border rounded-lg overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="text-xs sm:text-sm">Product</TableHead>
                                              <TableHead className="text-xs sm:text-sm">Quantity</TableHead>
                                              <TableHead className="text-xs sm:text-sm">Price</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedOrder.products.map((product, index) => (
                                              <TableRow key={index}>
                                                <TableCell className="font-medium text-xs sm:text-sm">
                                                  {product.name}
                                                </TableCell>
                                                <TableCell className="text-xs sm:text-sm">{product.quantity}</TableCell>
                                                <TableCell className="text-xs sm:text-sm">{product.price}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      {selectedOrder.status === "pending" && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleStatusUpdate(selectedOrder.id, "processing")}
                                          className="text-xs"
                                        >
                                          Start Processing
                                        </Button>
                                      )}
                                      {selectedOrder.status === "processing" && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleStatusUpdate(selectedOrder.id, "shipped")}
                                          className="text-xs"
                                        >
                                          Mark as Shipped
                                        </Button>
                                      )}
                                      {selectedOrder.status === "shipped" && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleStatusUpdate(selectedOrder.id, "delivered")}
                                          className="text-xs"
                                        >
                                          Mark as Delivered
                                        </Button>
                                      )}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toast.success("Printing shipping label...")}
                                        className="text-xs"
                                      >
                                        <Printer className="mr-1 h-3 w-3" />
                                        Print Label
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toast.success("Opening email client...")}
                                        className="text-xs"
                                      >
                                        <Mail className="mr-1 h-3 w-3" />
                                        Contact
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toast.success("Printing invoice...")}
                                        className="text-xs"
                                      >
                                        Print Invoice
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {order.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(order.id, "processing")}
                                    className="text-xs"
                                  >
                                    Start Processing
                                  </DropdownMenuItem>
                                )}
                                {order.status === "processing" && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(order.id, "shipped")}
                                    className="text-xs"
                                  >
                                    Mark as Shipped
                                  </DropdownMenuItem>
                                )}
                                {order.status === "shipped" && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(order.id, "delivered")}
                                    className="text-xs"
                                  >
                                    Mark as Delivered
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => toast.success("Printing invoice...")}
                                  className="text-xs"
                                >
                                  Print Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toast.success("Printing shipping label...")}
                                  className="text-xs"
                                >
                                  Print Shipping Label
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toast.success("Opening email client...")}
                                  className="text-xs"
                                >
                                  Contact Customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual status tabs */}
        {["new", "processing", "shipped", "delivered", "returns"].map((tabValue) => {
          const statusMap = {
            new: "pending",
            processing: "processing",
            shipped: "shipped",
            delivered: "delivered",
            returns: "returned",
          }
          const status = statusMap[tabValue as keyof typeof statusMap]
          const statusOrders = getOrdersByStatus(status)

          return (
            <TabsContent key={tabValue} value={tabValue} className="space-y-3 sm:space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    {tabValue === "new"
                      ? "New Orders"
                      : tabValue === "returns"
                        ? "Returns & Refunds"
                        : `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Orders`}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {tabValue === "new"
                      ? "Orders that require immediate attention."
                      : tabValue === "processing"
                        ? "Orders currently being prepared for shipment."
                        : tabValue === "shipped"
                          ? "Orders that have been shipped and are in transit."
                          : tabValue === "delivered"
                            ? "Orders that have been successfully delivered."
                            : "Manage return requests and refund processing."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                            <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                            <TableHead className="text-xs sm:text-sm">Total</TableHead>
                            <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Date</TableHead>
                            {tabValue === "shipped" && (
                              <TableHead className="hidden md:table-cell text-xs sm:text-sm">Tracking</TableHead>
                            )}
                            <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statusOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium text-xs sm:text-sm">{order.id}</TableCell>
                              <TableCell className="text-xs sm:text-sm truncate max-w-[120px]">
                                {order.customer}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">{order.total}</TableCell>
                              <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{order.date}</TableCell>
                              {tabValue === "shipped" && (
                                <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                                  {order.trackingNumber ? (
                                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                                      {order.trackingNumber}
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, "shipped")}
                                      className="text-xs"
                                    >
                                      Generate Tracking
                                    </Button>
                                  )}
                                </TableCell>
                              )}
                              <TableCell>
                                {tabValue === "new" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order.id, "processing")}
                                    className="text-xs"
                                  >
                                    Start Processing
                                  </Button>
                                )}
                                {tabValue === "processing" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order.id, "shipped")}
                                    className="text-xs"
                                  >
                                    Mark as Shipped
                                  </Button>
                                )}
                                {tabValue === "shipped" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order.id, "delivered")}
                                    className="text-xs"
                                  >
                                    Mark as Delivered
                                  </Button>
                                )}
                                {tabValue === "delivered" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toast.success("Feedback request sent!")}
                                    className="text-xs"
                                  >
                                    Request Feedback
                                  </Button>
                                )}
                                {tabValue === "returns" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toast.success("Processing return...")}
                                    className="text-xs"
                                  >
                                    Process Return
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      {getStatusIcon(status)}
                      <h3 className="mt-4 text-base sm:text-lg font-semibold">
                        No {tabValue === "new" ? "new" : tabValue} orders
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tabValue === "new"
                          ? "New orders will appear here when received."
                          : tabValue === "returns"
                            ? "Return requests will appear here."
                            : `${tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} orders will appear here.`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
