import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Password hash for local authentication (bcrypt) */
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "manager", "sales"]).default("user").notNull(),
  /** Who invited this user */
  invitedBy: int("invitedBy"),
  /** Invitation token for new users */
  invitationToken: varchar("invitationToken", { length: 255 }),
  /** Invitation token expiry */
  invitationTokenExpiry: timestamp("invitationTokenExpiry"),
  /** Is the user active */
  isActive: boolean("isActive").default(true).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  verificationToken: varchar("verificationToken", { length: 255 }),
  verificationTokenExpiry: timestamp("verificationTokenExpiry"),
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetTokenExpiry: timestamp("passwordResetTokenExpiry"),
  /** Customer profile fields */
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  /** Full address */
  street: varchar("street", { length: 255 }),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postalCode", { length: 20 }),
  country: varchar("country", { length: 100 }),
  /** Date of birth for verification */
  dateOfBirth: timestamp("dateOfBirth"),
  /** ID document type */
  idDocumentType: mysqlEnum("idDocumentType", ["passport", "id_card", "drivers_license"]),
  /** ID document number */
  idDocumentNumber: varchar("idDocumentNumber", { length: 100 }),
  /** Profile completion status */
  profileComplete: boolean("profileComplete").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User invitations table for tracking pending invitations
 */
export const userInvitations = mysqlTable("user_invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["user", "admin", "manager", "sales"]).default("user").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  invitedBy: int("invitedBy").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  status: mysqlEnum("status", ["pending", "accepted", "expired", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserInvitation = typeof userInvitations.$inferSelect;
export type InsertUserInvitation = typeof userInvitations.$inferInsert;

/**
 * Contact inquiries table for storing lead form submissions
 */
export const contactInquiries = mysqlTable("contact_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(),
});

export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InsertContactInquiry = typeof contactInquiries.$inferInsert;

