import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  contactInquiries, 
  InsertContactInquiry,
  properties,
  InsertProperty,
  servicePackages,
  InsertServicePackage,
  bookings,
  InsertBooking,
  installmentPayments,
  InsertInstallmentPayment,
  leads,
  InsertLead,
  Lead,
  leadActivities,
  InsertLeadActivity,
  LeadActivity,
  crmTasks,
  InsertCrmTask,
  CrmTask,
  leadDocuments,
  InsertLeadDocument,
  videos,
  InsertVideo,
  Video,
  customerWallets,
  CustomerWallet,
  InsertCustomerWallet,
  walletTransactions,
  WalletTransaction,
  InsertWalletTransaction,
  depositRequests,
  DepositRequest,
  InsertDepositRequest,
  interestCalculations,
  InterestCalculation,
  InsertInterestCalculation,
  purchaseContracts,
  PurchaseContract,
  InsertPurchaseContract,
  contractDocuments,
  ContractDocument,
  InsertContractDocument,
  contractStatusHistory,
  ContractStatusHistory,
  InsertContractStatusHistory,
  propertyDrafts,
  PropertyDraft,
  InsertPropertyDraft
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new contact inquiry
 */
export async function createContactInquiry(inquiry: InsertContactInquiry) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create contact inquiry: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(contactInquiries).values(inquiry);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create contact inquiry:", error);
    throw error;
  }
}

/**
 * Get all contact inquiries
 */
export async function getAllContactInquiries() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contact inquiries: database not available");
    return [];
  }

  try {
    return await db.select().from(contactInquiries).orderBy(contactInquiries.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get contact inquiries:", error);
    return [];
  }
}

/**
 * Update contact inquiry status
 */
export async function updateContactInquiryStatus(id: number, status: "new" | "contacted" | "closed") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update contact inquiry: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.update(contactInquiries).set({ status }).where(eq(contactInquiries.id, id));
  } catch (error) {
    console.error("[Database] Failed to update contact inquiry:", error);
    throw error;
  }
}

/**
 * Delete contact inquiry
 */
export async function deleteContactInquiry(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete contact inquiry: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.delete(contactInquiries).where(eq(contactInquiries.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete contact inquiry:", error);
    throw error;
  }
}

// ============================================
// PROPERTIES
// ============================================

/**
 * Get all properties
 */
export async function getAllProperties() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get properties: database not available");
    return [];
  }

  try {
    return await db.select().from(properties).where(eq(properties.status, "available")).orderBy(desc(properties.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get properties:", error);
    return [];
  }
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get property: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get property:", error);
    return undefined;
  }
}

/**
 * Create a new property
 */
export async function createProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create property: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(properties).values(property);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create property:", error);
    throw error;
  }
}

/**
 * Update property
 */
export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update property: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.update(properties).set(data).where(eq(properties.id, id));
  } catch (error) {
    console.error("[Database] Failed to update property:", error);
    throw error;
  }
}

// ============================================
// SERVICE PACKAGES
// ============================================

/**
 * Get all active service packages
 */
export async function getAllServicePackages() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get service packages: database not available");
    return [];
  }

  try {
    return await db.select().from(servicePackages).where(eq(servicePackages.isActive, true)).orderBy(desc(servicePackages.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get service packages:", error);
    return [];
  }
}

/**
 * Create a new service package
 */
export async function createServicePackage(pkg: InsertServicePackage) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create service package: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(servicePackages).values(pkg);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create service package:", error);
    throw error;
  }
}

// ============================================
// BOOKINGS
// ============================================

/**
 * Create a new booking
 */
export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create booking: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(bookings).values(booking);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create booking:", error);
    throw error;
  }
}

/**
 * Get all bookings for a user
 */
export async function getBookingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bookings: database not available");
    return [];
  }

  try {
    return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get bookings:", error);
    return [];
  }
}

/**
 * Get all bookings (admin)
 */
export async function getAllBookings() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bookings: database not available");
    return [];
  }

  try {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get bookings:", error);
    return [];
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(id: number, status: "pending" | "confirmed" | "active" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update booking: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  } catch (error) {
    console.error("[Database] Failed to update booking:", error);
    throw error;
  }
}

// ============================================
// INSTALLMENT PAYMENTS
// ============================================

/**
 * Create installment payments for a booking
 */
export async function createInstallmentPayments(payments: InsertInstallmentPayment[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create installment payments: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(installmentPayments).values(payments);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create installment payments:", error);
    throw error;
  }
}

/**
 * Get all payments for a booking
 */
export async function getPaymentsByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payments: database not available");
    return [];
  }

  try {
    return await db.select().from(installmentPayments).where(eq(installmentPayments.bookingId, bookingId)).orderBy(installmentPayments.dueDate);
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    return [];
  }
}

/**
 * Get all payments for a user
 */
export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payments: database not available");
    return [];
  }

  try {
    // Join bookings to get payments for user's bookings
    const userBookings = await getBookingsByUserId(userId);
    const bookingIds = userBookings.map(b => b.id);
    
    if (bookingIds.length === 0) return [];
    
    const allPayments = await db.select().from(installmentPayments).orderBy(installmentPayments.dueDate);
    return allPayments.filter(p => bookingIds.includes(p.bookingId));
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    return [];
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  id: number, 
  status: "pending" | "paid" | "overdue" | "cancelled",
  paidDate?: Date,
  transactionId?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update payment: database not available");
    throw new Error("Database not available");
  }

  try {
    const updateData: any = { status };
    if (paidDate) updateData.paidDate = paidDate;
    if (transactionId) updateData.transactionId = transactionId;
    
    await db.update(installmentPayments).set(updateData).where(eq(installmentPayments.id, id));
  } catch (error) {
    console.error("[Database] Failed to update payment:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.


// ============================================
// SERVICES (Einzelne Dienstleistungen)
// ============================================

import { 
  services, 
  InsertService,
  carts,
  InsertCart,
  cartItems,
  InsertCartItem,
  orders,
  InsertOrder,
  orderItems,
  InsertOrderItem,
  paymentTransactions,
  InsertPaymentTransaction,
  cryptoWallets,
  InsertCryptoWallet,
  bankAccounts,
  InsertBankAccount,
  propertyMedia,
  InsertPropertyMedia
} from "../drizzle/schema";

/**
 * Get all active services
 */
export async function getAllServices() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get services: database not available");
    return [];
  }

  try {
    return await db.select().from(services).where(eq(services.isActive, true)).orderBy(services.sortOrder);
  } catch (error) {
    console.error("[Database] Failed to get services:", error);
    return [];
  }
}

