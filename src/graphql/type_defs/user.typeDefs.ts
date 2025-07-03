import gql from "graphql-tag";

export const userTypeDefs = gql`
  scalar DateTime
  scalar JSON

  enum Role {
    USER
    SELLER
    ADMIN
  }

  enum AddressType {
    STORE
    PERMANENT
    TEMPORARY
  }

  enum ProductStatus {
    PENDING
    APPROVED
    REJECTED
    SUSPENDED
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  type User {
    id: ID!
    clerkId: String!
    email: String!
    role: Role!
    products: [Product!]!
    orders: [Order!]!
    cartItems: [CartItem!]!
    wishlistItems: [WishlistItem!]!
    reviews: [RatingAndReview!]!
    likes: [LikeAndDislike!]!
    profile: Profile
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
  }

  type Profile {
    id: ID!
    user: User!
    userId: ID!
    firstName: String!
    lastName: String!
    phoneNumber: String
    addresses: [Address!]!
    document: Document
    avatar: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Document {
    id: ID!
    panNumber: String!
    profile: Profile!
    profileId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Address {
    id: ID!
    province: String!
    addressLabel: String
    pinCode: String!
    locality: String!
    city: String!
    landMark: String
    addressType: AddressType!
    profile: Profile!
    profileId: ID!
    storeDetail: StoreDetail
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type StoreDetail {
    id: ID!
    storeName: String!
    storeType: String!
    description: String
    address: Address
    addressId: ID
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    sku: String
    stock: Int!
    seller: User!
    sellerId: ID!
    images: [ProductImage!]!
    videos: [ProductVideo!]!
    features: [ProductFeature!]!
    status: ProductStatus!
    discount: Discount
    reviews: [RatingAndReview!]!
    likes: [LikeAndDislike!]!
    cartItems: [CartItem!]!
    wishlistItems: [WishlistItem!]!
    orderItems: [OrderItem!]!
    categories: [ProductCategory!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
  }

  type ProductImage {
    id: ID!
    url: String!
    altText: String
    isPrimary: Boolean!
    product: Product!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductFeature {
    id: ID!
    feature: String!
    value: String
    product: Product!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CartItem {
    id: ID!
    quantity: Int!
    user: User!
    userId: ID!
    product: Product!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type WishlistItem {
    id: ID!
    user: User!
    userId: ID!
    product: Product!
    productId: ID!
    createdAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    slug: String!
    parentId: ID
    parent: Category
    children: [Category!]!
    products: [ProductCategory!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductCategory {
    id: ID!
    product: Product!
    productId: ID!
    category: Category!
    categoryId: ID!
    createdAt: DateTime!
  }

  type RatingAndReview {
    id: ID!
    review: String!
    rating: Int!
    user: User!
    userId: ID!
    product: Product!
    productId: ID!
    likes: [LikeAndDislike!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type LikeAndDislike {
    id: ID!
    isLike: Boolean!
    user: User!
    userId: ID!
    product: Product
    productId: ID
    review: RatingAndReview
    reviewId: ID
    createdAt: DateTime!
  }

  type Discount {
    id: ID!
    product: Product!
    productId: ID!
    discountPercent: Float!
    startDate: DateTime!
    endDate: DateTime!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Order {
    id: ID!
    orderNumber: String!
    status: OrderStatus!
    totalAmount: Float!
    user: User!
    userId: ID!
    shippingAddress: JSON!
    items: [OrderItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    quantity: Int!
    price: Float!
    order: Order!
    orderId: ID!
    product: Product!
    productId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    me: User
    products: [Product!]!
    product(id: ID!): Product
  }

  type Mutation {
    addToCart(productId: ID!, quantity: Int!): CartItem
    addToWishlist(productId: ID!): WishlistItem
  }
`;