/**
 * Properties table for real estate listings
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  /** Extended description with more details */
  longDescription: text("longDescription"),
  location: varchar("location", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  /** GPS coordinates for map display */
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  /** Price per square meter */
  pricePerSqm: decimal("pricePerSqm", { precision: 10, scale: 2 }),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  bedrooms: int("bedrooms").notNull(),
  bathrooms: int("bathrooms").notNull(),
  /** Year of construction */
  yearBuilt: int("yearBuilt"),
  /** Property type */
  propertyType: mysqlEnum("propertyType", ["apartment", "house", "villa", "commercial", "land"]).default("apartment"),
  constructionStatus: mysqlEnum("constructionStatus", ["planning", "foundation", "structure", "finishing", "completed"]).notNull(),
  completionDate: timestamp("completionDate"),
  /** Main image URL */
  mainImage: varchar("mainImage", { length: 500 }),
  images: text("images").notNull(), // JSON array of image URLs
  /** JSON array of video URLs (YouTube, Vimeo, or direct) */
  videos: text("videos"),
  /** Virtual tour URL */
  virtualTourUrl: varchar("virtualTourUrl", { length: 500 }),
  features: text("features"), // JSON array of features
  /** JSON array of amenities */
  amenities: text("amenities"),
  expectedReturn: decimal("expectedReturn", { precision: 5, scale: 2 }), // percentage
  rentalGuarantee: boolean("rentalGuarantee").default(false),
  /** Rental guarantee percentage if available */
  rentalGuaranteePercent: decimal("rentalGuaranteePercent", { precision: 5, scale: 2 }),
  /** Rental guarantee duration in months */
  rentalGuaranteeDuration: int("rentalGuaranteeDuration"),
  installmentAvailable: boolean("installmentAvailable").default(true),
  minDownPayment: decimal("minDownPayment", { precision: 5, scale: 2 }), // percentage
  /** Maximum installment duration in months */
  maxInstallmentMonths: int("maxInstallmentMonths"),
  /** Interest rate for installments */
  installmentInterestRate: decimal("installmentInterestRate", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["available", "reserved", "sold"]).default("available").notNull(),
  /** Featured property for homepage */
  isFeatured: boolean("isFeatured").default(false),
  /** View count */
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Service packages table
 */
export const servicePackages = mysqlTable("service_packages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: mysqlEnum("type", ["single", "bundle"]).notNull(), // single service or bundle
  services: text("services").notNull(), // JSON array of included services
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServicePackage = typeof servicePackages.$inferSelect;
export type InsertServicePackage = typeof servicePackages.$inferInsert;

/**
 * Bookings table for property and service package purchases
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId"),
  packageIds: text("packageIds"), // JSON array of service package IDs
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
  downPayment: decimal("downPayment", { precision: 15, scale: 2 }).notNull(),
  remainingAmount: decimal("remainingAmount", { precision: 15, scale: 2 }).notNull(),
  paymentPlan: mysqlEnum("paymentPlan", ["full", "monthly", "quarterly"]).notNull(),
  installmentMonths: int("installmentMonths"),
  status: mysqlEnum("status", ["pending", "confirmed", "active", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Installment payments table
 */
export const installmentPayments = mysqlTable("installment_payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallmentPayment = typeof installmentPayments.$inferSelect;
export type InsertInstallmentPayment = typeof installmentPayments.$inferInsert;

/**
 * Property media table for multiple images and videos
 */
export const propertyMedia = mysqlTable("property_media", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  type: mysqlEnum("type", ["image", "video", "document"]).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  /** S3 key for uploaded files */
  s3Key: varchar("s3Key", { length: 500 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  /** Display order */
  sortOrder: int("sortOrder").default(0),
  /** Is this the main/cover image */
  isPrimary: boolean("isPrimary").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertyMedia = typeof propertyMedia.$inferSelect;
export type InsertPropertyMedia = typeof propertyMedia.$inferInsert;

/**
 * Services table for individual services (company formation, rental guarantees, etc.)
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("longDescription"),
  category: mysqlEnum("category", ["company_formation", "rental_guarantee", "property_management", "legal", "tax", "other"]).notNull(),
  /** Base price in EUR */
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  /** Price type */
  priceType: mysqlEnum("priceType", ["fixed", "monthly", "yearly", "percentage", "custom"]).default("fixed"),
  /** If percentage-based, what percentage */
  percentageRate: decimal("percentageRate", { precision: 5, scale: 2 }),
  /** Duration in months (for subscriptions) */
  durationMonths: int("durationMonths"),
  /** JSON array of included items/features */
  includedItems: text("includedItems"),
  /** JSON array of requirements */
  requirements: text("requirements"),
  /** Processing time in days */
  processingTimeDays: int("processingTimeDays"),
  /** Icon name for display */
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  /** Can be purchased standalone */
  isStandalone: boolean("isStandalone").default(true),
  /** Can be added to property purchase */
  isAddon: boolean("isAddon").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Shopping cart table
 */
export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  /** Session ID for guest carts */
  sessionId: varchar("sessionId", { length: 255 }),
  status: mysqlEnum("status", ["active", "converted", "abandoned"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

/**
 * Cart items table
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  itemType: mysqlEnum("itemType", ["property", "service", "package"]).notNull(),
  /** Property ID if itemType is property */
  propertyId: int("propertyId"),
  /** Service ID if itemType is service */
  serviceId: int("serviceId"),
  /** Package ID if itemType is package */
  packageId: int("packageId"),
  quantity: int("quantity").default(1).notNull(),
  /** Unit price at time of adding to cart */
  unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
  /** JSON object with additional options (e.g., payment plan selection) */
  options: text("options"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders table
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  /** Order number for display */
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: int("userId").notNull(),
  /** Total order amount */
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }).notNull(),
  /** Amount in selected currency */
  currencyAmount: decimal("currencyAmount", { precision: 20, scale: 8 }),
  currency: varchar("currency", { length: 10 }).default("EUR"),
  /** Crypto currency if paying with crypto */
  cryptoCurrency: varchar("cryptoCurrency", { length: 20 }),
  /** Exchange rate at time of order */
  exchangeRate: decimal("exchangeRate", { precision: 20, scale: 8 }),
  status: mysqlEnum("status", ["pending", "awaiting_payment", "payment_received", "processing", "completed", "cancelled", "refunded"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["wallet", "crypto_btc", "crypto_eth", "crypto_usdt", "bank_transfer", "card"]),
  /** Payment details JSON (wallet address, bank details, etc.) */
  paymentDetails: text("paymentDetails"),
  /** Billing address JSON */
  billingAddress: text("billingAddress"),
  notes: text("notes"),
  /** Admin notes (internal) */
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  itemType: mysqlEnum("itemType", ["property", "service", "package"]).notNull(),
  propertyId: int("propertyId"),
  serviceId: int("serviceId"),
  packageId: int("packageId"),
  /** Item name at time of purchase */
  itemName: varchar("itemName", { length: 255 }).notNull(),
  /** Item description at time of purchase */
  itemDescription: text("itemDescription"),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 15, scale: 2 }).notNull(),
  /** JSON object with selected options */
  options: text("options"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Payment transactions table
 */
export const paymentTransactions = mysqlTable("payment_transactions", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  /** Transaction reference */
  transactionRef: varchar("transactionRef", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["payment", "refund", "partial_payment"]).default("payment").notNull(),
  method: mysqlEnum("method", ["crypto_btc", "crypto_eth", "crypto_usdt", "bank_transfer", "card"]).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  /** Amount in crypto if applicable */
  cryptoAmount: decimal("cryptoAmount", { precision: 20, scale: 8 }),
  cryptoCurrency: varchar("cryptoCurrency", { length: 20 }),
  /** Blockchain transaction hash */
  txHash: varchar("txHash", { length: 255 }),
  /** Wallet address used */
  walletAddress: varchar("walletAddress", { length: 255 }),
  /** Bank transfer reference */
  bankReference: varchar("bankReference", { length: 255 }),
  status: mysqlEnum("status", ["pending", "confirming", "confirmed", "failed", "cancelled"]).default("pending").notNull(),
  /** Number of confirmations (for crypto) */
  confirmations: int("confirmations").default(0),
  /** JSON with additional transaction details */
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Crypto wallet addresses for receiving payments
 */
export const cryptoWallets = mysqlTable("crypto_wallets", {
  id: int("id").autoincrement().primaryKey(),
  currency: varchar("currency", { length: 20 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  label: varchar("label", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = typeof cryptoWallets.$inferInsert;

/**
 * Bank accounts for receiving payments
 */
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  bankName: varchar("bankName", { length: 255 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  iban: varchar("iban", { length: 50 }),
  swift: varchar("swift", { length: 20 }),
  accountNumber: varchar("accountNumber", { length: 50 }),
  routingNumber: varchar("routingNumber", { length: 50 }),
  currency: varchar("currency", { length: 10 }).default("EUR"),
  country: varchar("country", { length: 100 }),
  address: text("address"),
  isActive: boolean("isActive").default(true).notNull(),
  isPrimary: boolean("isPrimary").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

/**
 * Exchange rates cache
 */
export const exchangeRates = mysqlTable("exchange_rates", {
  id: int("id").autoincrement().primaryKey(),
  baseCurrency: varchar("baseCurrency", { length: 10 }).notNull(),
  targetCurrency: varchar("targetCurrency", { length: 10 }).notNull(),
  rate: decimal("rate", { precision: 20, scale: 8 }).notNull(),
  source: varchar("source", { length: 100 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = typeof exchangeRates.$inferInsert;

/**
 * ============================================
 * CRM SYSTEM TABLES
 * ============================================
 */

/**
 * Leads table - Central CRM entity for tracking potential customers
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  /** Link to user if they registered */
  userId: int("userId"),
  /** Link to contact inquiry if created from form */
  contactInquiryId: int("contactInquiryId"),
  /** Lead source */
  source: mysqlEnum("source", ["website", "referral", "social_media", "advertisement", "cold_call", "event", "other"]).default("website").notNull(),
  /** Pipeline stage */
  stage: mysqlEnum("stage", ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).default("new").notNull(),
  /** Lead priority/temperature */
  priority: mysqlEnum("priority", ["cold", "warm", "hot"]).default("warm").notNull(),
  /** Contact information */
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  /** Location */
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  /** Budget range */
  budgetMin: decimal("budgetMin", { precision: 15, scale: 2 }),
  budgetMax: decimal("budgetMax", { precision: 15, scale: 2 }),
  /** Interested property types (JSON array) */
  interestedPropertyTypes: text("interestedPropertyTypes"),
  /** Interested cities (JSON array) */
  interestedCities: text("interestedCities"),
  /** Interested property IDs (JSON array) */
  interestedPropertyIds: text("interestedPropertyIds"),
  /** Investment timeline */
  timeline: mysqlEnum("timeline", ["immediate", "1_3_months", "3_6_months", "6_12_months", "over_12_months"]),
  /** Lead score (0-100) */
  score: int("score").default(50),
  /** Expected deal value */
  expectedValue: decimal("expectedValue", { precision: 15, scale: 2 }),
  /** Probability of closing (0-100) */
  probability: int("probability").default(50),
  /** Assigned to (admin user ID) */
  assignedTo: int("assignedTo"),
  /** Last contact date */
  lastContactDate: timestamp("lastContactDate"),
  /** Next follow-up date */
  nextFollowUpDate: timestamp("nextFollowUpDate"),
  /** Reason for lost (if stage is lost) */
  lostReason: text("lostReason"),
  /** Won date (if stage is won) */
  wonDate: timestamp("wonDate"),
  /** General notes */
  notes: text("notes"),
  /** Tags (JSON array) */
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Lead activities - Log of all interactions with leads
 */
export const leadActivities = mysqlTable("lead_activities", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  /** Activity type */
  type: mysqlEnum("type", ["note", "call", "email", "meeting", "task", "stage_change", "property_view", "document", "other"]).notNull(),
  /** Activity title/subject */
  title: varchar("title", { length: 255 }).notNull(),
  /** Detailed description */
  description: text("description"),
  /** For calls: duration in minutes */
  callDuration: int("callDuration"),
  /** For calls: outcome */
  callOutcome: mysqlEnum("callOutcome", ["answered", "no_answer", "voicemail", "busy", "wrong_number"]),
  /** For emails: email subject */
  emailSubject: varchar("emailSubject", { length: 255 }),
  /** For meetings: location */
  meetingLocation: varchar("meetingLocation", { length: 255 }),
  /** For meetings: scheduled time */
  meetingTime: timestamp("meetingTime"),
  /** For tasks: due date */
  taskDueDate: timestamp("taskDueDate"),
  /** For tasks: completion status */
  taskCompleted: boolean("taskCompleted").default(false),
  /** For stage changes: old stage */
  oldStage: varchar("oldStage", { length: 50 }),
  /** For stage changes: new stage */
  newStage: varchar("newStage", { length: 50 }),
  /** Related property ID */
  propertyId: int("propertyId"),
  /** Attachment URL */
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  /** Created by (admin user ID) */
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = typeof leadActivities.$inferInsert;

/**
 * CRM Tasks - Follow-up tasks and reminders
 */
export const crmTasks = mysqlTable("crm_tasks", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),
  /** Task type */
  type: mysqlEnum("type", ["follow_up", "call", "email", "meeting", "document", "other"]).default("follow_up").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate").notNull(),
  /** Reminder time before due date */
  reminderMinutes: int("reminderMinutes").default(60),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  /** Assigned to (admin user ID) */
  assignedTo: int("assignedTo"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmTask = typeof crmTasks.$inferSelect;
export type InsertCrmTask = typeof crmTasks.$inferInsert;

/**
 * Lead documents - Files associated with leads
 */
export const leadDocuments = mysqlTable("lead_documents", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["contract", "id_document", "proof_of_funds", "correspondence", "proposal", "other"]).default("other").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  s3Key: varchar("s3Key", { length: 500 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadDocument = typeof leadDocuments.$inferSelect;
export type InsertLeadDocument = typeof leadDocuments.$inferInsert;


/**
 * Videos - Video gallery/media library
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  /** Video URL (YouTube, Vimeo, or direct link) */
  videoUrl: varchar("videoUrl", { length: 500 }).notNull(),
  /** Thumbnail image URL */
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  /** Video category */
  category: mysqlEnum("category", ["about_us", "properties", "georgia", "testimonials", "projects", "other"]).default("other").notNull(),
  /** Video duration in seconds */
  duration: int("duration"),
  /** Display order within category */
  sortOrder: int("sortOrder").default(0),
  /** Featured on homepage */
  featured: boolean("featured").default(false),
  /** Published status */
  published: boolean("published").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * ============================================
 * CUSTOMER WALLET SYSTEM
 * ============================================
 */

/**
 * Customer wallets table - Main wallet for each user
 */
export const customerWallets = mysqlTable("customer_wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Main balance in EUR */
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  /** Bonus balance from interest (can only be used for purchases) */
  bonusBalance: decimal("bonusBalance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  /** Total deposited amount (for tracking first deposit bonus eligibility) */
  totalDeposited: decimal("totalDeposited", { precision: 15, scale: 2 }).default("0.00").notNull(),
  /** Whether user qualifies for 7% annual interest (first deposit >= 10000€) */
  qualifiesForInterest: boolean("qualifiesForInterest").default(false).notNull(),
  /** Date when interest was last calculated */
  lastInterestCalculation: timestamp("lastInterestCalculation"),
  /** First deposit date (for interest calculation) */
  firstDepositDate: timestamp("firstDepositDate"),
  /** Wallet status */
  status: mysqlEnum("status", ["active", "frozen", "closed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerWallet = typeof customerWallets.$inferSelect;
export type InsertCustomerWallet = typeof customerWallets.$inferInsert;

/**
 * Wallet transactions table - All deposits, withdrawals, and purchases
 */
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  userId: int("userId").notNull(),
  /** Transaction type */
  type: mysqlEnum("type", ["deposit", "withdrawal", "purchase", "refund", "interest_credit", "bonus_used"]).notNull(),
  /** Amount in EUR */
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  /** Balance after transaction */
  balanceAfter: decimal("balanceAfter", { precision: 15, scale: 2 }).notNull(),
  /** Bonus balance after transaction (if applicable) */
  bonusBalanceAfter: decimal("bonusBalanceAfter", { precision: 15, scale: 2 }),
  /** Deposit method */
  depositMethod: mysqlEnum("depositMethod", ["bank_transfer", "crypto_btc", "crypto_eth", "crypto_usdt", "crypto_other"]),
  /** For crypto deposits: currency used */
  cryptoCurrency: varchar("cryptoCurrency", { length: 20 }),
  /** For crypto deposits: amount in crypto */
  cryptoAmount: decimal("cryptoAmount", { precision: 20, scale: 8 }),
  /** For crypto deposits: exchange rate used */
  exchangeRate: decimal("exchangeRate", { precision: 20, scale: 8 }),
  /** For crypto deposits: transaction hash */
  txHash: varchar("txHash", { length: 255 }),
  /** For bank transfers: reference number */
  bankReference: varchar("bankReference", { length: 255 }),
  /** Related order ID (for purchases) */
  orderId: int("orderId"),
  /** Transaction status */
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  /** Description/notes */
  description: text("description"),
  /** Admin notes (internal) */
  adminNotes: text("adminNotes"),
  /** Processed by admin user ID */
  processedBy: int("processedBy"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

/**
 * Deposit requests table - Pending deposit requests from customers
 */
export const depositRequests = mysqlTable("deposit_requests", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  userId: int("userId").notNull(),
  /** Requested amount in EUR */
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  /** Deposit method */
  method: mysqlEnum("method", ["bank_transfer", "crypto_btc", "crypto_eth", "crypto_usdt", "crypto_other"]).notNull(),
  /** For crypto: expected crypto amount */
  cryptoAmount: decimal("cryptoAmount", { precision: 20, scale: 8 }),
  /** For crypto: currency */
  cryptoCurrency: varchar("cryptoCurrency", { length: 20 }),
  /** For crypto: wallet address to send to */
  depositAddress: varchar("depositAddress", { length: 255 }),
  /** For bank: bank account ID to transfer to */
  bankAccountId: int("bankAccountId"),
  /** Request status */
  status: mysqlEnum("status", ["pending", "awaiting_payment", "payment_received", "processing", "completed", "expired", "cancelled"]).default("pending").notNull(),
  /** Expiration time for the deposit request */
  expiresAt: timestamp("expiresAt"),
  /** Customer notes */
  notes: text("notes"),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  /** Processed by admin */
  processedBy: int("processedBy"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DepositRequest = typeof depositRequests.$inferSelect;
export type InsertDepositRequest = typeof depositRequests.$inferInsert;

/**
 * Interest calculations log - Track all interest calculations
 */
export const interestCalculations = mysqlTable("interest_calculations", {
  id: int("id").autoincrement().primaryKey(),
  walletId: int("walletId").notNull(),
  userId: int("userId").notNull(),
  /** Balance used for calculation */
  principalAmount: decimal("principalAmount", { precision: 15, scale: 2 }).notNull(),
  /** Interest rate applied (7% = 7.00) */
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).notNull(),
  /** Calculated interest amount */
  interestAmount: decimal("interestAmount", { precision: 15, scale: 2 }).notNull(),
  /** Period start date */
  periodStart: timestamp("periodStart").notNull(),
  /** Period end date */
  periodEnd: timestamp("periodEnd").notNull(),
  /** Days in period */
  daysInPeriod: int("daysInPeriod").notNull(),
  /** Status */
  status: mysqlEnum("status", ["calculated", "credited", "cancelled"]).default("calculated").notNull(),
  /** Related transaction ID when credited */
  transactionId: int("transactionId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InterestCalculation = typeof interestCalculations.$inferSelect;
export type InsertInterestCalculation = typeof interestCalculations.$inferInsert;


/**
 * ============================================
 * PURCHASE CONTRACT SYSTEM
 * ============================================
 */

/**
 * Purchase contracts table - Pre-contracts (Vorvertrag) for property purchases
 * Based on Georgian law with 14-day withdrawal period
 */
export const purchaseContracts = mysqlTable("purchase_contracts", {
  id: int("id").autoincrement().primaryKey(),
  /** Contract number (auto-generated) */
  contractNumber: varchar("contractNumber", { length: 50 }).notNull().unique(),
  /** Buyer (user) */
  userId: int("userId").notNull(),
  /** Property being purchased */
  propertyId: int("propertyId").notNull(),
  
  /** Contract type */
  contractType: mysqlEnum("contractType", ["pre_contract", "notary_contract"]).default("pre_contract").notNull(),
  
  /** Buyer information (snapshot at contract time) */
  buyerFirstName: varchar("buyerFirstName", { length: 100 }).notNull(),
  buyerLastName: varchar("buyerLastName", { length: 100 }).notNull(),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 50 }),
  buyerAddress: text("buyerAddress"),
  buyerIdType: mysqlEnum("buyerIdType", ["passport", "id_card", "drivers_license"]),
  buyerIdNumber: varchar("buyerIdNumber", { length: 100 }),
  buyerDateOfBirth: timestamp("buyerDateOfBirth"),
  buyerNationality: varchar("buyerNationality", { length: 100 }),
  
  /** Property information (snapshot at contract time) */
  propertyTitle: varchar("propertyTitle", { length: 255 }).notNull(),
  propertyLocation: varchar("propertyLocation", { length: 255 }).notNull(),
  propertyCity: varchar("propertyCity", { length: 100 }).notNull(),
  propertyArea: decimal("propertyArea", { precision: 10, scale: 2 }).notNull(),
  
  /** Financial terms */
  purchasePrice: decimal("purchasePrice", { precision: 15, scale: 2 }).notNull(),
  downPaymentPercent: decimal("downPaymentPercent", { precision: 5, scale: 2 }).notNull(),
  downPaymentAmount: decimal("downPaymentAmount", { precision: 15, scale: 2 }).notNull(),
  remainingAmount: decimal("remainingAmount", { precision: 15, scale: 2 }).notNull(),
  
  /** Payment plan */
  paymentPlan: mysqlEnum("paymentPlan", ["full", "installment"]).default("installment").notNull(),
  installmentMonths: int("installmentMonths"),
  monthlyInstallment: decimal("monthlyInstallment", { precision: 15, scale: 2 }),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).default("0.00"),
  
  /** Expected completion date (for pre-contracts) */
  expectedCompletionDate: timestamp("expectedCompletionDate"),
  
  /** Digital signature */
  buyerSignature: text("buyerSignature"), // Base64 encoded signature image
  buyerSignedAt: timestamp("buyerSignedAt"),
  buyerSignedIp: varchar("buyerSignedIp", { length: 50 }),
  
  /** Seller signature (admin) */
  sellerSignature: text("sellerSignature"),
  sellerSignedAt: timestamp("sellerSignedAt"),
  sellerSignedBy: int("sellerSignedBy"), // Admin user ID
  
  /** Contract status */
  status: mysqlEnum("status", [
    "draft",           // Contract created but not signed
    "pending_payment", // Signed, waiting for down payment
    "active",          // Down payment received, contract active
    "withdrawal",      // Buyer exercised withdrawal right (14 days)
    "completed",       // Property delivered, final payment made
    "cancelled",       // Contract cancelled
    "converted"        // Converted to notary contract
  ]).default("draft").notNull(),
  
  /** Withdrawal period */
  withdrawalDeadline: timestamp("withdrawalDeadline"), // 14 days from signing
  withdrawalRequestedAt: timestamp("withdrawalRequestedAt"),
  withdrawalReason: text("withdrawalReason"),
  
  /** Payment tracking */
  downPaymentPaidAt: timestamp("downPaymentPaidAt"),
  downPaymentTransactionId: int("downPaymentTransactionId"),
  
  /** PDF document */
  contractPdfUrl: varchar("contractPdfUrl", { length: 500 }),
  contractPdfKey: varchar("contractPdfKey", { length: 500 }),
  
  /** Notary contract reference (when converted) */
  notaryContractId: int("notaryContractId"),
  notaryDate: timestamp("notaryDate"),
  notaryName: varchar("notaryName", { length: 255 }),
  notaryNumber: varchar("notaryNumber", { length: 100 }),
  
  /** Additional terms */
  specialConditions: text("specialConditions"),
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseContract = typeof purchaseContracts.$inferSelect;
export type InsertPurchaseContract = typeof purchaseContracts.$inferInsert;

/**
 * Contract documents table - Additional documents attached to contracts
 */
export const contractDocuments = mysqlTable("contract_documents", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  /** Document type */
  documentType: mysqlEnum("documentType", [
    "id_copy",
    "proof_of_address",
    "payment_receipt",
    "notary_draft",
    "notary_final",
    "property_document",
    "other"
  ]).notNull(),
  /** Document title */
  title: varchar("title", { length: 255 }).notNull(),
  /** File URL */
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  /** S3 key */
  s3Key: varchar("s3Key", { length: 500 }),
  /** File size in bytes */
  fileSize: int("fileSize"),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 100 }),
  /** Uploaded by */
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractDocument = typeof contractDocuments.$inferSelect;
export type InsertContractDocument = typeof contractDocuments.$inferInsert;

/**
 * Contract status history - Audit trail for contract changes
 */
export const contractStatusHistory = mysqlTable("contract_status_history", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  /** Previous status */
  fromStatus: varchar("fromStatus", { length: 50 }),
  /** New status */
  toStatus: varchar("toStatus", { length: 50 }).notNull(),
  /** Changed by user */
  changedBy: int("changedBy"),
  /** Change reason/notes */
  reason: text("reason"),
  /** IP address */
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractStatusHistory = typeof contractStatusHistory.$inferSelect;
export type InsertContractStatusHistory = typeof contractStatusHistory.$inferInsert;


/**
 * Property drafts table for AI-assisted property creation
 * Stores extracted data from uploaded documents before admin approval
 */
export const propertyDrafts = mysqlTable("property_drafts", {
  id: int("id").autoincrement().primaryKey(),
  /** Status of the draft */
  status: mysqlEnum("status", ["processing", "draft", "pending_review", "approved", "rejected"]).default("processing").notNull(),
  /** Developer/Builder name */
  developerName: varchar("developerName", { length: 255 }),
  /** Original source documents (JSON array of URLs) */
  sourceDocuments: text("sourceDocuments"),
  /** Extracted property data (JSON) */
  extractedData: text("extractedData"),
  /** Admin-adjusted property data (JSON) */
  adjustedData: text("adjustedData"),
  /** Property title */
  title: varchar("title", { length: 255 }),
  description: text("description"),
  longDescription: text("longDescription"),
  location: varchar("location", { length: 255 }),
  city: varchar("city", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  /** Original price from developer */
  originalPrice: decimal("originalPrice", { precision: 15, scale: 2 }),
  /** Adjusted selling price */
  sellingPrice: decimal("sellingPrice", { precision: 15, scale: 2 }),
  /** Price per square meter */
  pricePerSqm: decimal("pricePerSqm", { precision: 10, scale: 2 }),
  area: decimal("area", { precision: 10, scale: 2 }),
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  yearBuilt: int("yearBuilt"),
  propertyType: mysqlEnum("propertyType", ["apartment", "house", "villa", "commercial", "land"]).default("apartment"),
  constructionStatus: mysqlEnum("constructionStatus", ["planning", "foundation", "structure", "finishing", "completed"]),
  completionDate: timestamp("completionDate"),
  /** Main image URL */
  mainImage: varchar("mainImage", { length: 500 }),
  /** JSON array of image URLs */
  images: text("images"),
  /** JSON array of video URLs */
  videos: text("videos"),
  /** JSON array of features */
  features: text("features"),
  /** JSON array of amenities */
  amenities: text("amenities"),
  /** Expected return percentage */
  expectedReturn: decimal("expectedReturn", { precision: 5, scale: 2 }),
  /** Rental guarantee available */
  rentalGuarantee: boolean("rentalGuarantee").default(false),
  rentalGuaranteePercent: decimal("rentalGuaranteePercent", { precision: 5, scale: 2 }),
  rentalGuaranteeDuration: int("rentalGuaranteeDuration"),
  /** Installment payment options */
  installmentAvailable: boolean("installmentAvailable").default(true),
  /** Minimum down payment percentage */
  minDownPayment: decimal("minDownPayment", { precision: 5, scale: 2 }),
  /** Maximum installment duration in months */
  maxInstallmentMonths: int("maxInstallmentMonths"),
  /** Interest rate for installments */
  installmentInterestRate: decimal("installmentInterestRate", { precision: 5, scale: 2 }),
  /** Additional services (JSON array) */
  additionalServices: text("additionalServices"),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  /** Rejection reason if rejected */
  rejectionReason: text("rejectionReason"),
  /** ID of the created property after approval */
  approvedPropertyId: int("approvedPropertyId"),
  /** Created by admin ID */
  createdBy: int("createdBy"),
  /** Reviewed by admin ID */
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyDraft = typeof propertyDrafts.$inferSelect;
export type InsertPropertyDraft = typeof propertyDrafts.$inferInsert;


/**
 * Developer/Bauträger templates for standardized settings
 * Stores default margin, payment terms, and contact info per developer
 */
export const developers = mysqlTable("developers", {
  id: int("id").autoincrement().primaryKey(),
  /** Developer/Bauträger name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Short code for quick reference */
  code: varchar("code", { length: 50 }).unique(),
  /** Company description */
  description: text("description"),
  /** Logo URL */
  logoUrl: varchar("logoUrl", { length: 500 }),
  /** Website */
  website: varchar("website", { length: 255 }),
  
  // Contact Information
  contactPerson: varchar("contactPerson", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Georgien"),
  
  // Default Pricing Settings
  /** Default margin percentage to add to purchase price */
  defaultMarginPercent: decimal("defaultMarginPercent", { precision: 5, scale: 2 }).default("15.00"),
  /** Fixed margin amount (alternative to percentage) */
  fixedMarginAmount: decimal("fixedMarginAmount", { precision: 12, scale: 2 }),
  /** Use percentage or fixed margin */
  marginType: mysqlEnum("marginType", ["percentage", "fixed", "both"]).default("percentage"),
  
  // Default Payment Terms
  /** Minimum down payment percentage */
  defaultDownPaymentPercent: decimal("defaultDownPaymentPercent", { precision: 5, scale: 2 }).default("30.00"),
  /** Allow installment payments */
  allowInstallments: boolean("allowInstallments").default(true),
  /** Maximum installment duration in months */
  maxInstallmentMonths: int("maxInstallmentMonths").default(36),
  /** Default interest rate for installments */
  defaultInterestRate: decimal("defaultInterestRate", { precision: 5, scale: 2 }).default("6.00"),
  /** Minimum interest rate allowed */
  minInterestRate: decimal("minInterestRate", { precision: 5, scale: 2 }).default("4.00"),
  /** Maximum interest rate allowed */
  maxInterestRate: decimal("maxInterestRate", { precision: 5, scale: 2 }).default("12.00"),
  
  // Contract Settings
  /** Default contract language */
  defaultContractLanguage: mysqlEnum("defaultContractLanguage", ["de", "en", "ka"]).default("de"),
  /** Special contract clauses for this developer */
  specialContractClauses: text("specialContractClauses"),
  /** Warranty period in months */
  warrantyMonths: int("warrantyMonths").default(24),
  
  // Additional Services
  /** Default services included (JSON array of service IDs) */
  defaultServices: json("defaultServices").$type<number[]>(),
  /** Commission rate for referrals */
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  /** Notes for internal use */
  internalNotes: text("internalNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Developer = typeof developers.$inferSelect;
export type InsertDeveloper = typeof developers.$inferInsert;