/**
 * Get services by category
 */
export async function getServicesByCategory(category: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get services: database not available");
    return [];
  }

  try {
    return await db.select().from(services)
      .where(and(eq(services.isActive, true), eq(services.category, category as any)))
      .orderBy(services.sortOrder);
  } catch (error) {
    console.error("[Database] Failed to get services:", error);
    return [];
  }
}

/**
 * Get service by ID
 */
export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get service: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get service:", error);
    return undefined;
  }
}

/**
 * Create a new service
 */
export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create service: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(services).values(service);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create service:", error);
    throw error;
  }
}

/**
 * Update service
 */
export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update service: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.update(services).set(data).where(eq(services.id, id));
  } catch (error) {
    console.error("[Database] Failed to update service:", error);
    throw error;
  }
}

/**
 * Delete service (soft delete by setting isActive to false)
 */
export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete service: database not available");
    throw new Error("Database not available");
  }

  try {
    await db.update(services).set({ isActive: false }).where(eq(services.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete service:", error);
    throw error;
  }
}

// ============================================
// SHOPPING CART
// ============================================

/**
 * Get or create cart for user/session
 */
export async function getOrCreateCart(userId?: number, sessionId?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Try to find existing active cart
    let cart;
    if (userId) {
      const result = await db.select().from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
        .limit(1);
      cart = result[0];
    } else if (sessionId) {
      const result = await db.select().from(carts)
        .where(and(eq(carts.sessionId, sessionId), eq(carts.status, "active")))
        .limit(1);
      cart = result[0];
    }

    if (cart) return cart;

    // Create new cart
    const newCart: InsertCart = {
      userId: userId || null,
      sessionId: sessionId || null,
      status: "active",
    };
    const result = await db.insert(carts).values(newCart);
    const insertId = (result as any)[0]?.insertId;
    
    if (!insertId) {
      // Fallback: get the cart by sessionId/userId
      if (sessionId) {
        const fallbackCart = await db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
        return fallbackCart[0];
      }
      throw new Error("Failed to create cart");
    }
    
    const createdCart = await db.select().from(carts).where(eq(carts.id, Number(insertId))).limit(1);
    return createdCart[0];
  } catch (error) {
    console.error("[Database] Failed to get/create cart:", error);
    throw error;
  }
}

/**
 * Get cart items
 */
export async function getCartItems(cartId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  } catch (error) {
    console.error("[Database] Failed to get cart items:", error);
    return [];
  }
}

/**
 * Add item to cart
 */
export async function addToCart(item: InsertCartItem) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(cartItems).values(item);
    return result;
  } catch (error) {
    console.error("[Database] Failed to add to cart:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } catch (error) {
    console.error("[Database] Failed to remove from cart:", error);
    throw error;
  }
}

/**
 * Clear cart
 */
export async function clearCart(cartId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  } catch (error) {
    console.error("[Database] Failed to clear cart:", error);
    throw error;
  }
}

// ============================================
// ORDERS
// ============================================

/**
 * Create order
 */
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(orders).values(order);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create order:", error);
    throw error;
  }
}

/**
 * Create order items
 */
export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(orderItems).values(items);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create order items:", error);
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  try {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get order:", error);
    return undefined;
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  try {
    const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get order:", error);
    return undefined;
  }
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get orders:", error);
    return [];
  }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get orders:", error);
    return [];
  }
}

/**
 * Get order items
 */
export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  } catch (error) {
    console.error("[Database] Failed to get order items:", error);
    return [];
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: number, status: string, additionalData?: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const updateData: any = { status, ...additionalData };
    await db.update(orders).set(updateData).where(eq(orders.id, id));
  } catch (error) {
    console.error("[Database] Failed to update order:", error);
    throw error;
  }
}

// ============================================
// PAYMENT TRANSACTIONS
// ============================================

/**
 * Create payment transaction
 */
export async function createPaymentTransaction(transaction: InsertPaymentTransaction) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(paymentTransactions).values(transaction);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create payment transaction:", error);
    throw error;
  }
}

/**
 * Get transactions by order ID
 */
export async function getTransactionsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, orderId));
  } catch (error) {
    console.error("[Database] Failed to get transactions:", error);
    return [];
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(id: number, status: string, additionalData?: any) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const updateData: any = { status, ...additionalData };
    await db.update(paymentTransactions).set(updateData).where(eq(paymentTransactions.id, id));
  } catch (error) {
    console.error("[Database] Failed to update transaction:", error);
    throw error;
  }
}

// ============================================
// CRYPTO WALLETS
// ============================================

/**
 * Get active crypto wallets
 */
export async function getActiveCryptoWallets() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(cryptoWallets).where(eq(cryptoWallets.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get crypto wallets:", error);
    return [];
  }
}

/**
 * Create crypto wallet
 */
export async function createCryptoWallet(wallet: InsertCryptoWallet) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(cryptoWallets).values(wallet);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create crypto wallet:", error);
    throw error;
  }
}

/**
 * Update crypto wallet
 */
export async function updateCryptoWallet(id: number, data: Partial<InsertCryptoWallet>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(cryptoWallets).set(data).where(eq(cryptoWallets.id, id));
  } catch (error) {
    console.error("[Database] Failed to update crypto wallet:", error);
    throw error;
  }
}

// ============================================
// BANK ACCOUNTS
// ============================================

/**
 * Get active bank accounts
 */
export async function getActiveBankAccounts() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(bankAccounts).where(eq(bankAccounts.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get bank accounts:", error);
    return [];
  }
}

/**
 * Create bank account
 */
export async function createBankAccount(account: InsertBankAccount) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(bankAccounts).values(account);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create bank account:", error);
    throw error;
  }
}

/**
 * Update bank account
 */
export async function updateBankAccount(id: number, data: Partial<InsertBankAccount>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id));
  } catch (error) {
    console.error("[Database] Failed to update bank account:", error);
    throw error;
  }
}

// ============================================
// PROPERTY MEDIA
// ============================================

/**
 * Get media for property
 */
