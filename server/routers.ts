import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { 
  createContactInquiry, 
  getAllContactInquiries, 
  updateContactInquiryStatus, 
  deleteContactInquiry,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  getAllServicePackages,
  createServicePackage,
  createBooking,
  getBookingsByUserId,
  getAllBookings,
  updateBookingStatus,
  createInstallmentPayments,
  getPaymentsByBookingId,
  getPaymentsByUserId,
  updatePaymentStatus
} from "./db";
import {
  servicesRouter,
  cartRouter,
  ordersRouter,
  paymentRouter,
  propertyMediaRouter,
  adminPropertiesRouter
} from "./ecommerce-routers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendPasswordResetEmail, sendEmailVerification, sendWelcomeEmail } from "./email";
import crypto from "crypto";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
          email: z.string().email("Ungültige E-Mail-Adresse"),
          password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
          role: z.enum(["user", "admin"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existingUser.length > 0) {
          throw new Error("E-Mail-Adresse bereits registriert");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create user
        await db.insert(users).values({
          name: input.name,
          email: input.email,
          passwordHash,
          loginMethod: "local",
          role: input.role || "user",
        });

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with verification token
        await db.update(users)
          .set({
            verificationToken,
            verificationTokenExpiry,
          })
          .where(eq(users.email, input.email));

        // Send verification email
        await sendEmailVerification(input.email, verificationToken);
        
        // Send welcome email
        await sendWelcomeEmail(input.email, input.name);

        return { success: true, message: "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse." };
      }),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Ungültige E-Mail-Adresse"),
          password: z.string().min(1, "Passwort erforderlich"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Find user by email
        const userResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (userResult.length === 0) {
          throw new Error("Ungültige E-Mail oder Passwort");
        }

        const user = userResult[0];

        // Check if user has a password (local auth)
        if (!user.passwordHash) {
          throw new Error("Dieser Account verwendet eine andere Anmeldemethode");
        }

        // Verify password
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Ungültige E-Mail oder Passwort");
        }

        // Update last signed in
        await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, user.openId || `local_${user.id}`, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    requestPasswordReset: publicProcedure
      .input(
        z.object({
          email: z.string().email("Ungültige E-Mail-Adresse"),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Find user by email
        const userResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (userResult.length === 0) {
          // Don't reveal if email exists or not for security
          return { success: true, message: "Wenn die E-Mail-Adresse existiert, wurde ein Reset-Link gesendet." };
        }

        const user = userResult[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Update user with reset token
        await db.update(users)
          .set({
            passwordResetToken: resetToken,
            passwordResetTokenExpiry: resetTokenExpiry,
          })
          .where(eq(users.id, user.id));

        // Send reset email
        await sendPasswordResetEmail(input.email, resetToken);

        return { success: true, message: "Wenn die E-Mail-Adresse existiert, wurde ein Reset-Link gesendet." };
      }),
    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string(),
          newPassword: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Find user by reset token
        const userResult = await db.select().from(users).where(eq(users.passwordResetToken, input.token)).limit(1);
        if (userResult.length === 0) {
          throw new Error("Ungültiger oder abgelaufener Reset-Link");
        }

        const user = userResult[0];

        // Check if token is expired
        if (!user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < new Date()) {
          throw new Error("Ungültiger oder abgelaufener Reset-Link");
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(input.newPassword, 10);

        // Update user password and clear reset token
        await db.update(users)
          .set({
            passwordHash,
            passwordResetToken: null,
            passwordResetTokenExpiry: null,
          })
          .where(eq(users.id, user.id));

        return { success: true, message: "Passwort erfolgreich zurückgesetzt" };
      }),
    verifyEmail: publicProcedure
      .input(
        z.object({
          token: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Find user by verification token
        const userResult = await db.select().from(users).where(eq(users.verificationToken, input.token)).limit(1);
        if (userResult.length === 0) {
          throw new Error("Ungültiger oder abgelaufener Verifizierungs-Link");
        }

        const user = userResult[0];

        // Check if token is expired
        if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
          throw new Error("Ungültiger oder abgelaufener Verifizierungs-Link");
        }

        // Update user email verified status and clear verification token
        await db.update(users)
          .set({
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
          })
          .where(eq(users.id, user.id));

        return { success: true, message: "E-Mail erfolgreich verifiziert" };
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name ist erforderlich"),
          email: z.string().email("Ungültige E-Mail-Adresse"),
          phone: z.string().optional(),
          message: z.string().min(10, "Nachricht muss mindestens 10 Zeichen lang sein"),
        })
      )
      .mutation(async ({ input }) => {
        await createContactInquiry({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          message: input.message,
        });

        // Notify owner about new inquiry
        await notifyOwner({
          title: "Neue Kontaktanfrage",
          content: `Name: ${input.name}\nE-Mail: ${input.email}\nTelefon: ${input.phone || "Nicht angegeben"}\n\nNachricht:\n${input.message}`,
        });

        return { success: true };
      }),
    list: publicProcedure.query(async () => {
      return await getAllContactInquiries();
    }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "contacted", "closed"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateContactInquiryStatus(input.id, input.status);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteContactInquiry(input.id);
        return { success: true };
      }),
  }),

  properties: router({
    list: publicProcedure.query(async () => {
      return await getAllProperties();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getPropertyById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          location: z.string(),
          city: z.string(),
          price: z.string(),
          area: z.string(),
          bedrooms: z.number(),
          bathrooms: z.number(),
          constructionStatus: z.enum(["planning", "foundation", "structure", "finishing", "completed"]),
          completionDate: z.string(),
          images: z.string(),
          expectedReturn: z.string().optional(),
          rentalGuarantee: z.boolean().optional(),
          installmentAvailable: z.boolean().optional(),
          minDownPayment: z.string().optional(),
          maxInstallmentMonths: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createProperty({
          ...input,
          completionDate: new Date(input.completionDate),
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            constructionStatus: z.enum(["planning", "foundation", "structure", "finishing", "completed"]).optional(),
            status: z.enum(["available", "reserved", "sold"]).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await updateProperty(input.id, input.data);
        return { success: true };
      }),
  }),

  packages: router({
    list: publicProcedure.query(async () => {
      return await getAllServicePackages();
    }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string(),
          type: z.enum(["single", "bundle"]),
          price: z.string(),
          services: z.string(), // JSON array of services
        })
      )
      .mutation(async ({ input }) => {
        await createServicePackage(input);
        return { success: true };
      }),
  }),

  bookings: router({
    create: protectedProcedure
      .input(
        z.object({
          propertyId: z.number().optional(),
          packageIds: z.string().optional(),
          totalAmount: z.string(),
          downPayment: z.string(),
          installmentMonths: z.number(),
          monthlyPayment: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) {
          throw new Error("User not authenticated");
        }

        const remainingAmount = (parseFloat(input.totalAmount) - parseFloat(input.downPayment)).toString();

        const result = await createBooking({
          userId: ctx.user.id,
          propertyId: input.propertyId || null,
          packageIds: input.packageIds || null,
          totalAmount: input.totalAmount,
          downPayment: input.downPayment,
          remainingAmount,
          paymentPlan: input.installmentMonths > 1 ? "monthly" : "full",
          installmentMonths: input.installmentMonths,
          status: "pending",
        });

        // Create installment payment schedule
        const bookingId = Number((result as any).insertId);
        const payments: any[] = [];
        const startDate = new Date();

        for (let i = 0; i < input.installmentMonths; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i + 1);

          payments.push({
            bookingId,
            installmentNumber: i + 1,
            amount: input.monthlyPayment,
            dueDate: dueDate.toISOString().split('T')[0],
            status: "pending",
          });
        }

        await createInstallmentPayments(payments);

        // Notify owner about new booking
        await notifyOwner({
          title: "Neue Buchung",
          content: `Investor: ${ctx.user.name || ctx.user.email}\nGesamtbetrag: ${input.totalAmount} €\nAnzahlung: ${input.downPayment} €\nRaten: ${input.installmentMonths} Monate`,
        });

        return { success: true, bookingId };
      }),
    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      return await getBookingsByUserId(ctx.user.id);
    }),
    getAll: protectedProcedure.query(async () => {
      return await getAllBookings();
    }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "active", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateBookingStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  payments: router({
    getByBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return await getPaymentsByBookingId(input.bookingId);
      }),
    getMyPayments: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      return await getPaymentsByUserId(ctx.user.id);
    }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "paid", "overdue", "cancelled"]),
          transactionId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const paidDate = input.status === "paid" ? new Date() : undefined;
        await updatePaymentStatus(input.id, input.status, paidDate, input.transactionId);
        return { success: true };
      }),
  }),

  // E-Commerce Routers
  services: servicesRouter,
  cart: cartRouter,
  orders: ordersRouter,
  payment: paymentRouter,
  propertyMedia: propertyMediaRouter,
  adminProperties: adminPropertiesRouter,
});

export type AppRouter = typeof appRouter;
