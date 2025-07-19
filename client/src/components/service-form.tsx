import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScanBarcode, Plus, WashingMachine, Car, CreditCard, Smartphone, DollarSign } from "lucide-react";
import type { CarWashService } from "@shared/schema";

const saleFormSchema = z.object({
  customerName: z.string().min(1, "Nombre del cliente es requerido"),
  customerPhone: z.string().optional(),
  licensePlate: z.string().min(1, "Placa del vehículo es requerida"),
  vehicleType: z.string().min(1, "Tipo de vehículo es requerido"),
  color: z.string().optional(),
  year: z.number().optional(),
  paymentMethod: z.enum(["efectivo", "tarjeta", "digital"]),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

export default function ServiceForm() {
  const [selectedServices, setSelectedServices] = useState<Array<{ service: CarWashService; quantity: number }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "digital">("efectivo");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      licensePlate: "",
      vehicleType: "sedan",
      color: "",
      paymentMethod: "efectivo",
    },
  });

  const { data: services = [] } = useQuery<CarWashService[]>({
    queryKey: ["/api/services"],
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      toast({
        title: "Venta procesada",
        description: "La venta ha sido procesada exitosamente",
      });
      form.reset();
      setSelectedServices([]);
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/metrics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar la venta",
        variant: "destructive",
      });
    },
  });

  const addService = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServices(prev => {
        const existing = prev.find(s => s.service.id === serviceId);
        if (existing) {
          return prev.map(s => s.service.id === serviceId ? { ...s, quantity: s.quantity + 1 } : s);
        }
        return [...prev, { service, quantity: 1 }];
      });
    }
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(prev => prev.filter(s => s.service.id !== serviceId));
  };

  const calculateTotals = () => {
    const subtotal = selectedServices.reduce((sum, { service, quantity }) => 
      sum + (parseFloat(service.price) * quantity), 0
    );
    const taxRate = 0.16;
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;
    const estimatedTime = selectedServices.reduce((sum, { service, quantity }) => 
      sum + (service.estimatedMinutes * quantity), 0
    );

    return { subtotal, taxes, total, estimatedTime };
  };

  const onSubmit = async (data: SaleFormValues) => {
    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un servicio",
        variant: "destructive",
      });
      return;
    }

    // First create customer
    const customerResponse = await apiRequest("POST", "/api/customers", {
      name: data.customerName,
      phone: data.customerPhone || null,
    });
    const customer = await customerResponse.json();

    // Then create vehicle
    const vehicleResponse = await apiRequest("POST", "/api/vehicles", {
      customerId: customer.id,
      licensePlate: data.licensePlate,
      vehicleType: data.vehicleType,
      color: data.color || null,
      year: data.year || null,
    });
    const vehicle = await vehicleResponse.json();

    // Calculate totals
    const { subtotal, taxes, total, estimatedTime } = calculateTotals();

    // Create sale
    const saleData = {
      customerId: customer.id,
      vehicleId: vehicle.id,
      subtotal: subtotal.toString(),
      taxAmount: taxes.toString(),
      totalAmount: total.toString(),
      paymentMethod: data.paymentMethod,
      status: "pending",
      estimatedCompletionTime: estimatedTime,
      services: selectedServices.map(({ service, quantity }) => ({
        serviceId: service.id,
        quantity,
      })),
    };

    createSaleMutation.mutate(saleData);
  };

  const { subtotal, taxes, total, estimatedTime } = calculateTotals();

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <ScanBarcode className="text-car-blue mr-2" />
          Nueva Venta - Servicio de Lavado
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa del Vehículo</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-123" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Vehículo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedan">Sedán</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Blanco" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="2023" 
                        {...field} 
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Services Selection */}
            <div>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-4">
                Servicios Seleccionados
              </FormLabel>
              
              <div className="space-y-3">
                {selectedServices.map(({ service, quantity }) => (
                  <div 
                    key={service.id} 
                    className="flex items-center justify-between p-4 bg-car-light rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <WashingMachine className="text-car-blue" />
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <p className="font-bold text-gray-900">${(parseFloat(service.price) * quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{service.estimatedMinutes * quantity} min</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeService(service.id)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add Service Button */}
                <div className="space-y-2">
                  {services.filter(s => !selectedServices.find(ss => ss.service.id === s.id)).map(service => (
                    <Button
                      key={service.id}
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addService(service.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {service.name} - ${service.price} ({service.estimatedMinutes} min)
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Totals */}
            {selectedServices.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos (16%):</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-car-blue">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tiempo estimado:</span>
                    <span>{estimatedTime} minutos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <FormLabel className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pago
              </FormLabel>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === "efectivo" ? "default" : "outline"}
                  className="p-3 flex flex-col items-center"
                  onClick={() => {
                    setPaymentMethod("efectivo");
                    form.setValue("paymentMethod", "efectivo");
                  }}
                >
                  <DollarSign className="mb-1" />
                  <span className="text-sm">Efectivo</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "tarjeta" ? "default" : "outline"}
                  className="p-3 flex flex-col items-center"
                  onClick={() => {
                    setPaymentMethod("tarjeta");
                    form.setValue("paymentMethod", "tarjeta");
                  }}
                >
                  <CreditCard className="mb-1" />
                  <span className="text-sm">Tarjeta</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "digital" ? "default" : "outline"}
                  className="p-3 flex flex-col items-center"
                  onClick={() => {
                    setPaymentMethod("digital");
                    form.setValue("paymentMethod", "digital");
                  }}
                >
                  <Smartphone className="mb-1" />
                  <span className="text-sm">Digital</span>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                className="flex-1 bg-car-blue hover:bg-blue-600"
                disabled={createSaleMutation.isPending || selectedServices.length === 0}
              >
                {createSaleMutation.isPending ? "Procesando..." : "Procesar Pago"}
              </Button>
              <Button type="button" variant="outline">
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