export async function getPropertyMedia(propertyId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(propertyMedia)
      .where(eq(propertyMedia.propertyId, propertyId))
      .orderBy(propertyMedia.sortOrder);
  } catch (error) {
    console.error("[Database] Failed to get property media:", error);
    return [];
  }
}

/**
 * Add property media
 */
export async function addPropertyMedia(media: InsertPropertyMedia) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(propertyMedia).values(media);
    return result;
  } catch (error) {
    console.error("[Database] Failed to add property media:", error);
    throw error;
  }
}

/**
 * Delete property media
 */
export async function deletePropertyMedia(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(propertyMedia).where(eq(propertyMedia.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete property media:", error);
    throw error;
  }
}

/**
 * Delete all properties (admin)
 */
export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // First delete related media
    await db.delete(propertyMedia).where(eq(propertyMedia.propertyId, id));
    // Then delete property
    await db.delete(properties).where(eq(properties.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete property:", error);
    throw error;
  }
}

/**
 * Get all properties including non-available (admin)
 */
export async function getAllPropertiesAdmin() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get properties:", error);
    return [];
  }
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AMG-${timestamp}-${random}`;
}


/**
 * ============================================
 * CRM FUNCTIONS
 * ============================================
 */

// ==================== LEADS ====================

/**
 * Create a new lead
 */
export async function createLead(lead: InsertLead): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }

  try {
    const result = await db.insert(leads).values(lead);
    return (result as any)[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to create lead:", error);
    throw error;
  }
}

/**
 * Get all leads
 */
export async function getAllLeads(): Promise<Lead[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get leads: database not available");
    return [];
  }

  try {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get leads:", error);
    return [];
  }
}

/**
 * Get leads by stage
 */
export async function getLeadsByStage(stage: string): Promise<Lead[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get leads by stage: database not available");
    return [];
  }

  try {
    return await db.select().from(leads).where(eq(leads.stage, stage as any)).orderBy(desc(leads.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get leads by stage:", error);
    return [];
  }
}

/**
 * Get lead by ID
 */
export async function getLeadById(id: number): Promise<Lead | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get lead: database not available");
    return null;
  }

  try {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get lead:", error);
    return null;
  }
}

/**
 * Update lead
 */
export async function updateLead(id: number, data: Partial<InsertLead>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update lead: database not available");
    return;
  }

  try {
    await db.update(leads).set(data).where(eq(leads.id, id));
  } catch (error) {
    console.error("[Database] Failed to update lead:", error);
    throw error;
  }
}

/**
 * Update lead stage (with activity logging)
 */
export async function updateLeadStage(id: number, newStage: string, oldStage: string, userId?: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update lead stage: database not available");
    return;
  }

  try {
    // Update the lead stage
    await db.update(leads).set({ 
      stage: newStage as any,
      ...(newStage === 'won' ? { wonDate: new Date() } : {})
    }).where(eq(leads.id, id));

    // Log the stage change as an activity
    await db.insert(leadActivities).values({
      leadId: id,
      type: 'stage_change',
      title: `Phase geändert: ${getStageLabel(oldStage)} → ${getStageLabel(newStage)}`,
      oldStage,
      newStage,
      createdBy: userId,
    });
  } catch (error) {
    console.error("[Database] Failed to update lead stage:", error);
    throw error;
  }
}

/**
 * Delete lead
 */
export async function deleteLead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete lead: database not available");
    return;
  }

  try {
    // Delete related activities first
    await db.delete(leadActivities).where(eq(leadActivities.leadId, id));
    // Delete related tasks
    await db.delete(crmTasks).where(eq(crmTasks.leadId, id));
    // Delete related documents
    await db.delete(leadDocuments).where(eq(leadDocuments.leadId, id));
    // Delete the lead
    await db.delete(leads).where(eq(leads.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete lead:", error);
    throw error;
  }
}

/**
 * Convert contact inquiry to lead
 */
export async function convertInquiryToLead(inquiryId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot convert inquiry: database not available");
    return null;
  }

  try {
    // Get the inquiry
    const inquiry = await db.select().from(contactInquiries).where(eq(contactInquiries.id, inquiryId));
    if (!inquiry[0]) return null;

    const inq = inquiry[0];
    
    // Create lead from inquiry
    const result = await db.insert(leads).values({
      contactInquiryId: inquiryId,
      source: 'website',
      stage: 'new',
      firstName: inq.name.split(' ')[0] || inq.name,
      lastName: inq.name.split(' ').slice(1).join(' ') || undefined,
      email: inq.email,
      phone: inq.phone || undefined,
      notes: inq.message,
    });

    // Update inquiry status
    await db.update(contactInquiries).set({ status: 'contacted' }).where(eq(contactInquiries.id, inquiryId));

    return (result as any)[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to convert inquiry to lead:", error);
    throw error;
  }
}

// ==================== LEAD ACTIVITIES ====================

/**
 * Create lead activity
 */
export async function createLeadActivity(activity: InsertLeadActivity): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create activity: database not available");
    return null;
  }

  try {
    // Update lead's last contact date
    await db.update(leads).set({ lastContactDate: new Date() }).where(eq(leads.id, activity.leadId));
    
    const result = await db.insert(leadActivities).values(activity);
    return (result as any)[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to create activity:", error);
    throw error;
  }
}

/**
 * Get activities for a lead
 */
export async function getLeadActivities(leadId: number): Promise<LeadActivity[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get activities: database not available");
    return [];
  }

  try {
    return await db.select().from(leadActivities).where(eq(leadActivities.leadId, leadId)).orderBy(desc(leadActivities.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get activities:", error);
    return [];
  }
}

/**
 * Get all recent activities
 */
export async function getRecentActivities(limit: number = 50): Promise<LeadActivity[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get recent activities: database not available");
    return [];
  }

  try {
    return await db.select().from(leadActivities).orderBy(desc(leadActivities.createdAt)).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get recent activities:", error);
    return [];
  }
}

// ==================== CRM TASKS ====================

/**
 * Create CRM task
 */
export async function createCrmTask(task: InsertCrmTask): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create task: database not available");
    return null;
  }

  try {
    const result = await db.insert(crmTasks).values(task);
    return (result as any)[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to create task:", error);
    throw error;
  }
}

/**
 * Get tasks for a lead
 */
export async function getLeadTasks(leadId: number): Promise<CrmTask[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tasks: database not available");
    return [];
  }

  try {
    return await db.select().from(crmTasks).where(eq(crmTasks.leadId, leadId)).orderBy(desc(crmTasks.dueDate));
  } catch (error) {
    console.error("[Database] Failed to get tasks:", error);
    return [];
  }
}

/**
 * Get all pending tasks
 */
export async function getPendingTasks(): Promise<CrmTask[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending tasks: database not available");
    return [];
  }

  try {
    return await db.select().from(crmTasks).where(eq(crmTasks.status, 'pending')).orderBy(crmTasks.dueDate);
  } catch (error) {
    console.error("[Database] Failed to get pending tasks:", error);
    return [];
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(id: number, status: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update task: database not available");
    return;
  }

  try {
    await db.update(crmTasks).set({ 
      status: status as any,
      ...(status === 'completed' ? { completedAt: new Date() } : {})
    }).where(eq(crmTasks.id, id));
  } catch (error) {
    console.error("[Database] Failed to update task:", error);
    throw error;
  }
}

/**
 * Delete task
 */
export async function deleteCrmTask(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete task: database not available");
    return;
  }

  try {
    await db.delete(crmTasks).where(eq(crmTasks.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete task:", error);
    throw error;
  }
}

// ==================== CRM STATISTICS ====================

/**
 * Get CRM dashboard statistics
 */
export async function getCrmStats(): Promise<{
  totalLeads: number;
  leadsByStage: Record<string, number>;
  leadsByPriority: Record<string, number>;
  pipelineValue: number;
  conversionRate: number;
  pendingTasks: number;
  recentActivities: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalLeads: 0,
      leadsByStage: {},
      leadsByPriority: {},
      pipelineValue: 0,
      conversionRate: 0,
      pendingTasks: 0,
      recentActivities: 0,
    };
  }

  try {
    const allLeads = await db.select().from(leads);
    const pendingTasksResult = await db.select().from(crmTasks).where(eq(crmTasks.status, 'pending'));
    
    // Calculate stats
    const leadsByStage: Record<string, number> = {};
    const leadsByPriority: Record<string, number> = {};
    let pipelineValue = 0;
    let wonCount = 0;
    let closedCount = 0;

    for (const lead of allLeads) {
      // By stage
      leadsByStage[lead.stage] = (leadsByStage[lead.stage] || 0) + 1;
      
      // By priority
      leadsByPriority[lead.priority] = (leadsByPriority[lead.priority] || 0) + 1;
      
      // Pipeline value (only active leads)
      if (!['won', 'lost'].includes(lead.stage) && lead.expectedValue) {
        pipelineValue += parseFloat(lead.expectedValue.toString());
      }
      
      // Conversion rate
      if (lead.stage === 'won') wonCount++;
      if (['won', 'lost'].includes(lead.stage)) closedCount++;
    }

    const conversionRate = closedCount > 0 ? (wonCount / closedCount) * 100 : 0;

    return {
      totalLeads: allLeads.length,
      leadsByStage,
      leadsByPriority,
      pipelineValue,
      conversionRate,
      pendingTasks: pendingTasksResult.length,
      recentActivities: 0, // Will be calculated separately if needed
    };
  } catch (error) {
    console.error("[Database] Failed to get CRM stats:", error);
    return {
      totalLeads: 0,
      leadsByStage: {},
      leadsByPriority: {},
      pipelineValue: 0,
      conversionRate: 0,
      pendingTasks: 0,
      recentActivities: 0,
    };
  }
}

// Helper function for stage labels
function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    new: 'Neu',
    contacted: 'Kontaktiert',
    qualified: 'Qualifiziert',
    proposal: 'Angebot',
    negotiation: 'Verhandlung',
    won: 'Gewonnen',
    lost: 'Verloren',
  };
  return labels[stage] || stage;
}


// ============================================
// Lead Documents Functions
// ============================================

export async function getLeadDocuments(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(leadDocuments).where(eq(leadDocuments.leadId, leadId)).orderBy(desc(leadDocuments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get lead documents:", error);
    return [];
  }
}

export async function createLeadDocument(data: InsertLeadDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(leadDocuments).values(data);
    return Number((result as any).insertId);
  } catch (error) {
    console.error("[Database] Failed to create lead document:", error);
    throw error;
  }
}

export async function deleteLeadDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // Get document first to return S3 key for deletion
    const doc = await db.select().from(leadDocuments).where(eq(leadDocuments.id, id)).limit(1);
    if (doc.length === 0) throw new Error("Document not found");
    
    await db.delete(leadDocuments).where(eq(leadDocuments.id, id));
    return doc[0];
  } catch (error) {
    console.error("[Database] Failed to delete lead document:", error);
    throw error;
  }
}

export async function getLeadDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(leadDocuments).where(eq(leadDocuments.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get lead document:", error);
    return null;
  }
}


// ==================== VIDEO FUNCTIONS ====================

export async function createVideo(video: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(videos).values(video);
    return { id: result[0].insertId, ...video };
  } catch (error) {
    console.error("[Database] Failed to create video:", error);
    throw error;
  }
}

export async function getVideos(options?: { category?: string; featured?: boolean; published?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    let query = db.select().from(videos);
    
    const conditions = [];
    if (options?.category) {
      conditions.push(eq(videos.category, options.category as any));
    }
    if (options?.featured !== undefined) {
      conditions.push(eq(videos.featured, options.featured));
    }
    if (options?.published !== undefined) {
      conditions.push(eq(videos.published, options.published));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(videos.sortOrder, desc(videos.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get videos:", error);
    return [];
  }
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get video:", error);
    return null;
  }
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.update(videos).set(data).where(eq(videos.id, id));
    return await getVideoById(id);
  } catch (error) {
    console.error("[Database] Failed to update video:", error);
    throw error;
  }
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.delete(videos).where(eq(videos.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete video:", error);
    throw error;
  }
}

export async function getFeaturedVideos(limit: number = 4) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select()
      .from(videos)
      .where(and(eq(videos.featured, true), eq(videos.published, true)))
      .orderBy(videos.sortOrder)
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get featured videos:", error);
    return [];
  }
}


// ==================== WALLET FUNCTIONS ====================

/**
 * Get or create a wallet for a user
 */
export async function getOrCreateWallet(userId: number): Promise<CustomerWallet | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if wallet exists
    const existingWallet = await db.select()
      .from(customerWallets)
      .where(eq(customerWallets.userId, userId))
      .limit(1);

    if (existingWallet.length > 0) {
      return existingWallet[0];
    }

    // Create new wallet
    const result = await db.insert(customerWallets).values({
      userId,
      balance: "0.00",
      bonusBalance: "0.00",
      totalDeposited: "0.00",
      qualifiesForInterest: false,
      status: "active",
    });

    // Fetch and return the created wallet
    const newWallet = await db.select()
      .from(customerWallets)
      .where(eq(customerWallets.userId, userId))
      .limit(1);

    return newWallet[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get or create wallet:", error);
    throw error;
  }
}

/**
 * Get wallet by user ID
 */
export async function getWalletByUserId(userId: number): Promise<CustomerWallet | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const wallet = await db.select()
      .from(customerWallets)
      .where(eq(customerWallets.userId, userId))
      .limit(1);

    return wallet[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get wallet:", error);
    return null;
  }
}

/**
 * Update wallet balance
 */
export async function updateWalletBalance(
  walletId: number, 
  balance: string, 
  bonusBalance?: string,
  additionalData?: Partial<InsertCustomerWallet>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const updateData: any = {
      balance,
      updatedAt: new Date(),
    };
    
    if (bonusBalance !== undefined) {
      updateData.bonusBalance = bonusBalance;
    }
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    await db.update(customerWallets)
      .set(updateData)
      .where(eq(customerWallets.id, walletId));
  } catch (error) {
    console.error("[Database] Failed to update wallet balance:", error);
    throw error;
  }
}

/**
 * Create wallet transaction
 */
export async function createWalletTransaction(transaction: InsertWalletTransaction): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(walletTransactions).values(transaction);
    return Number(result[0].insertId);
  } catch (error) {
    console.error("[Database] Failed to create wallet transaction:", error);
    throw error;
  }
}

/**
 * Get wallet transactions by wallet ID
 */
export async function getWalletTransactions(walletId: number, limit: number = 50): Promise<WalletTransaction[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get wallet transactions:", error);
    return [];
  }
}

/**
 * Get wallet transactions by user ID
 */
export async function getWalletTransactionsByUserId(userId: number, limit: number = 50): Promise<WalletTransaction[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get wallet transactions by user:", error);
    return [];
  }
}

/**
 * Create deposit request
 */
export async function createDepositRequest(request: InsertDepositRequest): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(depositRequests).values(request);
    return Number(result[0].insertId);
  } catch (error) {
    console.error("[Database] Failed to create deposit request:", error);
    throw error;
  }
}

/**
 * Get deposit requests by user ID
 */
export async function getDepositRequestsByUserId(userId: number): Promise<DepositRequest[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(depositRequests)
      .where(eq(depositRequests.userId, userId))
      .orderBy(desc(depositRequests.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get deposit requests:", error);
    return [];
  }
}

/**
 * Get all pending deposit requests (for admin)
 */
export async function getPendingDepositRequests(): Promise<DepositRequest[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(depositRequests)
      .where(eq(depositRequests.status, "pending"))
      .orderBy(desc(depositRequests.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get pending deposit requests:", error);
    return [];
  }
}

/**
 * Get all deposit requests (for admin)
 */
export async function getAllDepositRequests(): Promise<DepositRequest[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(depositRequests)
      .orderBy(desc(depositRequests.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all deposit requests:", error);
    return [];
  }
}

/**
 * Update deposit request status
 */
export async function updateDepositRequestStatus(
  id: number, 
  status: string,
  additionalData?: Partial<InsertDepositRequest>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    await db.update(depositRequests)
      .set(updateData)
      .where(eq(depositRequests.id, id));
  } catch (error) {
    console.error("[Database] Failed to update deposit request status:", error);
    throw error;
  }
}

/**
 * Get deposit request by ID
 */
export async function getDepositRequestById(id: number): Promise<DepositRequest | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const request = await db.select()
      .from(depositRequests)
      .where(eq(depositRequests.id, id))
      .limit(1);

    return request[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get deposit request:", error);
    return null;
  }
}

/**
 * Create interest calculation record
 */
export async function createInterestCalculation(calculation: InsertInterestCalculation): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(interestCalculations).values(calculation);
    return Number(result[0].insertId);
  } catch (error) {
    console.error("[Database] Failed to create interest calculation:", error);
    throw error;
  }
}

/**
 * Get interest calculations by wallet ID
 */
export async function getInterestCalculationsByWalletId(walletId: number): Promise<InterestCalculation[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(interestCalculations)
      .where(eq(interestCalculations.walletId, walletId))
      .orderBy(desc(interestCalculations.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get interest calculations:", error);
    return [];
  }
}

/**
 * Get all wallets (for admin)
 */
export async function getAllWallets(): Promise<CustomerWallet[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(customerWallets)
      .orderBy(desc(customerWallets.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all wallets:", error);
    return [];
  }
}

/**
 * Get wallets qualifying for interest
 */
export async function getWalletsQualifyingForInterest(): Promise<CustomerWallet[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(customerWallets)
      .where(and(
        eq(customerWallets.qualifiesForInterest, true),
        eq(customerWallets.status, "active")
      ));
  } catch (error) {
    console.error("[Database] Failed to get wallets qualifying for interest:", error);
    return [];
  }
}

/**
 * Process deposit and update wallet
 */
export async function processDeposit(
  walletId: number,
  userId: number,
  amount: number,
  depositMethod: "bank_transfer" | "crypto_btc" | "crypto_eth" | "crypto_usdt" | "crypto_other",
  additionalData?: {
    cryptoCurrency?: string;
    cryptoAmount?: string;
    exchangeRate?: string;
    txHash?: string;
    bankReference?: string;
    description?: string;
  }
): Promise<{ success: boolean; qualifiesForBonus: boolean; bonusAmount: number; newBalance: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get current wallet
    const wallet = await db.select()
      .from(customerWallets)
      .where(eq(customerWallets.id, walletId))
      .limit(1);

    if (!wallet[0]) {
      throw new Error("Wallet not found");
    }

    const currentBalance = parseFloat(wallet[0].balance || "0");
    const currentTotalDeposited = parseFloat(wallet[0].totalDeposited || "0");
    const newBalance = currentBalance + amount;
    const newTotalDeposited = currentTotalDeposited + amount;

    // Check if this is the first deposit and qualifies for 7% interest
    const isFirstDeposit = currentTotalDeposited === 0;
    const qualifiesForBonus = isFirstDeposit && amount >= 10000;

    // Update wallet
    const updateData: any = {
      balance: newBalance.toFixed(2),
      totalDeposited: newTotalDeposited.toFixed(2),
      updatedAt: new Date(),
    };

    if (qualifiesForBonus) {
      updateData.qualifiesForInterest = true;
      updateData.firstDepositDate = new Date();
      updateData.lastInterestCalculation = new Date();
    }

    await db.update(customerWallets)
      .set(updateData)
      .where(eq(customerWallets.id, walletId));

    // Create transaction record
    await db.insert(walletTransactions).values({
      walletId,
      userId,
      type: "deposit",
      amount: amount.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      bonusBalanceAfter: wallet[0].bonusBalance,
      depositMethod,
      cryptoCurrency: additionalData?.cryptoCurrency,
      cryptoAmount: additionalData?.cryptoAmount,
      exchangeRate: additionalData?.exchangeRate,
      txHash: additionalData?.txHash,
      bankReference: additionalData?.bankReference,
      status: "completed",
      description: additionalData?.description || `Einzahlung via ${depositMethod}`,
    });

    return {
      success: true,
      qualifiesForBonus,
      bonusAmount: qualifiesForBonus ? amount * 0.07 : 0,
      newBalance,
    };
  } catch (error) {
    console.error("[Database] Failed to process deposit:", error);
    throw error;
  }
}

/**
 * Calculate and credit interest for a wallet
 */
export async function calculateAndCreditInterest(walletId: number): Promise<{ credited: boolean; amount: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const wallet = await db.select()
      .from(customerWallets)
      .where(eq(customerWallets.id, walletId))
      .limit(1);

    if (!wallet[0] || !wallet[0].qualifiesForInterest) {
      return { credited: false, amount: 0 };
    }

    const balance = parseFloat(wallet[0].balance || "0");
    if (balance <= 0) {
      return { credited: false, amount: 0 };
    }

    const lastCalculation = wallet[0].lastInterestCalculation || wallet[0].firstDepositDate;
    if (!lastCalculation) {
      return { credited: false, amount: 0 };
    }

    const now = new Date();
    const daysSinceLastCalculation = Math.floor(
      (now.getTime() - lastCalculation.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastCalculation < 1) {
      return { credited: false, amount: 0 };
    }

    // Calculate daily interest (7% annual = 0.07/365 per day)
    const dailyRate = 0.07 / 365;
    const interestAmount = balance * dailyRate * daysSinceLastCalculation;
    const roundedInterest = Math.round(interestAmount * 100) / 100;

    if (roundedInterest < 0.01) {
      return { credited: false, amount: 0 };
    }

    // Credit interest to bonus balance
    const currentBonusBalance = parseFloat(wallet[0].bonusBalance || "0");
    const newBonusBalance = currentBonusBalance + roundedInterest;

    // Update wallet
    await db.update(customerWallets)
      .set({
        bonusBalance: newBonusBalance.toFixed(2),
        lastInterestCalculation: now,
        updatedAt: now,
      })
      .where(eq(customerWallets.id, walletId));

    // Create interest calculation record
    await db.insert(interestCalculations).values({
      walletId,
      userId: wallet[0].userId,
      principalAmount: balance.toFixed(2),
      interestRate: "7.00",
      interestAmount: roundedInterest.toFixed(2),
      periodStart: lastCalculation,
      periodEnd: now,
      daysInPeriod: daysSinceLastCalculation,
      status: "credited",
    });

    // Create transaction record
    await db.insert(walletTransactions).values({
      walletId,
      userId: wallet[0].userId,
      type: "interest_credit",
      amount: roundedInterest.toFixed(2),
      balanceAfter: wallet[0].balance,
      bonusBalanceAfter: newBonusBalance.toFixed(2),
      status: "completed",
      description: `Zinsgutschrift für ${daysSinceLastCalculation} Tage (7% p.a.)`,
    });

    return { credited: true, amount: roundedInterest };
  } catch (error) {
    console.error("[Database] Failed to calculate and credit interest:", error);
    throw error;
  }
}

/**
 * Use wallet balance for purchase
 */
export async function useWalletForPurchase(
  userId: number,
  amount: number,
  orderId?: number,
  description?: string
): Promise<{ success: boolean; mainUsed: number; bonusUsed: number; transactionId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, mainUsed: 0, bonusUsed: 0, error: "Database not available" };

  try {
    // Get wallet by userId
    const wallet = await db.select()
      .from(customerWallets)
      .where(eq(customerWallets.userId, userId))
      .limit(1);

    if (!wallet[0]) {
      return { success: false, mainUsed: 0, bonusUsed: 0, error: "Wallet not found" };
    }

    const walletId = wallet[0].id;
    const mainBalance = parseFloat(wallet[0].balance || "0");
    const bonusBalance = parseFloat(wallet[0].bonusBalance || "0");
    const totalAvailable = mainBalance + bonusBalance;

    if (totalAvailable < amount) {
      return { success: false, mainUsed: 0, bonusUsed: 0, error: "Nicht genügend Guthaben" };
    }

    // Use bonus balance first, then main balance
    let bonusUsed = 0;
    let mainUsed = 0;

    if (bonusBalance >= amount) {
      bonusUsed = amount;
    } else {
      bonusUsed = bonusBalance;
      mainUsed = amount - bonusBalance;
    }

    const newMainBalance = mainBalance - mainUsed;
    const newBonusBalance = bonusBalance - bonusUsed;

    // Update wallet
    await db.update(customerWallets)
      .set({
        balance: newMainBalance.toFixed(2),
        bonusBalance: newBonusBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(customerWallets.id, walletId));

    let lastTransactionId: number | undefined;

    // Create transaction record for main balance usage
    if (mainUsed > 0) {
      const result = await db.insert(walletTransactions).values({
        walletId,
        userId,
        type: "purchase",
        amount: mainUsed.toFixed(2),
        balanceAfter: newMainBalance.toFixed(2),
        bonusBalanceAfter: newBonusBalance.toFixed(2),
        orderId,
        status: "completed",
        description,
      });
      lastTransactionId = Number(result[0].insertId);
    }

    // Create transaction record for bonus balance usage
    if (bonusUsed > 0) {
      const result = await db.insert(walletTransactions).values({
        walletId,
        userId,
        type: "bonus_used",
        amount: bonusUsed.toFixed(2),
        balanceAfter: newMainBalance.toFixed(2),
        bonusBalanceAfter: newBonusBalance.toFixed(2),
        orderId,
        status: "completed",
        description: `Bonus-Guthaben verwendet: ${description}`,
      });
      lastTransactionId = Number(result[0].insertId);
    }
    
    return { success: true, mainUsed, bonusUsed, transactionId: lastTransactionId };
  } catch (error: any) {
    console.error("[Database] Failed to use wallet for purchase:", error);
    return { success: false, mainUsed: 0, bonusUsed: 0, error: error.message };
  }
}


// ============================================
// PURCHASE CONTRACTS
// ============================================

/**
 * Generate unique contract number
 */
export function generateContractNumber(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AMG-${dateStr}-${random}`;
}

