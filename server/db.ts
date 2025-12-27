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
  InsertLeadDocument
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
