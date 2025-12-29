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
import { sendOrderConfirmation, sendAdminOrderNotification, sendPaymentReceivedEmail } from "./email";
import { getUserById } from "./db";

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

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.string(),
        price: z.string(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Generate slug from name
      const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await createService({
        name: input.name,
        slug,
        description: input.description || '',
        category: input.category as any,
        price: input.price,
        isActive: input.isActive ?? true,
        priceType: 'fixed',
        includedItems: null,
        requirements: null,
      });
      return { success: true };
    }),

  update: publicProcedure
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

  delete: publicProcedure
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
        paymentMethod: z.enum(["wallet", "crypto_btc", "crypto_eth", "crypto_usdt", "bank_transfer", "card"]),
        billingAddress: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }

      // Handle wallet payment - validate first, deduct after order creation
      let walletPaymentData: { walletId: number; userId: number; amount: number } | null = null;
      
      if (input.paymentMethod === "wallet") {
        const { getWalletByUserId } = await import("./db");
        const wallet = await getWalletByUserId(ctx.user.id);
        
        if (!wallet) {
          throw new Error("Kein Wallet gefunden. Bitte erstellen Sie zuerst ein Wallet.");
        }
        
        const totalAmount = parseFloat(input.totalAmount);
        const walletBalance = parseFloat(wallet.balance);
        const bonusBalance = parseFloat(wallet.bonusBalance);
        const totalAvailable = walletBalance + bonusBalance;
        
        if (totalAvailable < totalAmount) {
          throw new Error(`Nicht genügend Guthaben. Verfügbar: ${totalAvailable.toFixed(2)}€, Benötigt: ${totalAmount.toFixed(2)}€`);
        }
        
        walletPaymentData = { walletId: wallet.id, userId: ctx.user.id, amount: totalAmount };
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

      // Process wallet payment after order creation
      if (walletPaymentData) {
        const { useWalletForPurchase, updateOrderStatus } = await import("./db");
        await useWalletForPurchase(
          walletPaymentData.walletId,
          walletPaymentData.userId,
          walletPaymentData.amount,
          orderId,
          `Bestellung #${orderNumber}`
        );
        // Mark order as paid immediately for wallet payments
        await updateOrderStatus(orderId, "completed");
      }

      // Notify owner
      await notifyOwner({
        title: "Neue Bestellung",
        content: `Bestellnummer: ${orderNumber}\nKunde: ${ctx.user.name || ctx.user.email}\nGesamtbetrag: ${input.totalAmount} €\nZahlungsmethode: ${input.paymentMethod}`,
      });

      // Send order confirmation email to customer
      const paymentMethodNames: Record<string, string> = {
        wallet: "Wallet-Guthaben",
        crypto_btc: "Bitcoin (BTC)",
        crypto_eth: "Ethereum (ETH)",
        crypto_usdt: "USDT (Tether)",
        bank_transfer: "Banküberweisung",
      };

      await sendOrderConfirmation(ctx.user.email || "keine-email@example.com", {
        orderNumber,
        customerName: ctx.user.name || ctx.user.email || "Kunde",
        items: input.items.map((item) => ({
          name: item.itemName,
          quantity: item.quantity,
          price: parseFloat(item.unitPrice) * item.quantity,
        })),
        totalAmount: parseFloat(input.totalAmount),
        paymentMethod: paymentMethodNames[input.paymentMethod] || input.paymentMethod,
        paymentInstructions: input.paymentMethod === "wallet"
          ? "Die Zahlung wurde erfolgreich von Ihrem Wallet-Guthaben abgebucht. Ihre Bestellung wird sofort bearbeitet."
          : input.paymentMethod === "bank_transfer" 
            ? "Bitte überweisen Sie den Betrag auf unser Bankkonto. Die Kontodaten finden Sie auf der Bestellbestätigungsseite."
            : `Bitte senden Sie den Betrag an die auf der Bestellbestätigungsseite angezeigte ${paymentMethodNames[input.paymentMethod]}-Adresse.`,
      });

      // Send admin notification
      await sendAdminOrderNotification({
        orderNumber,
        customerName: ctx.user.name || ctx.user.email || "Unbekannt",
        customerEmail: ctx.user.email || "keine-email@example.com",
        totalAmount: parseFloat(input.totalAmount),
        paymentMethod: paymentMethodNames[input.paymentMethod] || input.paymentMethod,
        items: input.items.map((item) => ({
          name: item.itemName,
          quantity: item.quantity,
          price: parseFloat(item.unitPrice) * item.quantity,
        })),
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

  getAll: publicProcedure.query(async () => {
    return await getAllOrders();
  }),

  list: publicProcedure.query(async () => {
    return await getAllOrders();
  }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.string(),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const additionalData: any = {};
      if (input.adminNotes) additionalData.adminNotes = input.adminNotes;
      if (input.status === "payment_received") additionalData.paidAt = new Date();
      if (input.status === "completed") additionalData.completedAt = new Date();

      await updateOrderStatus(input.id, input.status as any, additionalData);

      // Send payment received email when status changes to payment_received or completed
      if (input.status === "payment_received" || input.status === "completed") {
        const order = await getOrderById(input.id);
        if (order && order.userId) {
          const user = await getUserById(order.userId);
          if (user) {
            const paymentMethodNames: Record<string, string> = {
              bitcoin: "Bitcoin (BTC)",
              ethereum: "Ethereum (ETH)",
              usdt: "USDT (Tether)",
              bank_transfer: "Banküberweisung",
            };
            
            await sendPaymentReceivedEmail(user.email || "keine-email@example.com", {
              orderNumber: order.orderNumber,
              customerName: user.name || user.email || "Kunde",
              amount: parseFloat(order.totalAmount),
              paymentMethod: order.paymentMethod ? (paymentMethodNames[order.paymentMethod] || order.paymentMethod) : "Unbekannt",
              remainingBalance: 0,
            });
          }
        }
      }

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

  createCryptoWallet: publicProcedure
    .input(
      z.object({
        currency: z.string(),
        address: z.string(),
        label: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createCryptoWallet(input);
      return { success: true };
    }),

  updateCryptoWallet: publicProcedure
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
    .mutation(async ({ input }) => {
      await updateCryptoWallet(input.id, input.data);
      return { success: true };
    }),

  // Bank Accounts
  getBankAccounts: publicProcedure.query(async () => {
    return await getActiveBankAccounts();
  }),

  createBankAccount: publicProcedure
    .input(
      z.object({
        bankName: z.string(),
        accountHolder: z.string(),
        iban: z.string().optional(),
        bic: z.string().optional(),
        currency: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createBankAccount({
        bankName: input.bankName,
        accountName: input.accountHolder,
        iban: input.iban,
        swift: input.bic,
        currency: input.currency,
        isActive: input.isActive,
      });
      return { success: true };
    }),

  updateBankAccount: publicProcedure
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
    .mutation(async ({ input }) => {
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
