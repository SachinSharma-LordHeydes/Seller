"use client"

import { create } from "zustand"

// Types
export interface Order {
  id: string
  customer: string
  email: string
  total: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
  date: string
  items: number
  priority: "low" | "normal" | "high"
  shippingAddress: string
  trackingNumber?: string
  products: Array<{
    name: string
    quantity: number
    price: string
  }>
}

export interface Customer {
  id: string
  name: string
  email: string
  avatar?: string
  orders: number
  spent: string
  rating: number
  status: "active" | "vip" | "inactive"
  lastOrder: string
  messages: number
  joinDate: string
}

export interface Message {
  id: string
  customerId: string
  customer: string
  subject: string
  message: string
  preview: string
  date: string
  status: "unread" | "read" | "replied"
  priority: "low" | "normal" | "high"
  orderId?: string
  replies?: Array<{
    id: string
    message: string
    sender: "customer" | "seller"
    date: string
  }>
}

export interface Review {
  id: string
  customerId: string
  customer: string
  productId: string
  product: string
  rating: number
  comment: string
  date: string
  status: "pending" | "published" | "flagged" | "rejected"
  helpful: number
}

export interface Dispute {
  id: string
  customerId: string
  customer: string
  orderId: string
  issue: string
  description: string
  date: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "normal" | "high"
  resolution?: string
}

export interface Campaign {
  id: string
  name: string
  type: "discount" | "promotion" | "advertisement" | "social_media"
  status: "draft" | "active" | "paused" | "completed"
  budget: string
  spent: string
  impressions: string
  clicks: string
  conversions: string
  startDate: string
  endDate: string
  description: string
  targetAudience?: string
  platforms?: string[]
}

export interface Discount {
  id: string
  code: string
  type: "percentage" | "fixed" | "free_shipping"
  value: string
  usage: number
  limit: number
  status: "active" | "inactive" | "expired"
  expires: string
  description: string
  conditions?: {
    minOrderValue?: string
    applicableProducts?: string[]
    firstTimeCustomers?: boolean
  }
}

export interface Promotion {
  id: string
  name: string
  type: "featured_listing" | "banner" | "category_feature" | "homepage_spotlight"
  products: string[]
  status: "active" | "scheduled" | "completed" | "paused"
  startDate: string
  endDate: string
  views: string
  clicks: string
  conversions: string
  budget?: string
}

export interface Advertisement {
  id: string
  name: string
  platform: "google" | "facebook" | "instagram" | "twitter" | "linkedin"
  budget: string
  spent: string
  impressions: string
  clicks: string
  status: "active" | "paused" | "completed"
  startDate: string
  endDate: string
  objective: "brand_awareness" | "traffic" | "conversions" | "lead_generation"
  targetAudience: string
  ctr: string
  cpc: string
}

// Store
interface DashboardStore {
  // Orders
  orders: Order[]
  selectedOrders: string[]
  orderFilters: {
    search: string
    status: string
    priority: string
  }

  // Customers
  customers: Customer[]
  messages: Message[]
  reviews: Review[]
  disputes: Dispute[]
  customerFilters: {
    search: string
    status: string
  }

  // Marketing
  campaigns: Campaign[]
  discounts: Discount[]
  promotions: Promotion[]
  advertisements: Advertisement[]
  marketingStats: {
    totalCampaigns: number
    activeCampaigns: number
    totalImpressions: string
    clickRate: string
    conversionRate: string
  }

  // Actions
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  bulkUpdateOrders: (orderIds: string[], status: Order["status"]) => void
  selectOrder: (orderId: string) => void
  selectAllOrders: () => void
  clearSelectedOrders: () => void
  setOrderFilters: (filters: Partial<DashboardStore["orderFilters"]>) => void

  replyToMessage: (messageId: string, reply: string) => void
  updateMessageStatus: (messageId: string, status: Message["status"]) => void

  updateReviewStatus: (reviewId: string, status: Review["status"]) => void

  resolveDispute: (disputeId: string, resolution: string) => void
  updateDisputeStatus: (disputeId: string, status: Dispute["status"]) => void

  createCampaign: (campaign: Omit<Campaign, "id">) => void
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void

  createDiscount: (discount: Omit<Discount, "id">) => void
  updateDiscount: (discountId: string, updates: Partial<Discount>) => void

