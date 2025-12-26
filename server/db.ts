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
  InsertInstallmentPayment
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
