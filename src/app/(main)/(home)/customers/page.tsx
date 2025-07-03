"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SelectItem } from "@/components/ui/select"
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
  MessageSquare,
  Star,
  AlertTriangle,
  Filter,
  Download,
  Send,
  Reply,
  TrendingUp,
  Users,
} from "lucide-react"
import { FormField, ValidatedInput, ValidatedTextarea, ValidatedSelect } from "@/components/form-field"
import { useDashboardStore } from "@/lib/store"
import { toast } from "sonner"

export default function CustomersPage() {
  const {
    customers,
    messages,
    reviews,
    disputes,
    customerFilters,
    replyToMessage,
    updateMessageStatus,
    updateReviewStatus,
    resolveDispute,
    updateDisputeStatus,
  } = useDashboardStore()

  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolutionText, setResolutionText] = useState("")
  const [resolutionAction, setResolutionAction] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerFilters.search.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerFilters.search.toLowerCase()),
  )

  const handleReplyToMessage = (messageId: string) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message")
      return
    }

    replyToMessage(messageId, replyText)
    setReplyText("")
    setSelectedMessage(null)
    toast.success("Reply sent successfully!")
  }

  const handleReviewAction = (reviewId: string, action: string) => {
    updateReviewStatus(reviewId, action as any)
    toast.success(`Review ${action} successfully!`)
  }

  const handleDisputeResolution = (disputeId: string) => {
    if (!resolutionText.trim() || !resolutionAction) {
      toast.error("Please provide resolution details")
      return
    }

    resolveDispute(disputeId, resolutionText)
    setResolutionText("")
    setResolutionAction("")
    setSelectedDispute(null)
    toast.success("Dispute resolved successfully!")
  }

  const unreadMessages = messages.filter((m) => m.status === "unread")
  const pendingReviews = reviews.filter((r) => r.status === "pending")
  const openDisputes = disputes.filter((d) => d.status === "open")

  // Customer Analytics
  const totalCustomers = customers.length
  const vipCustomers = customers.filter((c) => c.status === "vip").length
  const activeCustomers = customers.filter((c) => c.status === "active").length
  const avgRating = customers.reduce((sum, c) => sum + c.rating, 0) / customers.length
  const totalSpent = customers.reduce((sum, c) => sum + Number.parseFloat(c.spent.replace("$", "").replace(",", "")), 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customer Hub</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Exporting customer data...")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Customer Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">{vipCustomers} VIP customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages.length + openDisputes.length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">All Customers ({customers.length})</TabsTrigger>
          <TabsTrigger value="messages">
            Messages ({unreadMessages.length})
            {unreadMessages.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadMessages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({pendingReviews.length})
            {pendingReviews.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disputes">
            Disputes ({openDisputes.length})
            {openDisputes.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {openDisputes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={customerFilters.search}
                onChange={(e) =>
                  useDashboardStore.setState((state) => ({
                    customerFilters: { ...state.customerFilters, search: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage your customer relationships.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                            <AvatarFallback>
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "vip" ? "default" : "secondary"}>{customer.status}</Badge>
                      </TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell className="font-medium">{customer.spent}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {customer.rating}
                        </div>
                      </TableCell>
                      <TableCell>{customer.lastOrder}</TableCell>
                      <TableCell>
                        {customer.messages > 0 ? (
                          <Badge variant="destructive">{customer.messages}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Message to {customer.name}</DialogTitle>
                                <DialogDescription>Send a direct message to this customer</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <FormField label="Subject" required>
                                  <ValidatedInput placeholder="Enter message subject" />
                                </FormField>
                                <FormField label="Message" required>
                                  <ValidatedTextarea
                                    placeholder="Type your message here..."
                                    className="min-h-[120px]"
                                  />
                                </FormField>
                                <FormField label="Priority">
                                  <ValidatedSelect placeholder="Select priority">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </ValidatedSelect>
                                </FormField>
                                <Button onClick={() => toast.success("Message sent successfully!")}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Message
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.success(`Viewing ${customer.name}'s order history`)}
                          >
                            View Orders
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Messages</CardTitle>
              <CardDescription>Manage customer inquiries and support requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {message.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{message.customer}</p>
                          <Badge variant={message.status === "unread" ? "destructive" : "secondary"}>
                            {message.status}
                          </Badge>
                          <Badge variant={message.priority === "high" ? "destructive" : "outline"}>
                            {message.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{message.date}</p>
                      </div>
                      <p className="font-medium">{message.subject}</p>
                      <p className="text-sm text-muted-foreground">{message.preview}</p>

                      {/* Show replies if any */}
                      {message.replies && message.replies.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="bg-muted p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  {reply.sender === "seller" ? "You" : message.customer}
                                </span>
                                <span className="text-xs text-muted-foreground">{reply.date}</span>
                              </div>
                              <p className="text-sm">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedMessage(message)}>
                              <Reply className="mr-2 h-4 w-4" />
                              Reply
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Reply to {message.customer}</DialogTitle>
                              <DialogDescription>Re: {message.subject}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium">Original Message:</p>
                                <p className="text-sm text-muted-foreground mt-1">{message.message}</p>
                              </div>
                              <FormField label="Your Reply" required>
                                <ValidatedTextarea
                                  placeholder="Type your reply here..."
                                  className="min-h-[120px]"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                              </FormField>
                              <div className="flex space-x-2">
                                <Button onClick={() => handleReplyToMessage(message.id)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Reply
                                </Button>
                                <Button variant="outline" onClick={() => toast.success("Template saved!")}>
                                  Save as Template
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateMessageStatus(message.id, "read")
                            toast.success("Message marked as read")
                          }}
                        >
                          Mark as Read
                        </Button>
                        {message.orderId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success(`Viewing order ${message.orderId}`)}
                          >
                            View Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Reviews</CardTitle>
              <CardDescription>Manage customer reviews and ratings for your products.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{review.customer}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge
                            variant={
                              review.status === "published"
                                ? "default"
                                : review.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {review.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.product}</p>
                        <p className="text-sm">{review.comment}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{review.date}</span>
                          <span>{review.helpful} found helpful</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleReviewAction(review.id, "published")}>
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewAction(review.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {review.status === "flagged" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReviewAction(review.id, "published")}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Review & Approve
                          </Button>
                        )}
                        {review.status === "published" && (
                          <Button variant="outline" size="sm" onClick={() => handleReviewAction(review.id, "flagged")}>
                            Flag Review
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success(`Responding to ${review.customer}'s review`)}
                        >
                          Respond
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Resolution</CardTitle>
              <CardDescription>Handle customer disputes and resolution requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {disputes.length > 0 ? (
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <div key={dispute.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{dispute.customer}</p>
                            <Badge variant={dispute.status === "open" ? "destructive" : "default"}>
                              {dispute.status}
                            </Badge>
                            <Badge variant={dispute.priority === "high" ? "destructive" : "secondary"}>
                              {dispute.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Order: {dispute.orderId}</p>
                          <p className="font-medium">{dispute.issue}</p>
                          <p className="text-sm">{dispute.description}</p>
                          <p className="text-xs text-muted-foreground">{dispute.date}</p>
                          {dispute.resolution && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm font-medium text-green-800">Resolution:</p>
                              <p className="text-sm text-green-700">{dispute.resolution}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {dispute.status === "open" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedDispute(dispute)}>
                                  Resolve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resolve Dispute - {dispute.id}</DialogTitle>
                                  <DialogDescription>Provide a resolution for this customer dispute</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium">Issue: {dispute.issue}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{dispute.description}</p>
                                  </div>
                                  <FormField label="Resolution Action" required>
                                    <ValidatedSelect
                                      placeholder="Select resolution"
                                      value={resolutionAction}
                                      onValueChange={setResolutionAction}
                                    >
                                      <SelectItem value="refund">Full Refund</SelectItem>
                                      <SelectItem value="partial_refund">Partial Refund</SelectItem>
                                      <SelectItem value="replacement">Send Replacement</SelectItem>
                                      <SelectItem value="store_credit">Store Credit</SelectItem>
                                      <SelectItem value="no_action">No Action Required</SelectItem>
                                    </ValidatedSelect>
                                  </FormField>
                                  <FormField label="Resolution Notes" required>
                                    <ValidatedTextarea
                                      placeholder="Explain the resolution and any next steps..."
                                      className="min-h-[120px]"
                                      value={resolutionText}
                                      onChange={(e) => setResolutionText(e.target.value)}
                                    />
                                  </FormField>
                                  <div className="flex space-x-2">
                                    <Button onClick={() => handleDisputeResolution(dispute.id)}>Resolve Dispute</Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        updateDisputeStatus(dispute.id, "in_progress")
                                        toast.success("Dispute escalated to management")
                                      }}
                                    >
                                      Escalate
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success(`Contacting ${dispute.customer}`)}
                          >
                            Contact Customer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No active disputes</h3>
                  <p className="text-muted-foreground">Customer disputes will appear here when reported.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