  createPromotion: (promotion: Omit<Promotion, "id">) => void
  updatePromotion: (promotionId: string, updates: Partial<Promotion>) => void

  createAdvertisement: (ad: Omit<Advertisement, "id">) => void
  updateAdvertisement: (adId: string, updates: Partial<Advertisement>) => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial data
  orders: [
    {
      id: "ORD-001",
      customer: "John Doe",
      email: "john@example.com",
      total: "$299.99",
      status: "processing",
      date: "2024-01-15",
      items: 2,
      priority: "high",
      shippingAddress: "123 Main St, New York, NY 10001",
      trackingNumber: "",
      products: [
        { name: "Wireless Headphones", quantity: 1, price: "$199.99" },
        { name: "Phone Case", quantity: 1, price: "$99.99" },
      ],
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      email: "jane@example.com",
      total: "$149.99",
      status: "shipped",
      date: "2024-01-14",
      items: 1,
      priority: "normal",
      shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
      trackingNumber: "1Z999AA1234567890",
      products: [{ name: "Smart Watch", quantity: 1, price: "$149.99" }],
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      email: "bob@example.com",
      total: "$599.99",
      status: "delivered",
      date: "2024-01-13",
      items: 3,
      priority: "normal",
      shippingAddress: "789 Pine St, Chicago, IL 60601",
      trackingNumber: "1Z999AA1234567891",
      products: [
        { name: "Laptop Stand", quantity: 2, price: "$199.99" },
        { name: "USB-C Cable", quantity: 1, price: "$199.99" },
      ],
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      email: "alice@example.com",
      total: "$89.99",
      status: "pending",
      date: "2024-01-12",
      items: 1,
      priority: "low",
      shippingAddress: "321 Elm St, Houston, TX 77001",
      products: [{ name: "Phone Charger", quantity: 1, price: "$89.99" }],
    },
    {
      id: "ORD-005",
      customer: "Mike Brown",
      email: "mike@example.com",
      total: "$459.99",
      status: "returned",
      date: "2024-01-10",
      items: 2,
      priority: "high",
      shippingAddress: "654 Maple Ave, Seattle, WA 98101",
      trackingNumber: "1Z999AA1234567892",
      products: [
        { name: "Gaming Mouse", quantity: 1, price: "$79.99" },
        { name: "Mechanical Keyboard", quantity: 1, price: "$379.99" },
      ],
    },
  ],

  selectedOrders: [],
  orderFilters: {
    search: "",
    status: "all",
    priority: "all",
  },

  customers: [
    {
      id: "CUST-001",
      name: "John Doe",
      email: "john@example.com",
      orders: 12,
      spent: "$2,340.00",
      rating: 4.8,
      status: "active",
      lastOrder: "2024-01-15",
      messages: 2,
      joinDate: "2023-06-15",
    },
    {
      id: "CUST-002",
      name: "Jane Smith",
      email: "jane@example.com",
      orders: 8,
      spent: "$1,890.00",
      rating: 4.9,
      status: "active",
      lastOrder: "2024-01-14",
      messages: 0,
      joinDate: "2023-08-22",
    },
    {
      id: "CUST-003",
      name: "Bob Johnson",
      email: "bob@example.com",
      orders: 15,
      spent: "$3,450.00",
      rating: 4.7,
      status: "vip",
      lastOrder: "2024-01-13",
      messages: 1,
      joinDate: "2023-03-10",
    },
    {
      id: "CUST-004",
      name: "Alice Brown",
      email: "alice@example.com",
      orders: 5,
      spent: "$890.00",
      rating: 4.6,
      status: "active",
      lastOrder: "2024-01-12",
      messages: 0,
      joinDate: "2023-11-05",
    },
    {
      id: "CUST-005",
      name: "Mike Brown",
      email: "mike@example.com",
      orders: 3,
      spent: "$1,250.00",
      rating: 3.2,
      status: "inactive",
      lastOrder: "2024-01-10",
      messages: 3,
      joinDate: "2023-12-01",
    },
    {
      id: "CUST-006",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      orders: 22,
      spent: "$4,890.00",
      rating: 4.9,
      status: "vip",
      lastOrder: "2024-01-16",
      messages: 0,
      joinDate: "2023-02-14",
    },
  ],