/**
 * Create a new purchase contract
 */
export async function createPurchaseContract(contract: Omit<InsertPurchaseContract, 'contractNumber'>): Promise<{ contractId: number; contractNumber: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const contractNumber = generateContractNumber();
    const result = await db.insert(purchaseContracts).values({
      ...contract,
      contractNumber,
    });
    const contractId = Number(result[0].insertId);
    
    // Create status history entry
    await db.insert(contractStatusHistory).values({
      contractId,
      toStatus: contract.status || "draft",
      changedBy: contract.userId,
      reason: "Vertrag erstellt",
    });
    
    return { contractId, contractNumber };
  } catch (error) {
    console.error("[Database] Failed to create purchase contract:", error);
    throw error;
  }
}

/**
 * Get purchase contract by ID
 */
export async function getPurchaseContractById(id: number): Promise<PurchaseContract | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select()
      .from(purchaseContracts)
      .where(eq(purchaseContracts.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get purchase contract:", error);
    return null;
  }
}

/**
 * Get purchase contract by contract number
 */
export async function getPurchaseContractByNumber(contractNumber: string): Promise<PurchaseContract | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select()
      .from(purchaseContracts)
      .where(eq(purchaseContracts.contractNumber, contractNumber))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get purchase contract by number:", error);
    return null;
  }
}

