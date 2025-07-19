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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private vehicles: Map<number, Vehicle>;
  private carWashServices: Map<number, CarWashService>;
  private inventoryItems: Map<number, InventoryItem>;
  private suppliers: Map<number, Supplier>;
  private purchases: Map<number, Purchase>;
  private purchaseItems: Map<number, PurchaseItem>;
  private sales: Map<number, Sale>;
  private saleServices: Map<number, SaleService>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.vehicles = new Map();
    this.carWashServices = new Map();
    this.inventoryItems = new Map();
    this.suppliers = new Map();
    this.purchases = new Map();
    this.purchaseItems = new Map();
    this.sales = new Map();
    this.saleServices = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Create admin user
    this.createUser({
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

    services.forEach(service => this.createCarWashService(service));

    // Seed inventory items (precios en Lempiras)
    const items: InsertInventoryItem[] = [
      { name: "Champú Premium", description: "Champú para lavado de vehículos", currentStock: "24.00", minStock: "10.00", unit: "L", costPerUnit: "210.00" },
      { name: "Cera Líquida", description: "Cera protectora líquida", currentStock: "8.00", minStock: "12.00", unit: "L", costPerUnit: "370.00" },
      { name: "Desengrasante", description: "Producto para eliminar grasa", currentStock: "2.00", minStock: "8.00", unit: "L", costPerUnit: "295.00" },
      { name: "Toallas Microfibra", description: "Toallas de microfibra para secado", currentStock: "45.00", minStock: "20.00", unit: "und", costPerUnit: "85.00" },
      { name: "Aspiradora Industrial", description: "Equipo de aspirado industrial", currentStock: "3.00", minStock: "2.00", unit: "und", costPerUnit: "11000.00" }
    ];

    items.forEach(item => this.createInventoryItem(item));

    // Seed suppliers
    const suppliers: InsertSupplier[] = [
      { name: "Distribuidora Central", contact: "Carlos Mejía", phone: "9988-7766", email: "ventas@distribuidoracentral.hn", address: "San Pedro Sula, Cortés" },
      { name: "Productos de Limpieza HN", contact: "María González", phone: "9755-4433", email: "info@limpiezahn.com", address: "Tegucigalpa, Francisco Morazán" },
      { name: "Equipos Industriales del Norte", contact: "Roberto Fernández", phone: "9611-2299", email: "equipos@industrialnorte.hn", address: "Choloma, Cortés" }
    ];

    suppliers.forEach(supplier => this.createSupplier(supplier));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      email: insertCustomer.email || null,
      phone: insertCustomer.phone || null
    };
    this.customers.set(id, customer);
    return customer;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehiclesByCustomer(customerId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(v => v.customerId === customerId);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentId++;
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      color: insertVehicle.color || null,
      brand: insertVehicle.brand || null,
      model: insertVehicle.model || null,
      year: insertVehicle.year || null,
      customerId: insertVehicle.customerId || null
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  // Services
  async getCarWashServices(): Promise<CarWashService[]> {
    return Array.from(this.carWashServices.values());
  }

  async getCarWashService(id: number): Promise<CarWashService | undefined> {
    return this.carWashServices.get(id);
  }

  async createCarWashService(insertService: InsertCarWashService): Promise<CarWashService> {
    const id = this.currentId++;
    const service: CarWashService = { 
      ...insertService, 
      id,
      description: insertService.description || null,
      isActive: insertService.isActive !== undefined ? insertService.isActive : true
    };
    this.carWashServices.set(id, service);
    return service;
  }

  async updateCarWashService(id: number, updates: Partial<InsertCarWashService>): Promise<CarWashService | undefined> {
    const service = this.carWashServices.get(id);
    if (!service) return undefined;
    
    const updated = { ...service, ...updates };
    this.carWashServices.set(id, updated);
    return updated;
  }

  // Inventory
  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.currentId++;
    const item: InventoryItem = { 
      ...insertItem, 
      id,
      description: insertItem.description || null
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, ...updates };
    this.inventoryItems.set(id, updated);
    return updated;
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).filter(
      item => parseFloat(item.currentStock) <= parseFloat(item.minStock)
    );
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentId++;
    const supplier: Supplier = { 
      ...insertSupplier, 
      id,
      contact: insertSupplier.contact || null,
      phone: insertSupplier.phone || null,
      email: insertSupplier.email || null,
      address: insertSupplier.address || null
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values());
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentId++;
    const purchase: Purchase = { 
      ...insertPurchase, 
      id, 
      purchaseDate: new Date(),
      status: insertPurchase.status || "pending",
      supplierId: insertPurchase.supplierId || null,
      invoiceNumber: insertPurchase.invoiceNumber || null
    };
    this.purchases.set(id, purchase);
    return purchase;
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.currentId++;
    const sale: Sale = { 
      ...insertSale, 
      id, 
      saleDate: new Date(),
      status: insertSale.status || "pending",
      customerId: insertSale.customerId || null,
      vehicleId: insertSale.vehicleId || null,
      estimatedCompletionTime: insertSale.estimatedCompletionTime || null
    };
    this.sales.set(id, sale);
    return sale;
  }

  async updateSaleStatus(id: number, status: string): Promise<Sale | undefined> {
    const sale = this.sales.get(id);
    if (!sale) return undefined;
    
    const updated = { ...sale, status };
    this.sales.set(id, updated);
    return updated;
  }

  async getSalesMetrics(): Promise<{
    dailySales: number;
    servicesCompleted: number;
    averageTime: number;
    lowStockCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = Array.from(this.sales.values()).filter(
      sale => sale.saleDate >= today
    );
    
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
    return Array.from(this.saleServices.values()).filter(ss => ss.saleId === saleId);
  }

  async createSaleService(insertSaleService: InsertSaleService): Promise<SaleService> {
    const id = this.currentId++;
    const saleService: SaleService = { 
      ...insertSaleService, 
      id,
      saleId: insertSaleService.saleId || null,
      serviceId: insertSaleService.serviceId || null,
      quantity: insertSaleService.quantity || 1
    };
    this.saleServices.set(id, saleService);
    return saleService;
  }
}

export const storage = new MemStorage();