  messages: [
    {
      id: "MSG-001",
      customerId: "CUST-001",
      customer: "John Doe",
      subject: "Question about shipping",
      message:
        "Hi, I wanted to ask about the shipping time for my recent order ORD-001. When can I expect it to arrive? I need it for a business presentation next week. Also, is there any way to expedite the shipping?",
      preview: "Hi, I wanted to ask about the shipping time for my recent order...",
      date: "2024-01-15",
      status: "unread",
      priority: "normal",
      orderId: "ORD-001",
      replies: [],
    },
    {
      id: "MSG-002",
      customerId: "CUST-002",
      customer: "Jane Smith",
      subject: "Product return request",
      message:
        "I would like to return the Smart Watch I purchased last week because it doesn't fit properly. The band is too large even on the smallest setting. What's the return process and how long will it take to get my refund?",
      preview: "I would like to return the item I purchased last week because...",
      date: "2024-01-14",
      status: "replied",
      priority: "high",
      orderId: "ORD-002",
      replies: [
        {
          id: "REPLY-001",
          message:
            "Thank you for contacting us about your Smart Watch return. I understand the band doesn't fit properly. I'll send you a prepaid return label via email within the next hour. Once we receive the item, your refund will be processed within 3-5 business days.",
          sender: "seller",
          date: "2024-01-14",
        },
        {
          id: "REPLY-002",
          message:
            "Thank you so much for the quick response! I received the return label and will ship it back today. Really appreciate the excellent customer service.",
          sender: "customer",
          date: "2024-01-14",
        },
      ],
    },
    {
      id: "MSG-003",
      customerId: "CUST-003",
      customer: "Bob Johnson",
      subject: "Bulk order inquiry",
      message:
        "Hello, I'm interested in placing a bulk order for 50 laptop stands for our office. Can you provide a quote with volume discount? We're also interested in custom branding options if available.",
      preview: "Hello, I'm interested in placing a bulk order for 50 laptop stands...",
      date: "2024-01-13",
      status: "unread",
      priority: "high",
      orderId: "",
      replies: [],
    },
    {
      id: "MSG-004",
      customerId: "CUST-005",
      customer: "Mike Brown",
      subject: "Defective product complaint",
      message:
        "The gaming mouse I received has a defective scroll wheel. It's very frustrating as I bought this for competitive gaming. This is the second defective product I've received from your store. I'm considering disputing this with my credit card company.",
      preview: "The gaming mouse I received has a defective scroll wheel...",
      date: "2024-01-11",
      status: "unread",
      priority: "high",
      orderId: "ORD-005",
      replies: [],
    },
    {
      id: "MSG-005",
      customerId: "CUST-006",
      customer: "Sarah Wilson",
      subject: "VIP customer benefits inquiry",
      message:
        "Hi! I noticed I've been upgraded to VIP status. Could you please explain what benefits this includes? I'm particularly interested in early access to new products and any exclusive discounts available.",
      preview: "Hi! I noticed I've been upgraded to VIP status...",
      date: "2024-01-16",
      status: "read",
      priority: "normal",
      orderId: "",
      replies: [
        {
          id: "REPLY-003",
          message:
            "Congratulations on achieving VIP status! As a VIP customer, you get: 15% discount on all purchases, early access to new products (48 hours before general release), free expedited shipping, priority customer support, and exclusive access to limited edition items. Welcome to our VIP program!",
          sender: "seller",
          date: "2024-01-16",
        },
      ],
    },
    {
      id: "MSG-006",
      customerId: "CUST-001",
      customer: "John Doe",
      subject: "Product recommendation request",
      message:
        "I'm looking for a good wireless charging pad that's compatible with my iPhone 14 Pro. Do you have any recommendations? I'd prefer something that charges quickly and looks professional for my office desk.",
      preview: "I'm looking for a good wireless charging pad that's compatible...",
      date: "2024-01-12",
      status: "replied",
      priority: "low",
      orderId: "",
      replies: [
        {
          id: "REPLY-004",
          message:
            "Great question! I'd recommend our Premium Wireless Charging Pad (Model WCP-Pro). It supports 15W fast charging for iPhone 14 Pro, has a sleek aluminum design perfect for offices, and includes LED indicators. It's currently on sale for $49.99. Would you like me to send you the product link?",
          sender: "seller",
          date: "2024-01-12",
        },
      ],
    },
  ],