/**
 * Get all purchase contracts for a user
 */
export async function getPurchaseContractsByUserId(userId: number): Promise<PurchaseContract[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(purchaseContracts)
      .where(eq(purchaseContracts.userId, userId))
      .orderBy(desc(purchaseContracts.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get purchase contracts by user:", error);
    return [];
  }
}

/**
 * Get all purchase contracts (admin)
 */
export async function getAllPurchaseContracts(): Promise<PurchaseContract[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(purchaseContracts)
      .orderBy(desc(purchaseContracts.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all purchase contracts:", error);
    return [];
  }
}

/**
 * Update purchase contract
 */
export async function updatePurchaseContract(
  id: number, 
  updates: Partial<InsertPurchaseContract>,
  changedBy?: number,
  reason?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get current contract for status history
    const current = await getPurchaseContractById(id);
    
    await db.update(purchaseContracts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(purchaseContracts.id, id));
    
    // If status changed, create history entry
    if (updates.status && current && updates.status !== current.status) {
      await db.insert(contractStatusHistory).values({
        contractId: id,
        fromStatus: current.status,
        toStatus: updates.status,
        changedBy,
        reason,
      });
    }
    
    return true;
  } catch (error) {
    console.error("[Database] Failed to update purchase contract:", error);
    return false;
  }
}

/**
 * Sign contract (buyer)
 */
export async function signContractBuyer(
  id: number,
  signature: string,
  ipAddress: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const now = new Date();
    const withdrawalDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    
    await db.update(purchaseContracts)
      .set({
        buyerSignature: signature,
        buyerSignedAt: now,
        buyerSignedIp: ipAddress,
        status: "pending_payment",
        withdrawalDeadline,
        updatedAt: now,
      })
      .where(eq(purchaseContracts.id, id));
    
    // Create status history
    await db.insert(contractStatusHistory).values({
      contractId: id,
      fromStatus: "draft",
      toStatus: "pending_payment",
      reason: "Käufer hat unterschrieben",
      ipAddress,
    });
    
    return true;
  } catch (error) {
    console.error("[Database] Failed to sign contract:", error);
    return false;
  }
}

