import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Edit, Clock, DollarSign } from "lucide-react";
import type { CarWashService } from "@shared/schema";

const serviceFormSchema = z.object({
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  price: z.string().min(1, "Precio es requerido"),
  estimatedMinutes: z.number().min(1, "Tiempo estimado es requerido"),
  isActive: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function Services() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<CarWashService | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery<CarWashService[]>({
    queryKey: ["/api/services"],
  });

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      estimatedMinutes: 30,
      isActive: true,
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      return await apiRequest("POST", "/api/services", data);
    },
    onSuccess: () => {
      toast({
        title: "Servicio creado",
        description: "El servicio ha sido creado exitosamente",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el servicio",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ServiceFormValues> }) => {
      return await apiRequest("PUT", `/api/services/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Servicio actualizado",
        description: "El servicio ha sido actualizado exitosamente",
      });
      form.reset();
      setIsDialogOpen(false);
      setEditingService(null);
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormValues) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const handleEdit = (service: CarWashService) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description || "",
      price: service.price,
      estimatedMinutes: service.estimatedMinutes,
      isActive: service.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleNewService = () => {
    setEditingService(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
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

  const activeServices = services.filter(s => s.isActive);
  const inactiveServices = services.filter(s => !s.isActive);

  return (
    <>
      <header className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="mr-3 text-car-blue" />
              Gestión de Servicios
            </h2>
            <p className="text-gray-600">Administra los servicios de lavado y sus precios</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Servicios Activos</p>
              <p className="text-2xl font-bold text-car-blue">{activeServices.length}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewService} className="bg-car-blue hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Servicio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Editar Servicio" : "Nuevo Servicio de Lavado"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Servicio</FormLabel>
                          <FormControl>
                            <Input placeholder="Lavado Premium" {...field} />
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
                            <Textarea 
                              placeholder="Descripción detallada del servicio" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio ($)</FormLabel>
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
                        name="estimatedMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiempo (min)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="30" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Servicio Activo</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                      >
                        {(createServiceMutation.isPending || updateServiceMutation.isPending) 
                          ? "Guardando..." 
                          : editingService ? "Actualizar" : "Crear Servicio"
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
        {/* Service Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-car-blue">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-car-light rounded-lg flex items-center justify-center">
                  <Settings className="text-car-blue" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servicios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{activeServices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-car-teal">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-car-teal" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${activeServices.length > 0 
                      ? (activeServices.reduce((sum, s) => sum + parseFloat(s.price), 0) / activeServices.length).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeServices.length > 0 
                      ? formatTime(Math.round(activeServices.reduce((sum, s) => sum + s.estimatedMinutes, 0) / activeServices.length))
                      : '0m'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servicio Más Caro</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${activeServices.length > 0 
                      ? Math.max(...activeServices.map(s => parseFloat(s.price))).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Tiempo Estimado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No hay servicios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{service.description || "Sin descripción"}</p>
                      </TableCell>
                      <TableCell className="font-medium text-car-blue">
                        ${parseFloat(service.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{formatTime(service.estimatedMinutes)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "secondary" : "outline"}>
                          {service.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Servicios Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeServices
                  .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
                  .slice(0, 3)
                  .map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{formatTime(service.estimatedMinutes)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">${parseFloat(service.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Servicios Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeServices
                  .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)
                  .slice(0, 3)
                  .map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">${parseFloat(service.price).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(service.estimatedMinutes)}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