  reviews: [
    {
      id: "REV-001",
      customerId: "CUST-004",
      customer: "Alice Brown",
      productId: "PROD-001",
      product: "Wireless Headphones",
      rating: 5,
      comment:
        "Excellent sound quality and comfortable to wear for long periods. The noise cancellation feature works perfectly during my daily commute. Battery life is outstanding - easily lasts 2 days of heavy use. Highly recommend!",
      date: "2024-01-15",
      status: "published",
      helpful: 12,
    },
    {
      id: "REV-002",
      customerId: "CUST-002",
      customer: "Jane Smith",
      productId: "PROD-002",
      product: "Smart Watch",
      rating: 4,
      comment:
        "Great features and the health tracking is very accurate. The display is bright and easy to read. However, the battery life could be better - needs charging every day with heavy use. Overall satisfied with the purchase.",
      date: "2024-01-14",
      status: "pending",
      helpful: 0,
    },
    {
      id: "REV-003",
      customerId: "CUST-005",
      customer: "Mike Brown",
      productId: "PROD-003",
      product: "Laptop Stand",
      rating: 2,
      comment:
        "Not as sturdy as expected. Wobbles when typing vigorously. The height adjustment mechanism feels cheap and doesn't lock properly. For the price, I expected much better build quality. Would not recommend.",
      date: "2024-01-13",
      status: "flagged",
      helpful: 3,
    },
    {
      id: "REV-004",
      customerId: "CUST-003",
      customer: "Bob Johnson",
      productId: "PROD-004",
      product: "USB-C Cable",
      rating: 5,
      comment:
        "Perfect cable! Fast charging and data transfer speeds are excellent. The braided design feels premium and durable. Length is just right for my setup. Great value for money.",
      date: "2024-01-12",
      status: "published",
      helpful: 8,
    },
    {
      id: "REV-005",
      customerId: "CUST-006",
      customer: "Sarah Wilson",
      productId: "PROD-005",
      product: "Gaming Mouse",
      rating: 4,
      comment:
        "Responsive and comfortable for long gaming sessions. The RGB lighting is customizable and looks great. Only complaint is that the software could be more intuitive. Good mouse overall for the price point.",
      date: "2024-01-11",
      status: "published",
      helpful: 15,
    },
    {
      id: "REV-006",
      customerId: "CUST-001",
      customer: "John Doe",
      productId: "PROD-006",
      product: "Phone Case",
      rating: 3,
      comment:
        "Decent protection but the material attracts fingerprints easily. Fits well and buttons are responsive. The clear back shows the phone nicely but gets cloudy over time. Average quality for the price.",
      date: "2024-01-10",
      status: "pending",
      helpful: 2,
    },
    {
      id: "REV-007",
      customerId: "CUST-004",
      customer: "Alice Brown",
      productId: "PROD-007",
      product: "Mechanical Keyboard",
      rating: 5,
      comment:
        "Amazing typing experience! The switches feel premium and the sound is satisfying without being too loud for office use. Backlight is even and customizable. Build quality is exceptional. Worth every penny!",
      date: "2024-01-09",
      status: "published",
      helpful: 23,
    },
    {
      id: "REV-008",
      customerId: "CUST-002",
      customer: "Jane Smith",
      productId: "PROD-008",
      product: "Wireless Charger",
      rating: 1,
      comment:
        "Completely stopped working after 2 weeks. Very disappointed with the quality. Customer service was unhelpful when I contacted them. Save your money and buy from a different brand.",
      date: "2024-01-08",
      status: "flagged",
      helpful: 7,
    },
  ],