/**
 * Sign contract (seller/admin)
 */
export async function signContractSeller(
  id: number,
  signature: string,
  adminUserId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(purchaseContracts)
      .set({
        sellerSignature: signature,
        sellerSignedAt: new Date(),
        sellerSignedBy: adminUserId,
        updatedAt: new Date(),
      })
      .where(eq(purchaseContracts.id, id));
    
    return true;
  } catch (error) {
    console.error("[Database] Failed to sign contract (seller):", error);
    return false;
  }
}

/**
 * Process contract payment (from wallet)
 */
export async function processContractPayment(
  contractId: number,
  transactionId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const contract = await getPurchaseContractById(contractId);
    if (!contract) return false;
    
    await db.update(purchaseContracts)
      .set({
        status: "active",
        downPaymentPaidAt: new Date(),
        downPaymentTransactionId: transactionId,
        updatedAt: new Date(),
      })
      .where(eq(purchaseContracts.id, contractId));
    
    // Create status history
    await db.insert(contractStatusHistory).values({
      contractId,
      fromStatus: "pending_payment",
      toStatus: "active",
      reason: "Anzahlung erhalten",
    });
    
    return true;
  } catch (error) {
    console.error("[Database] Failed to process contract payment:", error);
    return false;
  }
}

/**
 * Request withdrawal (within 14 days)
 */
