import {
  users, customers, vehicles, carWashServices, inventoryItems, suppliers,
  purchases, purchaseItems, sales, saleServices,
  type User, type Customer, type Vehicle, type CarWashService,
  type InventoryItem, type Supplier, type Purchase, type PurchaseItem,
  type Sale, type SaleService,
  type InsertUser, type InsertCustomer, type InsertVehicle,
  type InsertCarWashService, type InsertInventoryItem, type InsertSupplier,
  type InsertPurchase, type InsertPurchaseItem, type InsertSale, type InsertSaleService
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehiclesByCustomer(customerId: number): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  
  // Services
  getCarWashServices(): Promise<CarWashService[]>;
  getCarWashService(id: number): Promise<CarWashService | undefined>;
  createCarWashService(service: InsertCarWashService): Promise<CarWashService>;
  updateCarWashService(id: number, updates: Partial<InsertCarWashService>): Promise<CarWashService | undefined>;
  
  // Inventory
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  getLowStockItems(): Promise<InventoryItem[]>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  
  // Purchases
  getPurchases(): Promise<Purchase[]>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  
  // Sales
  getSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSaleStatus(id: number, status: string): Promise<Sale | undefined>;
  getSalesMetrics(): Promise<{
    dailySales: number;
    servicesCompleted: number;
    averageTime: number;
    lowStockCount: number;
  }>;
  
  // Sale Services
  getSaleServices(saleId: number): Promise<SaleService[]>;
  createSaleService(saleService: InsertSaleService): Promise<SaleService>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if admin user exists, if not seed the database
      const adminUser = await this.getUserByUsername("DENNIS CASTILLO");
      if (!adminUser) {
        await this.seedData();
      }
    } catch (error) {
      console.log("Database not yet initialized, will seed on first operation");
    }
  }

  private async seedData() {
    try {
      // Create admin user
      await this.createUser({
        username: "DENNIS CASTILLO",
        password: "742211010338",
        role: "admin"
      });

      // Seed car wash services (precios en Lempiras)
      const services: InsertCarWashService[] = [
        { name: "Lavado Básico", description: "Lavado exterior básico", price: "150.00", estimatedMinutes: 30 },
        { name: "Lavado Premium", description: "Lavado completo + encerado + aspirado", price: "280.00", estimatedMinutes: 45 },
        { name: "Limpieza Interior", description: "Aspirado + limpieza tapicería", price: "120.00", estimatedMinutes: 20 },
        { name: "Encerado", description: "Aplicación de cera protectora", price: "200.00", estimatedMinutes: 25 },
        { name: "Lavado Completo", description: "Servicio completo interior y exterior", price: "350.00", estimatedMinutes: 65 }
      ];

      for (const service of services) {
        await this.createCarWashService(service);
      }

      // Seed inventory items (precios en Lempiras)
      const items: InsertInventoryItem[] = [
        { name: "Champú Premium", description: "Champú para lavado de vehículos", currentStock: "24.00", minStock: "10.00", unit: "L", costPerUnit: "210.00" },
        { name: "Cera Líquida", description: "Cera protectora líquida", currentStock: "8.00", minStock: "12.00", unit: "L", costPerUnit: "370.00" },
        { name: "Desengrasante", description: "Producto para eliminar grasa", currentStock: "2.00", minStock: "8.00", unit: "L", costPerUnit: "295.00" },
        { name: "Toallas Microfibra", description: "Toallas de microfibra para secado", currentStock: "45.00", minStock: "20.00", unit: "und", costPerUnit: "85.00" },
        { name: "Aspiradora Industrial", description: "Equipo de aspirado industrial", currentStock: "3.00", minStock: "2.00", unit: "und", costPerUnit: "11000.00" }
      ];

      for (const item of items) {
        await this.createInventoryItem(item);
      }

      // Seed suppliers
      const suppliersData: InsertSupplier[] = [
        { name: "Distribuidora Central", contact: "Carlos Mejía", phone: "9988-7766", email: "ventas@distribuidoracentral.hn", address: "San Pedro Sula, Cortés" },
        { name: "Productos de Limpieza HN", contact: "María González", phone: "9755-4433", email: "info@limpiezahn.com", address: "Tegucigalpa, Francisco Morazán" },
        { name: "Equipos Industriales del Norte", contact: "Roberto Fernández", phone: "9611-2299", email: "equipos@industrialnorte.hn", address: "Choloma, Cortés" }
      ];

      for (const supplier of suppliersData) {
        await this.createSupplier(supplier);
      }
      
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "user"
      })
      .returning();
    return user;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values({
        ...insertCustomer,
        email: insertCustomer.email || null,
        phone: insertCustomer.phone || null
      })
      .returning();
    return customer;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehiclesByCustomer(customerId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.customerId, customerId));
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values({
        ...insertVehicle,
        color: insertVehicle.color || null,
        brand: insertVehicle.brand || null,
        model: insertVehicle.model || null,
        year: insertVehicle.year || null,
        customerId: insertVehicle.customerId || null
      })
      .returning();
    return vehicle;
  }

  // Services
  async getCarWashServices(): Promise<CarWashService[]> {
    return await db.select().from(carWashServices);
  }

  async getCarWashService(id: number): Promise<CarWashService | undefined> {
    const [service] = await db.select().from(carWashServices).where(eq(carWashServices.id, id));
    return service || undefined;
  }

  async createCarWashService(insertService: InsertCarWashService): Promise<CarWashService> {
    const [service] = await db
      .insert(carWashServices)
      .values({
        ...insertService,
        description: insertService.description || null,
        isActive: insertService.isActive !== undefined ? insertService.isActive : true
      })
      .returning();
    return service;
  }

  async updateCarWashService(id: number, updates: Partial<InsertCarWashService>): Promise<CarWashService | undefined> {
    const [service] = await db
      .update(carWashServices)
      .set(updates)
      .where(eq(carWashServices.id, id))
      .returning();
    return service || undefined;
  }

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values({
        ...insertItem,
        description: insertItem.description || null
      })
      .returning();
    return item;
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db
      .update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    return item || undefined;
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await db.select().from(inventoryItems);
    return items.filter(
      item => parseFloat(item.currentStock) <= parseFloat(item.minStock)
    );
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db
      .insert(suppliers)
      .values({
        ...insertSupplier,
        contact: insertSupplier.contact || null,
        phone: insertSupplier.phone || null,
        email: insertSupplier.email || null,
        address: insertSupplier.address || null
      })
      .returning();
    return supplier;
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases);
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values({
        ...insertPurchase,
        purchaseDate: new Date(),
        status: insertPurchase.status || "pending",
        supplierId: insertPurchase.supplierId || null,
        invoiceNumber: insertPurchase.invoiceNumber || null
      })
      .returning();
    return purchase;
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales);
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || undefined;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db
      .insert(sales)
      .values({
        ...insertSale,
        saleDate: new Date(),
        status: insertSale.status || "pending",
        customerId: insertSale.customerId || null,
        vehicleId: insertSale.vehicleId || null,
        estimatedCompletionTime: insertSale.estimatedCompletionTime || null
      })
      .returning();
    return sale;
  }

  async updateSaleStatus(id: number, status: string): Promise<Sale | undefined> {
    const [sale] = await db
      .update(sales)
      .set({ status })
      .where(eq(sales.id, id))
      .returning();
    return sale || undefined;
  }

  async getSalesMetrics(): Promise<{
    dailySales: number;
    servicesCompleted: number;
    averageTime: number;
    lowStockCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allSales = await db.select().from(sales);
    const todaySales = allSales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
    
    const dailySales = todaySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const servicesCompleted = todaySales.filter(sale => sale.status === 'completed').length;
    const lowStockItems = await this.getLowStockItems();
    
    // Calculate average time based on estimated completion times
    const avgTime = todaySales.length > 0 
      ? todaySales.reduce((sum, sale) => sum + (sale.estimatedCompletionTime || 30), 0) / todaySales.length
      : 30;

    return {
      dailySales,
      servicesCompleted,
      averageTime: Math.round(avgTime),
      lowStockCount: lowStockItems.length
    };
  }

  // Sale Services
  async getSaleServices(saleId: number): Promise<SaleService[]> {
    return await db.select().from(saleServices).where(eq(saleServices.saleId, saleId));
  }

  async createSaleService(insertSaleService: InsertSaleService): Promise<SaleService> {
    const [saleService] = await db
      .insert(saleServices)
      .values({
        ...insertSaleService,
        saleId: insertSaleService.saleId || null,
        serviceId: insertSaleService.serviceId || null,
        quantity: insertSaleService.quantity || 1
      })
      .returning();
    return saleService;
  }
}

export const storage = new DatabaseStorage();