  disputes: [
    {
      id: "DISP-001",
      customerId: "CUST-005",
      customer: "Mike Brown",
      orderId: "ORD-005",
      issue: "Item not as described",
      description:
        "The gaming mouse I received has a completely different design than what was shown in the product photos. The color is wrong (received black instead of white), and the side buttons are in different positions. This doesn't match the product I ordered at all.",
      date: "2024-01-10",
      status: "open",
      priority: "high",
    },
    {
      id: "DISP-002",
      customerId: "CUST-002",
      customer: "Jane Smith",
      orderId: "ORD-002",
      issue: "Defective product",
      description:
        "The smart watch screen has dead pixels and the heart rate sensor doesn't work properly. I've tried resetting it multiple times but the issues persist. The product appears to be defective from manufacturing.",
      date: "2024-01-09",
      status: "in_progress",
      priority: "high",
      resolution:
        "Replacement unit has been shipped. Customer will receive new smart watch within 2-3 business days with prepaid return label for defective unit.",
    },
    {
      id: "DISP-003",
      customerId: "CUST-001",
      customer: "John Doe",
      orderId: "ORD-001",
      issue: "Delayed shipping",
      description:
        "My order was supposed to arrive 5 days ago according to the tracking information, but it still hasn't been delivered. I need these items for an important business presentation. The tracking shows 'out for delivery' for the past 3 days.",
      date: "2024-01-08",
      status: "resolved",
      priority: "normal",
      resolution:
        "Contacted shipping carrier and expedited delivery. Customer received order the next day. Provided 20% discount on next purchase as compensation for the inconvenience.",
    },
    {
      id: "DISP-004",
      customerId: "CUST-003",
      customer: "Bob Johnson",
      orderId: "ORD-003",
      issue: "Wrong item shipped",
      description:
        "I ordered 2 laptop stands but received 2 phone stands instead. The packaging was correct but the contents were completely wrong. I need the laptop stands for my home office setup urgently.",
      date: "2024-01-07",
      status: "resolved",
      priority: "high",
      resolution:
        "Correct laptop stands shipped via express delivery. Customer received items within 24 hours. Allowed customer to keep the phone stands as compensation for the error.",
    },
    {
      id: "DISP-005",
      customerId: "CUST-006",
      customer: "Sarah Wilson",
      orderId: "ORD-006",
      issue: "Billing discrepancy",
      description:
        "I was charged twice for the same order. My credit card shows two identical charges of $299.99 for order ORD-006, but I only placed one order. I've checked my account and there's definitely a duplicate charge.",
      date: "2024-01-06",
      status: "closed",
      priority: "normal",
      resolution:
        "Duplicate charge was identified and refunded within 24 hours. Customer confirmed receipt of refund. Issue was caused by a temporary payment processing glitch that has been resolved.",
    },
  ],

  campaigns: [
    {
      id: "CAMP-001",
      name: "Summer Sale 2024",
      type: "discount",
      status: "active",
      budget: "$5,000",
      spent: "$3,200",
      impressions: "125,000",
      clicks: "8,500",
      conversions: "340",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      description:
        "Seasonal discount campaign for summer products including outdoor gear, electronics, and accessories. Targeting customers aged 25-45 with interests in technology and outdoor activities.",
      targetAudience: "Tech enthusiasts, outdoor enthusiasts, ages 25-45",
      platforms: ["Google Ads", "Facebook", "Instagram"],
    },
    {
      id: "CAMP-002",
      name: "New Product Launch - Gaming Series",
      type: "promotion",
      status: "scheduled",
      budget: "$3,000",
      spent: "$0",
      impressions: "0",
      clicks: "0",
      conversions: "0",
      startDate: "2024-02-01",
      endDate: "2024-02-15",
      description:
        "Promotional campaign for new gaming product line including mechanical keyboards, gaming mice, and RGB accessories. Focus on competitive gamers and enthusiasts.",
      targetAudience: "Gamers, esports enthusiasts, ages 18-35",
      platforms: ["Twitch", "YouTube", "Reddit"],
    },
    {
      id: "CAMP-003",
      name: "Back to School Electronics",
      type: "advertisement",
      status: "completed",
      budget: "$2,500",
      spent: "$2,450",
      impressions: "89,000",
      clicks: "5,200",
      conversions: "180",
      startDate: "2023-08-01",
      endDate: "2023-09-15",
      description:
        "Targeted campaign for students and parents preparing for the new school year. Featured laptops, tablets, accessories, and study tools.",
      targetAudience: "Students, parents, educators, ages 16-50",
      platforms: ["Google Ads", "Facebook", "TikTok"],
    },
    {
      id: "CAMP-004",
      name: "Holiday Gift Guide",
      type: "social_media",
      status: "paused",
      budget: "$4,200",
      spent: "$1,800",
      impressions: "156,000",
      clicks: "12,400",
      conversions: "520",
      startDate: "2023-11-15",
      endDate: "2023-12-31",
      description:
        "Comprehensive holiday shopping campaign featuring gift recommendations, bundle deals, and last-minute shipping options.",
      targetAudience: "Gift shoppers, families, ages 25-55",
      platforms: ["Instagram", "Facebook", "Pinterest", "TikTok"],
    },
    {
      id: "CAMP-005",
      name: "Influencer Partnership - Tech Reviews",
      type: "social_media",
      status: "active",
      budget: "$6,000",
      spent: "$4,100",
      impressions: "234,000",
      clicks: "18,700",
      conversions: "890",
      startDate: "2024-01-10",
      endDate: "2024-02-28",
      description:
        "Collaboration with tech influencers for authentic product reviews and demonstrations. Focus on building brand credibility and reaching new audiences.",
      targetAudience: "Tech enthusiasts, early adopters, ages 20-40",
      platforms: ["YouTube", "Instagram", "TikTok"],
    },
  ],

