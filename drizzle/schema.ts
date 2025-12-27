import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
  paymentMethod: mysqlEnum("paymentMethod", ["crypto_btc", "crypto_eth", "crypto_usdt", "bank_transfer", "card"]),
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
