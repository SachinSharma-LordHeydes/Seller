"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, TrendingUp, Eye, Users, Target, Megaphone, Play, Pause, BarChart3 } from "lucide-react"
import { FormField, ValidatedInput, ValidatedTextarea, ValidatedSelect } from "@/components/form-field"
import { SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useDashboardStore } from "@/lib/store"
import { toast } from "sonner"

export default function MarketingPage() {
  const {
    campaigns,
    discounts,
    promotions,
    advertisements,
    marketingStats,
    createCampaign,
    updateCampaign,
    createDiscount,
    updateDiscount,
    createPromotion,
    updatePromotion,
    createAdvertisement,
    updateAdvertisement,
  } = useDashboardStore()

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "" as any,
    budget: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "draft" as any,
  })

  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "" as any,
    value: "",
    limit: "",
    expires: "",
    description: "",
    status: "active" as any,
  })

  const [newPromotion, setNewPromotion] = useState({
    name: "",
    type: "" as any,
    products: [] as string[],
    startDate: "",
    endDate: "",
    status: "active" as any,
  })

  const [newAd, setNewAd] = useState({
    name: "",
    platform: "" as any,
    budget: "",
    startDate: "",
    endDate: "",
    objective: "" as any,
    targetAudience: "",
    status: "active" as any,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCreateCampaign = () => {
    const newErrors: Record<string, string> = {}

    if (!newCampaign.name.trim()) newErrors.name = "Campaign name is required"
    if (!newCampaign.type) newErrors.type = "Campaign type is required"
    if (!newCampaign.budget) newErrors.budget = "Budget is required"
    if (!newCampaign.startDate) newErrors.startDate = "Start date is required"
    if (!newCampaign.endDate) newErrors.endDate = "End date is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      createCampaign(newCampaign)
      toast.success("Campaign created successfully!")
      setNewCampaign({
        name: "",
        type: "" as any,
        budget: "",
        startDate: "",
        endDate: "",
        description: "",
        status: "draft" as any,
      })
    }
  }

  const handleCreateDiscount = () => {
    const newErrors: Record<string, string> = {}

    if (!newDiscount.code.trim()) newErrors.code = "Discount code is required"
    if (!newDiscount.type) newErrors.type = "Discount type is required"
    if (!newDiscount.value) newErrors.value = "Discount value is required"
    if (!newDiscount.limit) newErrors.limit = "Usage limit is required"
    if (!newDiscount.expires) newErrors.expires = "Expiry date is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      createDiscount(newDiscount)
      toast.success("Discount code created successfully!")
      setNewDiscount({
        code: "",
        type: "" as any,
        value: "",
        limit: "",
        expires: "",
        description: "",
        status: "active" as any,
      })
    }
  }

  const handleCreatePromotion = () => {
    const newErrors: Record<string, string> = {}

    if (!newPromotion.name.trim()) newErrors.name = "Promotion name is required"
    if (!newPromotion.type) newErrors.type = "Promotion type is required"
    if (newPromotion.products.length === 0) newErrors.products = "At least one product must be selected"
    if (!newPromotion.startDate) newErrors.startDate = "Start date is required"
    if (!newPromotion.endDate) newErrors.endDate = "End date is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      createPromotion(newPromotion)
      toast.success("Promotion created successfully!")
      setNewPromotion({
        name: "",
        type: "" as any,
        products: [],
        startDate: "",
        endDate: "",
        status: "active" as any,
      })
    }
  }

  const handleCreateAdvertisement = () => {
    const newErrors: Record<string, string> = {}

    if (!newAd.name.trim()) newErrors.name = "Campaign name is required"
    if (!newAd.platform) newErrors.platform = "Platform is required"
    if (!newAd.budget) newErrors.budget = "Budget is required"
    if (!newAd.objective) newErrors.objective = "Objective is required"
    if (!newAd.startDate) newErrors.startDate = "Start date is required"
    if (!newAd.endDate) newErrors.endDate = "End date is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      createAdvertisement(newAd)
      toast.success("Advertisement campaign created successfully!")
      setNewAd({
        name: "",
        platform: "" as any,
        budget: "",
        startDate: "",
        endDate: "",
        objective: "" as any,
        targetAudience: "",
        status: "active" as any,
      })
    }
  }

  const handleCampaignStatusUpdate = (campaignId: string, status: any) => {
    updateCampaign(campaignId, { status })
    toast.success(`Campaign ${status} successfully!`)
  }

  const handleDiscountStatusUpdate = (discountId: string, status: any) => {
    updateDiscount(discountId, { status })
    toast.success(`Discount ${status} successfully!`)
  }

  const handlePromotionStatusUpdate = (promotionId: string, status: any) => {
    updatePromotion(promotionId, { status })
    toast.success(`Promotion ${status} successfully!`)
  }

  const handleAdStatusUpdate = (adId: string, status: any) => {
    updateAdvertisement(adId, { status })
    toast.success(`Advertisement ${status} successfully!`)
  }

  const activeCampaigns = campaigns.filter((c) => c.status === "active")
  const activeDiscounts = discounts.filter((d) => d.status === "active")
  const activePromotions = promotions.filter((p) => p.status === "active")
  const activeAds = advertisements.filter((a) => a.status === "active")

  return (
    <div className="flex-1 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Marketing Hub</h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Create Campaign</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Create New Campaign</DialogTitle>
                <DialogDescription className="text-sm">
                  Set up a new marketing campaign to promote your products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <FormField label="Campaign Name" error={errors.name} required>
                    <ValidatedInput
                      placeholder="Enter campaign name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      error={errors.name}
                      className="text-sm"
                    />
                  </FormField>
                  <FormField label="Campaign Type" error={errors.type} required>
                    <ValidatedSelect
                      value={newCampaign.type}
                      onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value as any })}
                      placeholder="Select campaign type"
                      error={errors.type}
                    >
                      <SelectItem value="discount">Discount Campaign</SelectItem>
                      <SelectItem value="promotion">Product Promotion</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                    </ValidatedSelect>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <FormField label="Budget ($)" error={errors.budget} required>
                    <ValidatedInput
                      type="number"
                      placeholder="0.00"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                      error={errors.budget}
                      className="text-sm"
                    />
                  </FormField>
                  <FormField label="Start Date" error={errors.startDate} required>
                    <ValidatedInput
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                      error={errors.startDate}
                      className="text-sm"
                    />
                  </FormField>
                  <FormField label="End Date" error={errors.endDate} required>
                    <ValidatedInput
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                      error={errors.endDate}
                      className="text-sm"
                    />
                  </FormField>
                </div>
                <FormField label="Description">
                  <ValidatedTextarea
                    placeholder="Describe your campaign objectives and target audience..."
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className="text-sm"
                  />
                </FormField>
                <Button onClick={handleCreateCampaign} className="w-full text-sm">
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Marketing Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">{campaigns.length} total campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{marketingStats.totalImpressions}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Click Rate</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{marketingStats.clickRate}</div>
            <p className="text-xs text-muted-foreground">Average CTR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{marketingStats.conversionRate}</div>
            <p className="text-xs text-muted-foreground">Average conversion</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 text-xs sm:text-sm">
          <TabsTrigger value="campaigns" className="px-2">
            Campaigns ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="discounts" className="px-2">
            Discounts ({discounts.length})
          </TabsTrigger>
          <TabsTrigger value="promotions" className="px-2">
            Promotions ({promotions.length})
          </TabsTrigger>
          <TabsTrigger value="ads" className="px-2">
            Ads ({advertisements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Marketing Campaigns</CardTitle>
              <CardDescription className="text-sm">
                Manage your marketing campaigns and track their performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm">Campaign</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">Budget</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Performance</TableHead>
                      <TableHead className="hidden xl:table-cell text-xs sm:text-sm">Duration</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">{campaign.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{campaign.id}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {campaign.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === "active"
                                ? "default"
                                : campaign.status === "completed"
                                  ? "secondary"
                                  : campaign.status === "paused"
                                    ? "destructive"
                                    : "outline"
                            }
                            className="text-xs"
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div className="font-medium text-xs">
                              {campaign.spent} / {campaign.budget}
                            </div>
                            <Progress
                              value={
                                (Number.parseInt(campaign.spent.replace("$", "").replace(",", "")) /
                                  Number.parseInt(campaign.budget.replace("$", "").replace(",", ""))) *
                                100
                              }
                              className="w-16 sm:w-20 h-2 mt-1"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-xs space-y-1">
                            <div>{campaign.impressions} impressions</div>
                            <div>{campaign.clicks} clicks</div>
                            <div>{campaign.conversions} conversions</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="text-xs">
                            <div>{campaign.startDate}</div>
                            <div>to {campaign.endDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.success(`Viewing analytics for ${campaign.name}`)}
                              className="h-7 w-7 p-0"
                            >
                              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            {campaign.status === "draft" && (
                              <Button
                                size="sm"
                                onClick={() => handleCampaignStatusUpdate(campaign.id, "active")}
                                className="text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Launch</span>
                              </Button>
                            )}
                            {campaign.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCampaignStatusUpdate(campaign.id, "paused")}
                                className="text-xs"
                              >
                                <Pause className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Pause</span>
                              </Button>
                            )}
                            {campaign.status === "paused" && (
                              <Button
                                size="sm"
                                onClick={() => handleCampaignStatusUpdate(campaign.id, "active")}
                                className="text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Resume</span>
                              </Button>
                            )}
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

        <TabsContent value="discounts" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-medium">Discount Codes</h3>
              <p className="text-sm text-muted-foreground">Create and manage discount codes for your customers.</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Create Discount</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Create New Discount</DialogTitle>
                  <DialogDescription className="text-sm">
                    Set up a new discount code for your customers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Discount Code" error={errors.code} required>
                      <ValidatedInput
                        placeholder="e.g., SAVE20"
                        value={newDiscount.code}
                        onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                        error={errors.code}
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="Discount Type" error={errors.type} required>
                      <ValidatedSelect
                        value={newDiscount.type}
                        onValueChange={(value) => setNewDiscount({ ...newDiscount, type: value as any })}
                        placeholder="Select discount type"
                        error={errors.type}
                      >
                        <SelectItem value="percentage">Percentage Off</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="free_shipping">Free Shipping</SelectItem>
                      </ValidatedSelect>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <FormField label="Value" error={errors.value} required>
                      <ValidatedInput
                        placeholder="20"
                        value={newDiscount.value}
                        onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                        error={errors.value}
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="Usage Limit" error={errors.limit} required>
                      <ValidatedInput
                        type="number"
                        placeholder="100"
                        value={newDiscount.limit}
                        onChange={(e) => setNewDiscount({ ...newDiscount, limit: e.target.value })}
                        error={errors.limit}
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="Expiry Date" error={errors.expires} required>
                      <ValidatedInput
                        type="date"
                        value={newDiscount.expires}
                        onChange={(e) => setNewDiscount({ ...newDiscount, expires: e.target.value })}
                        error={errors.expires}
                        className="text-sm"
                      />
                    </FormField>
                  </div>
                  <FormField label="Description">
                    <ValidatedTextarea
                      placeholder="Describe this discount..."
                      value={newDiscount.description}
                      onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                      className="text-sm"
                    />
                  </FormField>
                  <Button onClick={handleCreateDiscount} className="w-full text-sm">
                    Create Discount
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">Code</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="text-xs sm:text-sm">Value</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">Usage</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Expires</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell className="font-mono font-medium text-xs sm:text-sm">{discount.code}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {discount.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {discount.type === "percentage"
                            ? `${discount.value}%`
                            : discount.type === "fixed"
                              ? `$${discount.value}`
                              : "Free Shipping"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div className="font-medium text-xs">
                              {discount.usage} / {discount.limit}
                            </div>
                            <Progress
                              value={(discount.usage / discount.limit) * 100}
                              className="w-16 sm:w-20 h-2 mt-1"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={discount.status === "active" ? "default" : "secondary"} className="text-xs">
                            {discount.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{discount.expires}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.success(`Editing discount ${discount.code}`)}
                              className="text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDiscountStatusUpdate(
                                  discount.id,
                                  discount.status === "active" ? "inactive" : "active",
                                )
                              }
                              className="text-xs"
                            >
                              {discount.status === "active" ? "Disable" : "Enable"}
                            </Button>
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

        <TabsContent value="promotions" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-medium">Featured Promotions</h3>
              <p className="text-sm text-muted-foreground">Manage featured product listings and promotional content.</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Create Promotion</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Create New Promotion</DialogTitle>
                  <DialogDescription className="text-sm">
                    Feature your products to increase visibility and sales
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <FormField label="Promotion Name" error={errors.name} required>
                    <ValidatedInput
                      placeholder="Enter promotion name"
                      value={newPromotion.name}
                      onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                      error={errors.name}
                      className="text-sm"
                    />
                  </FormField>
                  <FormField label="Promotion Type" error={errors.type} required>
                    <ValidatedSelect
                      placeholder="Select promotion type"
                      value={newPromotion.type}
                      onValueChange={(value) => setNewPromotion({ ...newPromotion, type: value as any })}
                      error={errors.type}
                    >
                      <SelectItem value="featured_listing">Featured Product Listing</SelectItem>
                      <SelectItem value="banner">Banner Promotion</SelectItem>
                      <SelectItem value="category_feature">Category Feature</SelectItem>
                      <SelectItem value="homepage_spotlight">Homepage Spotlight</SelectItem>
                    </ValidatedSelect>
                  </FormField>
                  <FormField label="Select Products" error={errors.products} required>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="product1"
                          checked={newPromotion.products.includes("Gaming Mouse Pro")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewPromotion({
                                ...newPromotion,
                                products: [...newPromotion.products, "Gaming Mouse Pro"],
                              })
                            } else {
                              setNewPromotion({
                                ...newPromotion,
                                products: newPromotion.products.filter((p) => p !== "Gaming Mouse Pro"),
                              })
                            }
                          }}
                        />
                        <label htmlFor="product1" className="text-sm">
                          Gaming Mouse Pro
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="product2"
                          checked={newPromotion.products.includes("Mechanical Keyboard RGB")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewPromotion({
                                ...newPromotion,
                                products: [...newPromotion.products, "Mechanical Keyboard RGB"],
                              })
                            } else {
                              setNewPromotion({
                                ...newPromotion,
                                products: newPromotion.products.filter((p) => p !== "Mechanical Keyboard RGB"),
                              })
                            }
                          }}
                        />
                        <label htmlFor="product2" className="text-sm">
                          Mechanical Keyboard RGB
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="product3"
                          checked={newPromotion.products.includes("Wireless Headphones")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewPromotion({
                                ...newPromotion,
                                products: [...newPromotion.products, "Wireless Headphones"],
                              })
                            } else {
                              setNewPromotion({
                                ...newPromotion,
                                products: newPromotion.products.filter((p) => p !== "Wireless Headphones"),
                              })
                            }
                          }}
                        />
                        <label htmlFor="product3" className="text-sm">
                          Wireless Headphones
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="product4"
                          checked={newPromotion.products.includes("Smart Watch")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewPromotion({
                                ...newPromotion,
                                products: [...newPromotion.products, "Smart Watch"],
                              })
                            } else {
                              setNewPromotion({
                                ...newPromotion,
                                products: newPromotion.products.filter((p) => p !== "Smart Watch"),
                              })
                            }
                          }}
                        />
                        <label htmlFor="product4" className="text-sm">
                          Smart Watch
                        </label>
                      </div>
                    </div>
                    {errors.products && <p className="text-sm text-red-500 mt-1">{errors.products}</p>}
                  </FormField>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Start Date" error={errors.startDate} required>
                      <ValidatedInput
                        type="date"
                        value={newPromotion.startDate}
                        onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                        error={errors.startDate}
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="End Date" error={errors.endDate} required>
                      <ValidatedInput
                        type="date"
                        value={newPromotion.endDate}
                        onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                        error={errors.endDate}
                        className="text-sm"
                      />
                    </FormField>
                  </div>
                  <Button onClick={handleCreatePromotion} className="w-full text-sm">
                    Create Promotion
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              {promotions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {promotions.map((promotion) => (
                    <div key={promotion.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium text-sm sm:text-base truncate">{promotion.name}</h4>
                            <Badge
                              variant={
                                promotion.status === "active"
                                  ? "default"
                                  : promotion.status === "completed"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {promotion.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Type: {promotion.type.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            Products: {promotion.products.join(", ")}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                            <span>{promotion.views} views</span>
                            <span>{promotion.clicks} clicks</span>
                            <span>{promotion.conversions} conversions</span>
                            <span className="hidden sm:inline">
                              {promotion.startDate} - {promotion.endDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success(`Viewing analytics for ${promotion.name}`)}
                            className="text-xs"
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Analytics</span>
                          </Button>
                          {promotion.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromotionStatusUpdate(promotion.id, "paused")}
                              className="text-xs"
                            >
                              <Pause className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Pause</span>
                            </Button>
                          )}
                          {promotion.status === "paused" && (
                            <Button
                              size="sm"
                              onClick={() => handlePromotionStatusUpdate(promotion.id, "active")}
                              className="text-xs"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Resume</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Megaphone className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-base sm:text-lg font-semibold">No active promotions</h3>
                  <p className="text-sm text-muted-foreground">
                    Create promotional campaigns to boost product visibility.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-medium">Advertisement Management</h3>
              <p className="text-sm text-muted-foreground">
                Schedule and manage your advertising campaigns across platforms.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Create Ad Campaign</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Create New Ad Campaign</DialogTitle>
                  <DialogDescription className="text-sm">
                    Set up advertising campaigns across different platforms
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <FormField label="Campaign Name" error={errors.name} required>
                    <ValidatedInput
                      placeholder="Enter campaign name"
                      value={newAd.name}
                      onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                      error={errors.name}
                      className="text-sm"
                    />
                  </FormField>
                  <FormField label="Platform" error={errors.platform} required>
                    <ValidatedSelect
                      placeholder="Select advertising platform"
                      value={newAd.platform}
                      onValueChange={(value) => setNewAd({ ...newAd, platform: value as any })}
                      error={errors.platform}
                    >
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="facebook">Facebook Ads</SelectItem>
                      <SelectItem value="instagram">Instagram Ads</SelectItem>
                      <SelectItem value="twitter">Twitter Ads</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                    </ValidatedSelect>
                  </FormField>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Budget ($)" error={errors.budget} required>
                      <ValidatedInput
                        type="number"
                        placeholder="0.00"
                        value={newAd.budget}
                        onChange={(e) => setNewAd({ ...newAd, budget: e.target.value })}
                        error={errors.budget}
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="Objective" error={errors.objective} required>
                      <ValidatedSelect
                        placeholder="Select campaign objective"
                        value={newAd.objective}
                        onValueChange={(value) => setNewAd({ ...newAd, objective: value as any })}
                        error={errors.objective}
                      >
                        <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                        <SelectItem value="traffic">Website Traffic</SelectItem>
                        <SelectItem value="conversions">Conversions</SelectItem>
                        <SelectItem value="lead_generation">Lead Generation</SelectItem>
                      </ValidatedSelect>
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <FormField label="Start Date" error={errors.startDate} required>
                      <ValidatedInput
                        type="date"
                        value={newAd.startDate}
                        onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                        error={errors.startDate}
                        className="text-sm"
                      />
                    </FormField>
                    <FormField label="End Date" error={errors.endDate} required>
                      <ValidatedInput
                        type="date"
                        value={newAd.endDate}
                        onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                        error={errors.endDate}
                        className="text-sm"
                      />
                    </FormField>
                  </div>
                  <FormField label="Target Audience">
                    <ValidatedTextarea
                      placeholder="Describe your target audience..."
                      value={newAd.targetAudience}
                      onChange={(e) => setNewAd({ ...newAd, targetAudience: e.target.value })}
                      className="text-sm"
                    />
                  </FormField>
                  <Button onClick={handleCreateAdvertisement} className="w-full text-sm">
                    Create Ad Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              {advertisements.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px] text-xs sm:text-sm">Campaign</TableHead>
                        <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Platform</TableHead>
                        <TableHead className="hidden md:table-cell text-xs sm:text-sm">Budget</TableHead>
                        <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Performance</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="hidden xl:table-cell text-xs sm:text-sm">Duration</TableHead>
                        <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {advertisements.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="font-medium text-xs sm:text-sm truncate">{ad.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {ad.objective.replace("_", " ")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {ad.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <div className="font-medium text-xs">
                                {ad.spent} / {ad.budget}
                              </div>
                              <Progress
                                value={
                                  (Number.parseInt(ad.spent.replace("$", "").replace(",", "")) /
                                    Number.parseInt(ad.budget.replace("$", "").replace(",", ""))) *
                                  100
                                }
                                className="w-16 sm:w-20 h-2 mt-1"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-xs space-y-1">
                              <div>{ad.impressions} impressions</div>
                              <div>{ad.clicks} clicks</div>
                              <div>CTR: {ad.ctr}</div>
                              <div>CPC: {ad.cpc}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ad.status === "active" ? "default" : "secondary"} className="text-xs">
                              {ad.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="text-xs">
                              <div>{ad.startDate}</div>
                              <div>to {ad.endDate}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.success(`Viewing analytics for ${ad.name}`)}
                                className="h-7 w-7 p-0"
                              >
                                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              {ad.status === "active" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAdStatusUpdate(ad.id, "paused")}
                                  className="text-xs"
                                >
                                  <Pause className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Pause</span>
                                </Button>
                              )}
                              {ad.status === "paused" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleAdStatusUpdate(ad.id, "active")}
                                  className="text-xs"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Resume</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Target className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-base sm:text-lg font-semibold">No advertisements scheduled</h3>
                  <p className="text-sm text-muted-foreground">Create targeted ads to reach more customers.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
