import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScanBarcode, Eye, CheckCircle } from "lucide-react";
import type { Sale } from "@shared/schema";

export default function Sales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PUT", `/api/sales/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la venta ha sido actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/metrics"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "outline",
      "in-progress": "default",
      completed: "secondary",
      cancelled: "destructive",
    };
    
    const labels: { [key: string]: string } = {
      pending: "Pendiente",
      "in-progress": "En Proceso",
      completed: "Completado",
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
      hour: '2-digit',
      minute: '2-digit',
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
              <ScanBarcode className="mr-3 text-car-blue" />
              Gestión de Ventas
            </h2>
            <p className="text-gray-600">Administra todas las ventas y servicios</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total de ventas</p>
            <p className="text-2xl font-bold text-car-blue">
              ${sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tiempo Est.</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay ventas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{formatDate(sale.saleDate)}</TableCell>
                      <TableCell className="font-medium">
                        ${parseFloat(sale.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sale.paymentMethod === 'efectivo' ? 'Efectivo' :
                           sale.paymentMethod === 'tarjeta' ? 'Tarjeta' : 'Digital'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>{sale.estimatedCompletionTime || 0} min</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {sale.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: sale.id,
                                  status: 'in-progress',
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              Iniciar
                            </Button>
                          )}
                          {sale.status === 'in-progress' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: sale.id,
                                  status: 'completed',
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Completar
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
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