export async function requestContractWithdrawal(
  contractId: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const contract = await getPurchaseContractById(contractId);
    if (!contract) {
      return { success: false, error: "Vertrag nicht gefunden" };
    }
    
    // Check if withdrawal is still allowed
    if (contract.withdrawalDeadline && new Date() > contract.withdrawalDeadline) {
      return { success: false, error: "Widerrufsfrist abgelaufen" };
    }
    
    if (contract.status !== "active" && contract.status !== "pending_payment") {
      return { success: false, error: "Widerruf nicht möglich für diesen Vertragsstatus" };
    }
    
    await db.update(purchaseContracts)
      .set({
        status: "withdrawal",
        withdrawalRequestedAt: new Date(),
        withdrawalReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(purchaseContracts.id, contractId));
    
    // Create status history
    await db.insert(contractStatusHistory).values({
      contractId,
      fromStatus: contract.status,
      toStatus: "withdrawal",
      reason: `Widerruf: ${reason}`,
    });
    
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to request withdrawal:", error);
    return { success: false, error: "Fehler beim Widerruf" };
  }
}

/**
 * Get contract status history
 */
export async function getContractStatusHistory(contractId: number): Promise<ContractStatusHistory[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(contractStatusHistory)
      .where(eq(contractStatusHistory.contractId, contractId))
      .orderBy(desc(contractStatusHistory.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get contract status history:", error);
    return [];
  }
}

/**
 * Add document to contract
 */
export async function addContractDocument(document: InsertContractDocument): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(contractDocuments).values(document);
    return Number(result[0].insertId);
  } catch (error) {
    console.error("[Database] Failed to add contract document:", error);
    throw error;
  }
}

