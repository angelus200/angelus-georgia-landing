import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  getAllServices,
  getServicesByCategory,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getOrCreateCart,
  getCartItems,
  addToCart,
  removeFromCart,
  clearCart,
  createOrder,
  createOrderItems,
  getOrderById,
  getOrderByNumber,
  getOrdersByUserId,
  getAllOrders,
  getOrderItems,
  updateOrderStatus,
  createPaymentTransaction,
  getTransactionsByOrderId,
  updateTransactionStatus,
  getActiveCryptoWallets,
  createCryptoWallet,
  updateCryptoWallet,
  getActiveBankAccounts,
  createBankAccount,
  updateBankAccount,
  getPropertyMedia,
  addPropertyMedia,
  deletePropertyMedia,
  deleteProperty,
  getAllPropertiesAdmin,
  generateOrderNumber,
} from "./db";
import { notifyOwner } from "./_core/notification";

// Services Router
export const servicesRouter = router({
  list: publicProcedure.query(async () => {
    return await getAllServices();
  }),

  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return await getServicesByCategory(input.category);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getServiceById(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        longDescription: z.string().optional(),
        category: z.enum(["company_formation", "rental_guarantee", "property_management", "legal", "tax", "other"]),
        price: z.string(),
        priceType: z.enum(["fixed", "monthly", "yearly", "percentage", "custom"]).optional(),
        percentageRate: z.string().optional(),
        durationMonths: z.number().optional(),
        includedItems: z.string().optional(),
        requirements: z.string().optional(),
        processingTimeDays: z.number().optional(),
        icon: z.string().optional(),
        isStandalone: z.boolean().optional(),
        isAddon: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createService({
        ...input,
        includedItems: input.includedItems || null,
        requirements: input.requirements || null,
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await updateService(input.id, input.data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteService(input.id);
      return { success: true };
    }),
});

// Cart Router
export const cartRouter = router({
  get: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const cart = await getOrCreateCart(ctx.user?.id, input.sessionId);
      const items = await getCartItems(cart.id);
      return { cart, items };
    }),

  addItem: publicProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        itemType: z.enum(["property", "service", "package"]),
        propertyId: z.number().optional(),
        serviceId: z.number().optional(),
        packageId: z.number().optional(),
        quantity: z.number().default(1),
        unitPrice: z.string(),
        options: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cart = await getOrCreateCart(ctx.user?.id, input.sessionId);
      await addToCart({
        cartId: cart.id,
        itemType: input.itemType,
        propertyId: input.propertyId || null,
        serviceId: input.serviceId || null,
        packageId: input.packageId || null,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        options: input.options || null,
      });
      return { success: true };
    }),

  removeItem: publicProcedure
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ input }) => {
      await removeFromCart(input.cartItemId);
      return { success: true };
    }),

  clear: publicProcedure
    .input(z.object({ sessionId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const cart = await getOrCreateCart(ctx.user?.id, input.sessionId);
      await clearCart(cart.id);
      return { success: true };
    }),
});

// Orders Router
export const ordersRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            itemType: z.enum(["property", "service", "package"]),
            propertyId: z.number().optional(),
            serviceId: z.number().optional(),
            packageId: z.number().optional(),
            itemName: z.string(),
            itemDescription: z.string().optional(),
            quantity: z.number().default(1),
            unitPrice: z.string(),
            options: z.string().optional(),
          })
        ),
        totalAmount: z.string(),
        paymentMethod: z.enum(["crypto_btc", "crypto_eth", "crypto_usdt", "bank_transfer", "card"]),
        billingAddress: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }

      const orderNumber = generateOrderNumber();

      // Create order
      const orderResult = await createOrder({
        orderNumber,
        userId: ctx.user.id,
        totalAmount: input.totalAmount,
        currency: "EUR",
        status: "awaiting_payment",
        paymentMethod: input.paymentMethod,
        billingAddress: input.billingAddress || null,
        notes: input.notes || null,
      });

      const orderId = Number((orderResult as any).insertId);

      // Create order items
      const orderItemsData = input.items.map((item) => ({
        orderId,
        itemType: item.itemType,
        propertyId: item.propertyId || null,
        serviceId: item.serviceId || null,
        packageId: item.packageId || null,
        itemName: item.itemName,
        itemDescription: item.itemDescription || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (parseFloat(item.unitPrice) * item.quantity).toString(),
        options: item.options || null,
      }));

      await createOrderItems(orderItemsData);

      // Notify owner
      await notifyOwner({
        title: "Neue Bestellung",
        content: `Bestellnummer: ${orderNumber}\nKunde: ${ctx.user.name || ctx.user.email}\nGesamtbetrag: ${input.totalAmount} €\nZahlungsmethode: ${input.paymentMethod}`,
      });

      return { success: true, orderId, orderNumber };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const order = await getOrderById(input.id);
      if (!order) return null;
      
      // Check if user owns this order or is admin
      if (order.userId !== ctx.user?.id && ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }

      const items = await getOrderItems(input.id);
      const transactions = await getTransactionsByOrderId(input.id);
      return { order, items, transactions };
    }),

  getByNumber: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) return null;

      if (order.userId !== ctx.user?.id && ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }

      const items = await getOrderItems(order.id);
      const transactions = await getTransactionsByOrderId(order.id);
      return { order, items, transactions };
    }),

  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new Error("User not authenticated");
    }
    return await getOrdersByUserId(ctx.user.id);
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Not authorized");
    }
    return await getAllOrders();
  }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "awaiting_payment", "payment_received", "processing", "completed", "cancelled", "refunded"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }

      const additionalData: any = {};
      if (input.adminNotes) additionalData.adminNotes = input.adminNotes;
      if (input.status === "payment_received") additionalData.paidAt = new Date();
      if (input.status === "completed") additionalData.completedAt = new Date();

      await updateOrderStatus(input.id, input.status, additionalData);
      return { success: true };
    }),
});

