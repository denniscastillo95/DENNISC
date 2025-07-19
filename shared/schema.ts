import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  licensePlate: text("license_plate").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  color: text("color"),
  year: integer("year"),
  brand: text("brand"),
  model: text("model"),
});

export const carWashServices = pgTable("car_wash_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(),
  minStock: decimal("min_stock", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  invoiceNumber: text("invoice_number"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
});

export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  saleDate: timestamp("sale_date").notNull().defaultNow(),
  estimatedCompletionTime: integer("estimated_completion_time"),
});

export const saleServices = pgTable("sale_services", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id),
  serviceId: integer("service_id").references(() => carWashServices.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const insertCarWashServiceSchema = createInsertSchema(carWashServices).omit({ id: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true });
export const insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({ id: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true });
export const insertSaleServiceSchema = createInsertSchema(saleServices).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type CarWashService = typeof carWashServices.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SaleService = typeof saleServices.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertCarWashService = z.infer<typeof insertCarWashServiceSchema>;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertSaleService = z.infer<typeof insertSaleServiceSchema>;
