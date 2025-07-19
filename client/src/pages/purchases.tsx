import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SupplierForm } from "@/components/supplier-form";
import { ShoppingCart, Plus, FileText } from "lucide-react";
import type { Purchase, Supplier } from "@shared/schema";

const purchaseFormSchema = z.object({
  supplierId: z.number().min(1, "Proveedor es requerido"),
  invoiceNumber: z.string().optional(),
  totalAmount: z.string().min(1, "Monto total es requerido"),
  status: z.enum(["pending", "received", "cancelled"]).default("pending"),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

export default function Purchases() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplierId: 0,
      invoiceNumber: "",
      totalAmount: "",
      status: "pending",
    },
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (data: PurchaseFormValues) => {
      return await apiRequest("POST", "/api/purchases", data);
    },
    onSuccess: () => {
      toast({
        title: "Compra creada",
        description: "La compra ha sido registrada exitosamente",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la compra",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseFormValues) => {
    createPurchaseMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "outline",
      received: "secondary",
      cancelled: "destructive",
    };
    
    const labels: { [key: string]: string } = {
      pending: "Pendiente",
      received: "Recibido",
      cancelled: "Cancelado",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="mr-3 text-car-blue" />
              Gestión de Compras
            </h2>
            <p className="text-gray-600">Administra compras de insumos y productos</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total compras</p>
              <p className="text-2xl font-bold text-car-blue">
                L {purchases.reduce((sum, purchase) => sum + parseFloat(purchase.totalAmount), 0).toFixed(2)}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-car-blue hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Compra
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Orden de Compra</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proveedor</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar proveedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <SupplierForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] })} />
                    </div>

                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Factura</FormLabel>
                          <FormControl>
                            <Input placeholder="FA-001234" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto Total (L)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="received">Recibido</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createPurchaseMutation.isPending}
                      >
                        {createPurchaseMutation.isPending ? "Creando..." : "Crear Compra"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-car-blue" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compras Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {purchases.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compras Recibidas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {purchases.filter(p => p.status === 'received').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    L {purchases
                      .filter(p => {
                        const date = new Date(p.purchaseDate);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      })
                      .reduce((sum, p) => sum + parseFloat(p.totalAmount), 0)
                      .toFixed(2)
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>N° Factura</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay compras registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">#{purchase.id}</TableCell>
                      <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                      <TableCell>
                        {suppliers.find(s => s.id === purchase.supplierId)?.name || `Proveedor #${purchase.supplierId}`}
                      </TableCell>
                      <TableCell>{purchase.invoiceNumber || "N/A"}</TableCell>
                      <TableCell className="font-medium">
                        L {parseFloat(purchase.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            Ver Detalles
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
