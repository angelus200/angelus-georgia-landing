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
  updatePaymentStatus,
  // CRM functions
  createLead,
  getAllLeads,
  getLeadsByStage,
  getLeadById,
  updateLead,
  updateLeadStage,
  deleteLead,
  convertInquiryToLead,
  createLeadActivity,
  getLeadActivities,
  getRecentActivities,
  createCrmTask,
  getLeadTasks,
  getPendingTasks,
  updateTaskStatus,
  deleteCrmTask,
  getCrmStats,
  getLeadDocuments,
  createLeadDocument,
  deleteLeadDocument,
  getLeadDocumentById,
  // Video functions
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getFeaturedVideos,
  // Wallet functions
  getOrCreateWallet,
  getWalletByUserId,
  updateWalletBalance,
  createWalletTransaction,
  getWalletTransactions,
  getWalletTransactionsByUserId,
  createDepositRequest,
  getDepositRequestsByUserId,
  getPendingDepositRequests,
  getAllDepositRequests,
  updateDepositRequestStatus,
  getDepositRequestById,
  processDeposit,
  calculateAndCreditInterest,
  useWalletForPurchase,
  getAllWallets,
  getWalletsQualifyingForInterest,
  getInterestCalculationsByWalletId
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
import { sendPasswordResetEmail, sendEmailVerification, sendWelcomeEmail, sendDepositConfirmationEmail, sendDepositRejectionEmail, sendInterestCreditEmail } from "./email";
import crypto from "crypto";