  discounts: [
    {
      id: "DISC-001",
      code: "SUMMER20",
      type: "percentage",
      value: "20",
      usage: 145,
      limit: 500,
      status: "active",
      expires: "2024-01-31",
      description: "Summer seasonal discount for all electronics and accessories",
      conditions: {
        minOrderValue: "$50",
        applicableProducts: ["Electronics", "Accessories"],
        firstTimeCustomers: false,
      },
    },
    {
      id: "DISC-002",
      code: "FREESHIP",
      type: "free_shipping",
      value: "0",
      usage: 89,
      limit: 200,
      status: "active",
      expires: "2024-02-15",
      description: "Free shipping promotion for orders over $75",
      conditions: {
        minOrderValue: "$75",
        applicableProducts: [],
        firstTimeCustomers: false,
      },
    },
    {
      id: "DISC-003",
      code: "NEWCUSTOMER15",
      type: "percentage",
      value: "15",
      usage: 67,
      limit: 1000,
      status: "active",
      expires: "2024-12-31",
      description: "Welcome discount for first-time customers",
      conditions: {
        minOrderValue: "$25",
        applicableProducts: [],
        firstTimeCustomers: true,
      },
    },
    {
      id: "DISC-004",
      code: "BULK50",
      type: "fixed",
      value: "50",
      usage: 23,
      limit: 100,
      status: "active",
      expires: "2024-03-31",
      description: "$50 off bulk orders of 5 or more items",
      conditions: {
        minOrderValue: "$200",
        applicableProducts: [],
        firstTimeCustomers: false,
      },
    },
    {
      id: "DISC-005",
      code: "EXPIRED10",
      type: "percentage",
      value: "10",
      usage: 234,
      limit: 500,
      status: "expired",
      expires: "2023-12-31",
      description: "Holiday season discount (expired)",
      conditions: {
        minOrderValue: "$30",
        applicableProducts: [],
        firstTimeCustomers: false,
      },
    },
    {
      id: "DISC-006",
      code: "VIP25",
      type: "percentage",
      value: "25",
      usage: 45,
      limit: 200,
      status: "active",
      expires: "2024-06-30",
      description: "Exclusive VIP customer discount",
      conditions: {
        minOrderValue: "$100",
        applicableProducts: [],
        firstTimeCustomers: false,
      },
    },
  ],

  promotions: [
    {
      id: "PROMO-001",
      name: "Featured Product Spotlight - Gaming Collection",
      type: "featured_listing",
      products: ["Gaming Mouse Pro", "Mechanical Keyboard RGB", "Gaming Headset"],
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-01-30",
      views: "15,200",
      clicks: "1,840",
      conversions: "156",
      budget: "$800",
    },
    {
      id: "PROMO-002",
      name: "Homepage Banner - New Arrivals",
      type: "banner",
      products: ["Wireless Earbuds Pro", "Smart Watch Series 5", "USB-C Hub"],
      status: "active",
      startDate: "2024-01-10",
      endDate: "2024-02-10",
      views: "45,600",
      clicks: "3,200",
      conversions: "280",
      budget: "$1,200",
    },
    {
      id: "PROMO-003",
      name: "Electronics Category Feature",
      type: "category_feature",
      products: ["Laptop Stand Pro", "Wireless Charger", "Phone Case Premium"],
      status: "scheduled",
      startDate: "2024-02-01",
      endDate: "2024-02-14",
      views: "0",
      clicks: "0",
      conversions: "0",
      budget: "$600",
    },
    {
      id: "PROMO-004",
      name: "Valentine's Day Special",
      type: "homepage_spotlight",
      products: ["Smart Watch Pink", "Wireless Headphones Rose Gold", "Phone Case Heart"],
      status: "completed",
      startDate: "2024-01-01",
      endDate: "2024-01-14",
      views: "28,900",
      clicks: "2,100",
      conversions: "189",
      budget: "$900",
    },
    {
      id: "PROMO-005",
      name: "Tech Accessories Bundle",
      type: "featured_listing",
      products: ["Cable Organizer", "Laptop Sleeve", "Portable Charger"],
      status: "paused",
      startDate: "2024-01-05",
      endDate: "2024-01-25",
      views: "8,400",
      clicks: "650",
      conversions: "45",
      budget: "$400",
    },
  ],

