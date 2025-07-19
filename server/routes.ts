import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertVehicleSchema, insertSaleSchema, insertSaleServiceSchema, insertCarWashServiceSchema, insertInventoryItemSchema, insertSupplierSchema, insertPurchaseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customers
  app.get("/api/customers", async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  // Vehicles
  app.get("/api/vehicles", async (_req, res) => {
    const vehicles = await storage.getVehicles();
    res.json(vehicles);
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  // Car Wash Services
  app.get("/api/services", async (_req, res) => {
    const services = await storage.getCarWashServices();
    res.json(services);
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertCarWashServiceSchema.parse(req.body);
      const service = await storage.createCarWashService(serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Invalid service data" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCarWashServiceSchema.partial().parse(req.body);
      const service = await storage.updateCarWashService(id, updates);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(400).json({ error: "Invalid service data" });
    }
  });

  // Inventory
  app.get("/api/inventory", async (_req, res) => {
    const items = await storage.getInventoryItems();
    res.json(items);
  });

  app.get("/api/inventory/low-stock", async (_req, res) => {
    const items = await storage.getLowStockItems();
    res.json(items);
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const itemData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory item data" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertInventoryItemSchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, updates);
      if (!item) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory item data" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (_req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ error: "Invalid supplier data" });
    }
  });

  // Purchases
  app.get("/api/purchases", async (_req, res) => {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  });

  app.post("/api/purchases", async (req, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(purchaseData);
      res.json(purchase);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase data" });
    }
  });

  // Sales
  app.get("/api/sales", async (_req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });

  app.get("/api/sales/metrics", async (_req, res) => {
    const metrics = await storage.getSalesMetrics();
    res.json(metrics);
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const saleSchema = insertSaleSchema.extend({
        services: z.array(z.object({
          serviceId: z.number(),
          quantity: z.number().default(1)
        }))
      });
      
      const { services, ...saleData } = saleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      
      // Create sale services
      for (const serviceData of services) {
        const service = await storage.getCarWashService(serviceData.serviceId);
        if (service) {
          await storage.createSaleService({
            saleId: sale.id,
            serviceId: serviceData.serviceId,
            quantity: serviceData.quantity,
            unitPrice: service.price,
            totalPrice: (parseFloat(service.price) * serviceData.quantity).toString()
          });
        }
      }
      
      res.json(sale);
    } catch (error) {
      res.status(400).json({ error: "Invalid sale data" });
    }
  });

  app.put("/api/sales/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const sale = await storage.updateSaleStatus(id, status);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(400).json({ error: "Invalid status data" });
    }
  });

  // Sale Services
  app.get("/api/sales/:id/services", async (req, res) => {
    const saleId = parseInt(req.params.id);
    const saleServices = await storage.getSaleServices(saleId);
    res.json(saleServices);
  });

  const httpServer = createServer(app);
  return httpServer;
}