// Helper function to parse CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted field
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted field
        inQuotes = true;
      } else if (char === ',' || char === ';') {
        // Field separator (support both comma and semicolon)
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  // Don't forget the last field
  result.push(current.trim());
  
  return result;
}

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
          // Extended profile fields
          firstName: z.string().min(1, "Vorname erforderlich").optional(),
          lastName: z.string().min(1, "Nachname erforderlich").optional(),
          phone: z.string().min(5, "Telefonnummer erforderlich").optional(),
          street: z.string().min(3, "Straße erforderlich").optional(),
          city: z.string().min(2, "Stadt erforderlich").optional(),
          postalCode: z.string().min(3, "Postleitzahl erforderlich").optional(),
          country: z.string().min(2, "Land erforderlich").optional(),
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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Check if profile is complete
        const profileComplete = !!(input.firstName && input.lastName && input.phone && 
                                   input.street && input.city && input.postalCode && input.country);

        // Create user with all profile data
        await db.insert(users).values({
          name: input.name,
          email: input.email,
          passwordHash,
          loginMethod: "local",
          role: input.role || "user",
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          street: input.street,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country,
          profileComplete,
          verificationToken,
          verificationTokenExpiry,
          emailVerified: false,
        });

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

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihren Posteingang.");
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
          propertyType: z.enum(["apartment", "house", "villa", "commercial", "land"]).optional(),
          constructionStatus: z.enum(["planning", "foundation", "structure", "finishing", "completed"]),
          completionDate: z.string().optional(),
          yearBuilt: z.number().nullable().optional(),
          mainImage: z.string(),
          images: z.string().optional(),
          videos: z.string().optional(),
          features: z.string().optional(),
          expectedReturn: z.string().optional(),
          // Mietgarantie
          rentalGuarantee: z.boolean().optional(),
          rentalGuaranteePercent: z.string().nullable().optional(),
          rentalGuaranteeDuration: z.number().nullable().optional(),
          // Ratenzahlung
          installmentAvailable: z.boolean().optional(),
          minDownPayment: z.string().nullable().optional(),
          maxInstallmentMonths: z.number().nullable().optional(),
          installmentInterestRate: z.string().nullable().optional(),
          status: z.enum(["available", "reserved", "sold"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createProperty({
          ...input,
          images: input.images || '[]',
          completionDate: input.completionDate ? new Date(input.completionDate) : null,
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
            location: z.string().optional(),
            city: z.string().optional(),
            price: z.string().optional(),
            area: z.string().optional(),
            bedrooms: z.number().optional(),
            bathrooms: z.number().optional(),
            propertyType: z.enum(["apartment", "house", "villa", "commercial", "land"]).optional(),
            constructionStatus: z.enum(["planning", "foundation", "structure", "finishing", "completed"]).optional(),
            completionDate: z.string().nullable().optional(),
            yearBuilt: z.number().nullable().optional(),
            mainImage: z.string().optional(),
            images: z.string().optional(),
            videos: z.string().optional(),
            features: z.string().optional(),
            expectedReturn: z.string().optional(),
            rentalGuarantee: z.boolean().optional(),
            rentalGuaranteePercent: z.string().nullable().optional(),
            rentalGuaranteeDuration: z.number().nullable().optional(),
            installmentAvailable: z.boolean().optional(),
            minDownPayment: z.string().nullable().optional(),
            maxInstallmentMonths: z.number().nullable().optional(),
            installmentInterestRate: z.string().nullable().optional(),
            status: z.enum(["available", "reserved", "sold"]).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = { ...input.data };
        if (updateData.completionDate !== undefined) {
          updateData.completionDate = updateData.completionDate ? new Date(updateData.completionDate) : null;
        }
        await updateProperty(input.id, updateData);
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

  // CRM Router
  crm: router({
    // Lead Management
    leads: router({
      list: protectedProcedure.query(async () => {
        return await getAllLeads();
      }),
      byStage: protectedProcedure
        .input(z.object({ stage: z.string() }))
        .query(async ({ input }) => {
          return await getLeadsByStage(input.stage);
        }),
      get: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return await getLeadById(input.id);
        }),
      create: protectedProcedure
        .input(z.object({
          source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'event', 'other']).optional(),
          stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
          priority: z.enum(['cold', 'warm', 'hot']).optional(),
          firstName: z.string().min(1),
          lastName: z.string().optional(),
          email: z.string().email(),
          phone: z.string().optional(),
          company: z.string().optional(),
          country: z.string().optional(),
          city: z.string().optional(),
          budgetMin: z.string().optional(),
          budgetMax: z.string().optional(),
          interestedPropertyTypes: z.string().optional(),
          interestedCities: z.string().optional(),
          timeline: z.enum(['immediate', '1_3_months', '3_6_months', '6_12_months', 'over_12_months']).optional(),
          expectedValue: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const leadId = await createLead(input as any);
          return { success: true, leadId };
        }),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'event', 'other']).optional(),
            stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional(),
            priority: z.enum(['cold', 'warm', 'hot']).optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            company: z.string().optional(),
            country: z.string().optional(),
            city: z.string().optional(),
            budgetMin: z.string().optional(),
            budgetMax: z.string().optional(),
            interestedPropertyTypes: z.string().optional(),
            interestedCities: z.string().optional(),
            timeline: z.enum(['immediate', '1_3_months', '3_6_months', '6_12_months', 'over_12_months']).optional(),
            expectedValue: z.string().optional(),
            probability: z.number().optional(),
            nextFollowUpDate: z.string().optional(),
            lostReason: z.string().optional(),
            notes: z.string().optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          const data = { ...input.data } as any;
          if (data.nextFollowUpDate) {
            data.nextFollowUpDate = new Date(data.nextFollowUpDate);
          }
          await updateLead(input.id, data);
          return { success: true };
        }),
      updateStage: protectedProcedure
        .input(z.object({
          id: z.number(),
          newStage: z.string(),
          oldStage: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
          await updateLeadStage(input.id, input.newStage, input.oldStage, ctx.user?.id);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await deleteLead(input.id);
          return { success: true };
        }),
      convertFromInquiry: protectedProcedure
        .input(z.object({ inquiryId: z.number() }))
        .mutation(async ({ input }) => {
          const leadId = await convertInquiryToLead(input.inquiryId);
          return { success: true, leadId };
        }),
    }),

    // Activity Management
    activities: router({
      list: protectedProcedure
        .input(z.object({ leadId: z.number() }))
        .query(async ({ input }) => {
          return await getLeadActivities(input.leadId);
        }),
      recent: protectedProcedure
        .input(z.object({ limit: z.number().optional() }))
        .query(async ({ input }) => {
          return await getRecentActivities(input.limit || 50);
        }),
      create: protectedProcedure
        .input(z.object({
          leadId: z.number(),
          type: z.enum(['note', 'call', 'email', 'meeting', 'task', 'stage_change', 'property_view', 'document', 'other']),
          title: z.string().min(1),
          description: z.string().optional(),
          callDuration: z.number().optional(),
          callOutcome: z.enum(['answered', 'no_answer', 'voicemail', 'busy', 'wrong_number']).optional(),
          emailSubject: z.string().optional(),
          meetingLocation: z.string().optional(),
          meetingTime: z.string().optional(),
          propertyId: z.number().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const data = { ...input } as any;
          if (data.meetingTime) {
            data.meetingTime = new Date(data.meetingTime);
          }
          data.createdBy = ctx.user?.id;
          const activityId = await createLeadActivity(data);
          return { success: true, activityId };
        }),
    }),

    // Task Management
    tasks: router({
      list: protectedProcedure
        .input(z.object({ leadId: z.number() }))
        .query(async ({ input }) => {
          return await getLeadTasks(input.leadId);
        }),
      pending: protectedProcedure.query(async () => {
        return await getPendingTasks();
      }),
      create: protectedProcedure
        .input(z.object({
          leadId: z.number().optional(),
          type: z.enum(['follow_up', 'call', 'email', 'meeting', 'document', 'other']).optional(),
          title: z.string().min(1),
          description: z.string().optional(),
          dueDate: z.string(),
          priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const taskId = await createCrmTask({
            ...input,
            dueDate: new Date(input.dueDate),
            createdBy: ctx.user?.id,
            assignedTo: ctx.user?.id,
          } as any);
          return { success: true, taskId };
        }),
      updateStatus: protectedProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
        }))
        .mutation(async ({ input }) => {
          await updateTaskStatus(input.id, input.status);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await deleteCrmTask(input.id);
          return { success: true };
        }),
    }),

    // Statistics
    stats: protectedProcedure.query(async () => {
      return await getCrmStats();
    }),

    // Document Management
    documents: router({
      list: protectedProcedure
        .input(z.object({ leadId: z.number() }))
        .query(async ({ input }) => {
          return await getLeadDocuments(input.leadId);
        }),
      get: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return await getLeadDocumentById(input.id);
        }),
      upload: protectedProcedure
        .input(z.object({
          leadId: z.number(),
          name: z.string().min(1),
          type: z.enum(['contract', 'id_document', 'proof_of_funds', 'correspondence', 'proposal', 'other']).optional(),
          fileData: z.string(), // Base64 encoded file data
          fileName: z.string(),
          mimeType: z.string(),
          fileSize: z.number(),
        }))
        .mutation(async ({ input, ctx }) => {
          const { storagePut } = await import('./storage');
          
          // Decode base64 file data
          const fileBuffer = Buffer.from(input.fileData, 'base64');
          
          // Generate unique file key
          const timestamp = Date.now();
          const sanitizedName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const s3Key = `crm/leads/${input.leadId}/documents/${timestamp}_${sanitizedName}`;
          
          // Upload to S3
          const { url } = await storagePut(s3Key, fileBuffer, input.mimeType);
          
          // Save document record
          const docId = await createLeadDocument({
            leadId: input.leadId,
            name: input.name,
            type: input.type || 'other',
            url,
            s3Key,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
            uploadedBy: ctx.user?.id,
          });
          
          // Log activity
          await createLeadActivity({
            leadId: input.leadId,
            type: 'document',
            title: 'Dokument hochgeladen',
            description: `Dokument "${input.name}" wurde hinzugefügt`,
            attachmentUrl: url,
            createdBy: ctx.user?.id,
          });
          
          return { success: true, documentId: docId, url };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const doc = await deleteLeadDocument(input.id);
          
          // Log activity
          if (doc.leadId) {
            await createLeadActivity({
              leadId: doc.leadId,
              type: 'document',
              title: 'Dokument gelöscht',
              description: `Dokument "${doc.name}" wurde entfernt`,
              createdBy: ctx.user?.id,
            });
          }
          
          return { success: true };
        }),
    }),

    // CSV Import
    import: router({
      csv: protectedProcedure
        .input(z.object({
          csvData: z.string(), // Base64 encoded CSV
          mapping: z.object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string(),
            phone: z.string().optional(),
            company: z.string().optional(),
            country: z.string().optional(),
            city: z.string().optional(),
            budgetMin: z.string().optional(),
            budgetMax: z.string().optional(),
            notes: z.string().optional(),
            source: z.string().optional(),
          }),
          defaultSource: z.enum(['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'event', 'other']).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          // Decode CSV
          const csvContent = Buffer.from(input.csvData, 'base64').toString('utf-8');
          
          // Parse CSV
          const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error('CSV muss mindestens eine Kopfzeile und eine Datenzeile enthalten');
          }
          
          // Parse header
          const headers = parseCSVLine(lines[0]);
          
          // Parse data rows
          const results = {
            success: 0,
            failed: 0,
            errors: [] as { row: number; error: string }[],
          };
          
          for (let i = 1; i < lines.length; i++) {
            try {
              const values = parseCSVLine(lines[i]);
              const rowData: Record<string, string> = {};
              
              headers.forEach((header, index) => {
                rowData[header] = values[index] || '';
              });
              
              // Map columns to lead fields
              const leadData: any = {
                source: input.defaultSource || 'other',
                stage: 'new',
                priority: 'warm',
              };
              
              // Apply mapping
              if (input.mapping.firstName && rowData[input.mapping.firstName]) {
                leadData.firstName = rowData[input.mapping.firstName].trim();
              }
              if (input.mapping.lastName && rowData[input.mapping.lastName]) {
                leadData.lastName = rowData[input.mapping.lastName].trim();
              }
              if (input.mapping.email && rowData[input.mapping.email]) {
                leadData.email = rowData[input.mapping.email].trim().toLowerCase();
              }
              if (input.mapping.phone && rowData[input.mapping.phone]) {
                leadData.phone = rowData[input.mapping.phone].trim();
              }
              if (input.mapping.company && rowData[input.mapping.company]) {
                leadData.company = rowData[input.mapping.company].trim();
              }
              if (input.mapping.country && rowData[input.mapping.country]) {
                leadData.country = rowData[input.mapping.country].trim();
              }
              if (input.mapping.city && rowData[input.mapping.city]) {
                leadData.city = rowData[input.mapping.city].trim();
              }
              if (input.mapping.budgetMin && rowData[input.mapping.budgetMin]) {
                leadData.budgetMin = rowData[input.mapping.budgetMin].replace(/[^0-9.]/g, '');
              }
              if (input.mapping.budgetMax && rowData[input.mapping.budgetMax]) {
                leadData.budgetMax = rowData[input.mapping.budgetMax].replace(/[^0-9.]/g, '');
              }
              if (input.mapping.notes && rowData[input.mapping.notes]) {
                leadData.notes = rowData[input.mapping.notes].trim();
              }
              if (input.mapping.source && rowData[input.mapping.source]) {
                const sourceValue = rowData[input.mapping.source].trim().toLowerCase();
                const validSources = ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'event', 'other'];
                if (validSources.includes(sourceValue)) {
                  leadData.source = sourceValue;
                }
              }
              
              // Validate required fields
              if (!leadData.email) {
                throw new Error('E-Mail ist erforderlich');
              }
              if (!leadData.firstName) {
                // Try to extract from email
                leadData.firstName = leadData.email.split('@')[0];
              }
              
              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(leadData.email)) {
                throw new Error('Ungültige E-Mail-Adresse');
              }
              
              // Create lead
              await createLead(leadData);
              results.success++;
              
            } catch (error: any) {
              results.failed++;
              results.errors.push({
                row: i + 1,
                error: error.message || 'Unbekannter Fehler',
              });
            }
          }
          
          return results;
        }),
      
      preview: protectedProcedure
        .input(z.object({
          csvData: z.string(), // Base64 encoded CSV
        }))
        .mutation(async ({ input }) => {
          // Decode CSV
          const csvContent = Buffer.from(input.csvData, 'base64').toString('utf-8');
          
          // Parse CSV
          const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
          if (lines.length < 1) {
            throw new Error('CSV ist leer');
          }
          
          // Parse header
          const headers = parseCSVLine(lines[0]);
          
          // Parse first few rows for preview
          const previewRows: Record<string, string>[] = [];
          for (let i = 1; i < Math.min(lines.length, 6); i++) {
            const values = parseCSVLine(lines[i]);
            const rowData: Record<string, string> = {};
            headers.forEach((header, index) => {
              rowData[header] = values[index] || '';
            });
            previewRows.push(rowData);
          }
          
          return {
            headers,
            previewRows,
            totalRows: lines.length - 1,
          };
        }),
    }),
  }),

  // ==================== WALLET ROUTER ====================
  wallet: router({
    // Get or create wallet for current user
    get: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      const wallet = await getOrCreateWallet(ctx.user.id);
      if (!wallet) {
        throw new Error("Failed to get or create wallet");
      }
      
      // Calculate any pending interest
      if (wallet.qualifiesForInterest) {
        await calculateAndCreditInterest(wallet.id);
        // Refetch wallet with updated bonus
        return await getWalletByUserId(ctx.user.id);
      }
      
      return wallet;
    }),

    // Get wallet transactions
    getTransactions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error("User not authenticated");
        }
        return await getWalletTransactionsByUserId(ctx.user.id, input?.limit || 50);
      }),

    // Create deposit request
    createDepositRequest: protectedProcedure
      .input(z.object({
        amount: z.number().min(100, "Mindesteinzahlung: 100€"),
        method: z.enum(["bank_transfer", "crypto_btc", "crypto_eth", "crypto_usdt", "crypto_other"]),
        cryptoCurrency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error("User not authenticated");
        }
        
        const wallet = await getOrCreateWallet(ctx.user.id);
        if (!wallet) {
          throw new Error("Failed to get wallet");
        }

        // Set expiration time (24 hours for crypto, 7 days for bank)
        const expiresAt = new Date();
        if (input.method === "bank_transfer") {
          expiresAt.setDate(expiresAt.getDate() + 7);
        } else {
          expiresAt.setHours(expiresAt.getHours() + 24);
        }

        const requestId = await createDepositRequest({
          walletId: wallet.id,
          userId: ctx.user.id,
          amount: input.amount.toFixed(2),
          method: input.method,
          cryptoCurrency: input.cryptoCurrency,
          status: "pending",
          expiresAt,
          notes: input.notes,
        });

        return { requestId, expiresAt };
      }),

    // Get user's deposit requests
    getDepositRequests: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      return await getDepositRequestsByUserId(ctx.user.id);
    }),

    // Get interest calculations
    getInterestHistory: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      const wallet = await getWalletByUserId(ctx.user.id);
      if (!wallet) {
        return [];
      }
      return await getInterestCalculationsByWalletId(wallet.id);
    }),
  }),

  // Admin Wallet Router
  adminWallet: router({
    // Get all wallets
    getAllWallets: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }
      return await getAllWallets();
    }),

    // Get all deposit requests
    getAllDepositRequests: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }
      return await getAllDepositRequests();
    }),

    // Get pending deposit requests
    getPendingDepositRequests: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }
      return await getPendingDepositRequests();
    }),

    // Approve deposit request
    approveDeposit: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        bankReference: z.string().optional(),
        txHash: z.string().optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Admin access required");
        }

        const request = await getDepositRequestById(input.requestId);
        if (!request) {
          throw new Error("Deposit request not found");
        }

        if (request.status !== "pending" && request.status !== "awaiting_payment" && request.status !== "payment_received") {
          throw new Error("Deposit request cannot be approved in current status");
        }

        // Process the deposit
        const result = await processDeposit(
          request.walletId,
          request.userId,
          parseFloat(request.amount),
          request.method as any,
          {
            bankReference: input.bankReference,
            txHash: input.txHash,
            description: `Einzahlung genehmigt (Anfrage #${request.id})`,
          }
        );

        // Update request status
        await updateDepositRequestStatus(input.requestId, "completed", {
          adminNotes: input.adminNotes,
          processedBy: ctx.user.id,
          processedAt: new Date(),
        });

        // Send email notification
        try {
          await sendDepositConfirmationEmail(
            request.userId,
            parseFloat(request.amount),
            request.method,
            result.newBalance
          );
        } catch (emailError) {
          console.error("Failed to send deposit confirmation email:", emailError);
        }

        return result;
      }),

    // Reject deposit request
    rejectDeposit: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Admin access required");
        }

        const request = await getDepositRequestById(input.requestId);
        if (!request) {
          throw new Error("Deposit request not found");
        }

        await updateDepositRequestStatus(input.requestId, "cancelled", {
          adminNotes: input.reason,
          processedBy: ctx.user.id,
          processedAt: new Date(),
        });

        // Send email notification
        try {
          await sendDepositRejectionEmail(
            request.userId,
            parseFloat(request.amount),
            input.reason
          );
        } catch (emailError) {
          console.error("Failed to send deposit rejection email:", emailError);
        }

        return { success: true };
      }),

    // Manual deposit (admin creates deposit directly)
    manualDeposit: protectedProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number().min(1),
        method: z.enum(["bank_transfer", "crypto_btc", "crypto_eth", "crypto_usdt", "crypto_other"]),
        bankReference: z.string().optional(),
        txHash: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Admin access required");
        }

        const wallet = await getOrCreateWallet(input.userId);
        if (!wallet) {
          throw new Error("Failed to get or create wallet");
        }

        const result = await processDeposit(
          wallet.id,
          input.userId,
          input.amount,
          input.method,
          {
            bankReference: input.bankReference,
            txHash: input.txHash,
            description: input.description || `Manuelle Einzahlung durch Admin`,
          }
        );

        return result;
      }),

    // Calculate interest for all qualifying wallets
    calculateAllInterest: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const wallets = await getWalletsQualifyingForInterest();
      let credited = 0;
      let totalAmount = 0;

      for (const wallet of wallets) {
        const result = await calculateAndCreditInterest(wallet.id);
        if (result.credited) {
          credited++;
          totalAmount += result.amount;
        }
      }

      return { walletsProcessed: wallets.length, credited, totalAmount };
    }),
  }),

  // Profile Router
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (user.length === 0) {
        throw new Error("User not found");
      }
      
      const { passwordHash, ...userWithoutPassword } = user[0];
      return userWithoutPassword;
    }),
    
    update: protectedProcedure
      .input(
        z.object({
          firstName: z.string().min(1).optional(),
          lastName: z.string().min(1).optional(),
          phone: z.string().min(5).optional(),
          street: z.string().min(3).optional(),
          city: z.string().min(2).optional(),
          postalCode: z.string().min(3).optional(),
          country: z.string().min(2).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error("User not authenticated");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(users)
          .set({
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            street: input.street,
            city: input.city,
            postalCode: input.postalCode,
            country: input.country,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),
    
    changePassword: protectedProcedure
      .input(
        z.object({
          currentPassword: z.string().min(1, "Aktuelles Passwort erforderlich"),
          newPassword: z.string().min(8, "Neues Passwort muss mindestens 8 Zeichen lang sein"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error("User not authenticated");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (user.length === 0) {
          throw new Error("User not found");
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(input.currentPassword, user[0].passwordHash || "");
        if (!isValidPassword) {
          throw new Error("Aktuelles Passwort ist falsch");
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);
        
        await db.update(users)
          .set({
            passwordHash: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true };
      }),
  }),

  // ==================== VIDEO ROUTER ====================
  videos: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await getVideos(input);
      }),

    getFeatured: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await getFeaturedVideos(input?.limit || 4);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getVideoById(input.id);
      }),

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        category: z.enum(["about_us", "properties", "georgia", "testimonials", "projects", "other"]),
        duration: z.number().optional(),
        sortOrder: z.number().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return await createVideo(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        videoUrl: z.string().url().optional(),
        thumbnailUrl: z.string().url().optional(),
        category: z.enum(["about_us", "properties", "georgia", "testimonials", "projects", "other"]).optional(),
        duration: z.number().optional(),
        sortOrder: z.number().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateVideo(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteVideo(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
