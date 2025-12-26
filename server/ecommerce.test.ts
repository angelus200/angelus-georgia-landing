import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Create mock context for public procedures
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Create mock context for authenticated user
function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    name: "Test User",
    email: "test@example.com",
    loginMethod: "local",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Create mock context for admin user
function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user-123",
    name: "Admin User",
    email: "admin@example.com",
    loginMethod: "local",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("E-Commerce Router Tests", () => {
  describe("Services Router", () => {
    it("should list all services (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const services = await caller.services.list();
      
      expect(Array.isArray(services)).toBe(true);
    });

    it("should get services by category (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const services = await caller.services.byCategory({ category: "company_formation" });
      
      expect(Array.isArray(services)).toBe(true);
    });
  });

  describe("Cart Router", () => {
    it("should get or create cart with session ID (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const cartData = await caller.cart.get({ sessionId: "test-session-123" });
      
      expect(cartData).toBeDefined();
      expect(cartData.cart).toBeDefined();
      expect(Array.isArray(cartData.items)).toBe(true);
    });
  });

  describe("Payment Router", () => {
    it("should get crypto wallets (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const wallets = await caller.payment.getCryptoWallets();
      
      expect(Array.isArray(wallets)).toBe(true);
    });

    it("should get bank accounts (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const accounts = await caller.payment.getBankAccounts();
      
      expect(Array.isArray(accounts)).toBe(true);
    });

    it("should allow wallet creation for any user (admin dashboard)", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      // Crypto wallet creation is now public for admin dashboard access
      const result = await caller.payment.createCryptoWallet({
        currency: "BTC",
        address: "bc1qtest" + Date.now(),
        label: "Test Wallet",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Orders Router", () => {
    it("should get user orders (authenticated)", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      const orders = await caller.orders.getMyOrders();
      
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should get all orders (admin only)", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const orders = await caller.orders.getAll();
      
      expect(Array.isArray(orders)).toBe(true);
    });

    it("should allow getAll for any user (admin dashboard)", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      // Orders.getAll is now public for admin dashboard access
      const orders = await caller.orders.getAll();
      expect(Array.isArray(orders)).toBe(true);
    });
  });

  describe("Property Media Router", () => {
    it("should get property media (public)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const media = await caller.propertyMedia.getByProperty({ propertyId: 1 });
      
      expect(Array.isArray(media)).toBe(true);
    });

    it("should reject media upload for non-admin", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.propertyMedia.add({
          propertyId: 1,
          type: "image",
          url: "https://example.com/image.jpg",
        })
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("Admin Properties Router", () => {
    it("should list all properties including non-available (admin)", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      const properties = await caller.adminProperties.listAll();
      
      expect(Array.isArray(properties)).toBe(true);
    });

    it("should reject listAll for non-admin", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(caller.adminProperties.listAll()).rejects.toThrow("Not authorized");
    });
  });
});

describe("Order Number Generation", () => {
  it("should generate unique order numbers", async () => {
    const { generateOrderNumber } = await import("./db");
    
    const orderNumber1 = generateOrderNumber();
    const orderNumber2 = generateOrderNumber();
    
    expect(orderNumber1).toMatch(/^AMG-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(orderNumber2).toMatch(/^AMG-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(orderNumber1).not.toBe(orderNumber2);
  });
});