/**
 * Get contract documents
 */
export async function getContractDocuments(contractId: number): Promise<ContractDocument[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(contractDocuments)
      .where(eq(contractDocuments.contractId, contractId))
      .orderBy(desc(contractDocuments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get contract documents:", error);
    return [];
  }
}

/**
 * Delete contract document
 */
export async function deleteContractDocument(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(contractDocuments).where(eq(contractDocuments.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete contract document:", error);
    return false;
  }
}

/**
 * Get contracts by property ID
 */
export async function getContractsByPropertyId(propertyId: number): Promise<PurchaseContract[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(purchaseContracts)
      .where(eq(purchaseContracts.propertyId, propertyId))
      .orderBy(desc(purchaseContracts.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get contracts by property:", error);
    return [];
  }
}

/**
 * Update contract PDF
 */
export async function updateContractPdf(
  contractId: number,
  pdfUrl: string,
  pdfKey: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(purchaseContracts)
      .set({
        contractPdfUrl: pdfUrl,
        contractPdfKey: pdfKey,
        updatedAt: new Date(),
      })
      .where(eq(purchaseContracts.id, contractId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update contract PDF:", error);
    return false;
  }
}


// ==================== PROPERTY DRAFTS (AI Import) ====================

/**
 * Create a new property draft
 */
export async function createPropertyDraft(draft: InsertPropertyDraft): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(propertyDrafts).values(draft);
    return Number(result[0].insertId);
  } catch (error) {
    console.error("[Database] Failed to create property draft:", error);
    throw error;
  }
}

/**
 * Get all property drafts
 */
export async function getAllPropertyDrafts(): Promise<PropertyDraft[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(propertyDrafts)
      .orderBy(desc(propertyDrafts.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get property drafts:", error);
    return [];
  }
}

/**
 * Get property drafts by status
 */
export async function getPropertyDraftsByStatus(status: string): Promise<PropertyDraft[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(propertyDrafts)
      .where(eq(propertyDrafts.status, status as any))
      .orderBy(desc(propertyDrafts.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get property drafts by status:", error);
    return [];
  }
}

/**
 * Get property draft by ID
 */
export async function getPropertyDraftById(id: number): Promise<PropertyDraft | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select()
      .from(propertyDrafts)
      .where(eq(propertyDrafts.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get property draft:", error);
    return null;
  }
}

/**
 * Update property draft
 */
export async function updatePropertyDraft(
  id: number,
  updates: Partial<InsertPropertyDraft>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(propertyDrafts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(propertyDrafts.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update property draft:", error);
    return false;
  }
}

/**
 * Delete property draft
 */
export async function deletePropertyDraft(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(propertyDrafts).where(eq(propertyDrafts.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete property draft:", error);
    return false;
  }
}

/**
 * Approve property draft and create property
 */
export async function approvePropertyDraft(
  draftId: number,
  reviewedBy: number
): Promise<{ success: boolean; propertyId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const draft = await getPropertyDraftById(draftId);
    if (!draft) {
      return { success: false, error: "Entwurf nicht gefunden" };
    }

    if (draft.status !== "pending_review") {
      return { success: false, error: "Entwurf ist nicht zur Prüfung freigegeben" };
    }

    // Create property from draft
    const propertyData: InsertProperty = {
      title: draft.title || "Neue Immobilie",
      description: draft.description || "",
      longDescription: draft.longDescription,
      location: draft.location || "",
      city: draft.city || "",
      latitude: draft.latitude,
      longitude: draft.longitude,
      price: draft.sellingPrice || draft.originalPrice || "0",
      pricePerSqm: draft.pricePerSqm,
      area: draft.area || "0",
      bedrooms: draft.bedrooms || 0,
      bathrooms: draft.bathrooms || 0,
      yearBuilt: draft.yearBuilt,
      propertyType: draft.propertyType,
      constructionStatus: draft.constructionStatus || "planning",
      completionDate: draft.completionDate,
      mainImage: draft.mainImage,
      images: draft.images || "[]",
      videos: draft.videos,
      features: draft.features,
      amenities: draft.amenities,
      expectedReturn: draft.expectedReturn,
      rentalGuarantee: draft.rentalGuarantee,
      rentalGuaranteePercent: draft.rentalGuaranteePercent,
      rentalGuaranteeDuration: draft.rentalGuaranteeDuration,
      installmentAvailable: draft.installmentAvailable,
      minDownPayment: draft.minDownPayment,
      maxInstallmentMonths: draft.maxInstallmentMonths,
      installmentInterestRate: draft.installmentInterestRate,
      status: "available",
      isFeatured: false,
    };

    const result = await db.insert(properties).values(propertyData);
    const propertyId = Number(result[0].insertId);

    // Update draft status
    await db.update(propertyDrafts)
      .set({
        status: "approved",
        approvedPropertyId: propertyId,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(propertyDrafts.id, draftId));

    return { success: true, propertyId };
  } catch (error) {
    console.error("[Database] Failed to approve property draft:", error);
    return { success: false, error: "Fehler bei der Genehmigung" };
  }
}

/**
 * Reject property draft
 */
export async function rejectPropertyDraft(
  draftId: number,
  reviewedBy: number,
  reason: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(propertyDrafts)
      .set({
        status: "rejected",
        rejectionReason: reason,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(propertyDrafts.id, draftId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to reject property draft:", error);
    return false;
  }
}