  advertisements: [
    {
      id: "AD-001",
      name: "Google Ads - Electronics Keywords",
      platform: "google",
      budget: "$1,000",
      spent: "$650",
      impressions: "45,000",
      clicks: "2,100",
      status: "active",
      startDate: "2024-01-10",
      endDate: "2024-01-25",
      objective: "conversions",
      targetAudience: "Tech enthusiasts, ages 25-45, interested in electronics and gadgets",
      ctr: "4.67%",
      cpc: "$0.31",
    },
    {
      id: "AD-002",
      name: "Facebook Product Catalog Ads",
      platform: "facebook",
      budget: "$800",
      spent: "$320",
      impressions: "32,000",
      clicks: "1,500",
      status: "paused",
      startDate: "2024-01-12",
      endDate: "2024-01-27",
      objective: "traffic",
      targetAudience: "Online shoppers, ages 20-50, interested in technology and shopping",
      ctr: "4.69%",
      cpc: "$0.21",
    },
    {
      id: "AD-003",
      name: "Instagram Stories - Gaming Products",
      platform: "instagram",
      budget: "$600",
      spent: "$480",
      impressions: "28,500",
      clicks: "1,200",
      status: "active",
      startDate: "2024-01-08",
      endDate: "2024-01-22",
      objective: "brand_awareness",
      targetAudience: "Gamers, esports fans, ages 16-35",
      ctr: "4.21%",
      cpc: "$0.40",
    },
    {
      id: "AD-004",
      name: "LinkedIn Professional Tech Ads",
      platform: "linkedin",
      budget: "$1,200",
      spent: "$890",
      impressions: "18,000",
      clicks: "720",
      status: "completed",
      startDate: "2023-12-15",
      endDate: "2024-01-15",
      objective: "lead_generation",
      targetAudience: "IT professionals, business owners, ages 25-55",
      ctr: "4.00%",
      cpc: "$1.24",
    },
    {
      id: "AD-005",
      name: "Twitter Tech Trends Campaign",
      platform: "twitter",
      budget: "$400",
      spent: "$280",
      impressions: "52,000",
      clicks: "1,800",
      status: "active",
      startDate: "2024-01-14",
      endDate: "2024-01-28",
      objective: "traffic",
      targetAudience: "Tech news followers, early adopters, ages 20-45",
      ctr: "3.46%",
      cpc: "$0.16",
    },
    {
      id: "AD-006",
      name: "YouTube Pre-roll - Product Reviews",
      platform: "google",
      budget: "$1,500",
      spent: "$1,200",
      impressions: "125,000",
      clicks: "3,500",
      status: "completed",
      startDate: "2023-12-01",
      endDate: "2024-01-01",
      objective: "brand_awareness",
      targetAudience: "Tech review watchers, gadget enthusiasts, ages 18-50",
      ctr: "2.80%",
      cpc: "$0.34",
    },
  ],

  customerFilters: {
    search: "",
    status: "all",
  },

  marketingStats: {
    totalCampaigns: 5,
    activeCampaigns: 2,
    totalImpressions: "359K",
    clickRate: "6.8%",
    conversionRate: "4.2%",
  },

