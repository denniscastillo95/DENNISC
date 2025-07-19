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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, AlertTriangle, Edit } from "lucide-react";
import type { InventoryItem } from "@shared/schema";

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  currentStock: z.string().min(1, "Stock actual es requerido"),
  minStock: z.string().min(1, "Stock mínimo es requerido"),
  unit: z.string().min(1, "Unidad es requerida"),
  costPerUnit: z.string().min(1, "Costo por unidad es requerido"),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export default function Inventory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      currentStock: "",
      minStock: "",
      unit: "",
      costPerUnit: "",
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InventoryFormValues) => {
      return await apiRequest("POST", "/api/inventory", data);
    },
    onSuccess: () => {
      toast({
        title: "Item creado",
        description: "El item de inventario ha sido creado exitosamente",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/metrics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el item",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InventoryFormValues> }) => {
      return await apiRequest("PUT", `/api/inventory/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Item actualizado",
        description: "El item de inventario ha sido actualizado exitosamente",
      });
      form.reset();
      setIsDialogOpen(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/metrics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryFormValues) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description || "",
      currentStock: item.currentStock,
      minStock: item.minStock,
      unit: item.unit,
      costPerUnit: item.costPerUnit,
    });
    setIsDialogOpen(true);
  };

  const handleNewItem = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getStockStatus = (current: string, min: string) => {
    const currentStock = parseFloat(current);
    const minStock = parseFloat(min);
    
    if (currentStock <= minStock) {
      return { variant: "destructive" as const, label: "Stock Bajo", icon: AlertTriangle };
    } else if (currentStock <= minStock * 1.5) {
      return { variant: "outline" as const, label: "Stock Medio", icon: Package };
    } else {
      return { variant: "secondary" as const, label: "Stock OK", icon: Package };
    }
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

  const lowStockItems = items.filter(item => 
    parseFloat(item.currentStock) <= parseFloat(item.minStock)
  );

  return (
    <>
      <header className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="mr-3 text-car-blue" />
              Gestión de Inventario
            </h2>
            <p className="text-gray-600">Administra productos e insumos del car wash</p>
          </div>
          <div className="flex items-center space-x-4">
            {lowStockItems.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-orange-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {lowStockItems.length} items con stock bajo
                </p>
              </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewItem} className="bg-car-blue hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Editar Item" : "Nuevo Item de Inventario"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Champú Premium" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input placeholder="Descripción del producto" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="currentStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Actual</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="minStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Mínimo</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidad</FormLabel>
                            <FormControl>
                              <Input placeholder="L, kg, und" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="costPerUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo por Unidad</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createItemMutation.isPending || updateItemMutation.isPending}
                      >
                        {(createItemMutation.isPending || updateItemMutation.isPending) 
                          ? "Guardando..." 
                          : editingItem ? "Actualizar" : "Crear Item"
                        }
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
        <Card>
          <CardHeader>
            <CardTitle>Inventario de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Stock Mínimo</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Costo/Unidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No hay items en el inventario
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const status = getStockStatus(item.currentStock, item.minStock);
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{parseFloat(item.currentStock).toFixed(1)}</TableCell>
                        <TableCell>{parseFloat(item.minStock).toFixed(1)}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>${parseFloat(item.costPerUnit).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