// Payment Router
export const paymentRouter = router({
  createTransaction: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        method: z.enum(["crypto_btc", "crypto_eth", "crypto_usdt", "bank_transfer", "card"]),
        amount: z.string(),
        cryptoAmount: z.string().optional(),
        cryptoCurrency: z.string().optional(),
        walletAddress: z.string().optional(),
        bankReference: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await createPaymentTransaction({
        orderId: input.orderId,
        transactionRef,
        type: "payment",
        method: input.method,
        amount: input.amount,
        cryptoAmount: input.cryptoAmount || null,
        cryptoCurrency: input.cryptoCurrency || null,
        walletAddress: input.walletAddress || null,
        bankReference: input.bankReference || null,
        status: "pending",
      });

      return { success: true, transactionRef };
    }),

  getTransactions: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return await getTransactionsByOrderId(input.orderId);
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirming", "confirmed", "failed", "cancelled"]),
        txHash: z.string().optional(),
        confirmations: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }

      const additionalData: any = {};
      if (input.txHash) additionalData.txHash = input.txHash;
      if (input.confirmations !== undefined) additionalData.confirmations = input.confirmations;
      if (input.status === "confirmed") additionalData.confirmedAt = new Date();

      await updateTransactionStatus(input.id, input.status, additionalData);
      return { success: true };
    }),

  // Crypto Wallets
  getCryptoWallets: publicProcedure.query(async () => {
    return await getActiveCryptoWallets();
  }),

  createCryptoWallet: protectedProcedure
    .input(
      z.object({
        currency: z.enum(["BTC", "ETH", "USDT_ERC20", "USDT_TRC20"]),
        address: z.string(),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      await createCryptoWallet(input);
      return { success: true };
    }),

  updateCryptoWallet: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          address: z.string().optional(),
          label: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      await updateCryptoWallet(input.id, input.data);
      return { success: true };
    }),

  // Bank Accounts
  getBankAccounts: publicProcedure.query(async () => {
    return await getActiveBankAccounts();
  }),

  createBankAccount: protectedProcedure
    .input(
      z.object({
        bankName: z.string(),
        accountName: z.string(),
        iban: z.string().optional(),
        swift: z.string().optional(),
        accountNumber: z.string().optional(),
        routingNumber: z.string().optional(),
        currency: z.string().optional(),
        country: z.string().optional(),
        address: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      await createBankAccount(input);
      return { success: true };
    }),

  updateBankAccount: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          bankName: z.string().optional(),
          accountName: z.string().optional(),
          iban: z.string().optional(),
          swift: z.string().optional(),
          isActive: z.boolean().optional(),
          isPrimary: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      await updateBankAccount(input.id, input.data);
      return { success: true };
    }),
});

// Property Media Router
export const propertyMediaRouter = router({
  getByProperty: publicProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ input }) => {
      return await getPropertyMedia(input.propertyId);
    }),

  add: protectedProcedure
    .input(
      z.object({
        propertyId: z.number(),
        type: z.enum(["image", "video", "document"]),
        url: z.string(),
        s3Key: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        isPrimary: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      await addPropertyMedia(input);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      await deletePropertyMedia(input.id);
      return { success: true };
    }),
});

// Admin Properties Router (extended)
export const adminPropertiesRouter = router({
  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Not authorized");
    }
    return await getAllPropertiesAdmin();
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Not authorized");
      }
      await deleteProperty(input.id);
      return { success: true };
    }),
});