  // Actions
  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              trackingNumber:
                status === "shipped" && !order.trackingNumber
                  ? `1Z999AA${Math.random().toString().slice(2, 12)}`
                  : order.trackingNumber,
            }
          : order,
      ),
    }))
  },

  bulkUpdateOrders: (orderIds, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        orderIds.includes(order.id)
          ? {
              ...order,
              status,
              trackingNumber:
                status === "shipped" && !order.trackingNumber
                  ? `1Z999AA${Math.random().toString().slice(2, 12)}`
                  : order.trackingNumber,
            }
          : order,
      ),
      selectedOrders: [],
    }))
  },

  selectOrder: (orderId) => {
    set((state) => ({
      selectedOrders: state.selectedOrders.includes(orderId)
        ? state.selectedOrders.filter((id) => id !== orderId)
        : [...state.selectedOrders, orderId],
    }))
  },

  selectAllOrders: () => {
    const { orders, orderFilters } = get()
    const filteredOrders = orders.filter((order) => {
      const matchesSearch =
        order.customer.toLowerCase().includes(orderFilters.search.toLowerCase()) ||
        order.id.toLowerCase().includes(orderFilters.search.toLowerCase())
      const matchesStatus = orderFilters.status === "all" || order.status === orderFilters.status
      const matchesPriority = orderFilters.priority === "all" || order.priority === orderFilters.priority
      return matchesSearch && matchesStatus && matchesPriority
    })

    set((state) => ({
      selectedOrders:
        state.selectedOrders.length === filteredOrders.length ? [] : filteredOrders.map((order) => order.id),
    }))
  },

  clearSelectedOrders: () => {
    set({ selectedOrders: [] })
  },

  setOrderFilters: (filters) => {
    set((state) => ({
      orderFilters: { ...state.orderFilters, ...filters },
    }))
  },

  replyToMessage: (messageId, reply) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              status: "replied" as const,
              replies: [
                ...(message.replies || []),
                {
                  id: `REPLY-${Date.now()}`,
                  message: reply,
                  sender: "seller" as const,
                  date: new Date().toISOString().split("T")[0],
                },
              ],
            }
          : message,
      ),
    }))
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((message) => (message.id === messageId ? { ...message, status } : message)),
    }))
  },

  updateReviewStatus: (reviewId, status) => {
    set((state) => ({
      reviews: state.reviews.map((review) => (review.id === reviewId ? { ...review, status } : review)),
    }))
  },

  resolveDispute: (disputeId, resolution) => {
    set((state) => ({
      disputes: state.disputes.map((dispute) =>
        dispute.id === disputeId ? { ...dispute, status: "resolved" as const, resolution } : dispute,
      ),
    }))
  },

  updateDisputeStatus: (disputeId, status) => {
    set((state) => ({
      disputes: state.disputes.map((dispute) => (dispute.id === disputeId ? { ...dispute, status } : dispute)),
    }))
  },

  createCampaign: (campaign) => {
    const newCampaign = {
      ...campaign,
      id: `CAMP-${Date.now()}`,
      spent: "$0",
      impressions: "0",
      clicks: "0",
      conversions: "0",
    }
    set((state) => ({
      campaigns: [...state.campaigns, newCampaign],
    }))
  },

  updateCampaign: (campaignId, updates) => {
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, ...updates } : campaign,
      ),
    }))
  },

  createDiscount: (discount) => {
    const newDiscount = {
      ...discount,
      id: `DISC-${Date.now()}`,
      usage: 0,
    }
    set((state) => ({
      discounts: [...state.discounts, newDiscount],
    }))
  },

  updateDiscount: (discountId, updates) => {
    set((state) => ({
      discounts: state.discounts.map((discount) =>
        discount.id === discountId ? { ...discount, ...updates } : discount,
      ),
    }))
  },

  createPromotion: (promotion) => {
    const newPromotion = {
      ...promotion,
      id: `PROMO-${Date.now()}`,
      views: "0",
      clicks: "0",
      conversions: "0",
    }
    set((state) => ({
      promotions: [...state.promotions, newPromotion],
    }))
  },

  updatePromotion: (promotionId, updates) => {
    set((state) => ({
      promotions: state.promotions.map((promotion) =>
        promotion.id === promotionId ? { ...promotion, ...updates } : promotion,
      ),
    }))
  },

  createAdvertisement: (ad) => {
    const newAd = {
      ...ad,
      id: `AD-${Date.now()}`,
      spent: "$0",
      impressions: "0",
      clicks: "0",
      ctr: "0%",
      cpc: "$0.00",
    }
    set((state) => ({
      advertisements: [...state.advertisements, newAd],
    }))
  },

  updateAdvertisement: (adId, updates) => {
    set((state) => ({
      advertisements: state.advertisements.map((ad) => (ad.id === adId ? { ...ad, ...updates } : ad)),
    }))
  },
}))
