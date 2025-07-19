import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Download, Calendar, DollarSign } from "lucide-react";
import type { Sale } from "@shared/schema";

export default function Reports() {
  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/sales/metrics"],
  });

  // Calculate reports data
  const today = new Date();
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    return saleDate.toDateString() === today.toDateString();
  });

  const weekSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    return saleDate >= thisWeek;
  });

  const monthSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    return saleDate >= thisMonth;
  });

  const calculateRevenue = (salesList: Sale[]) => {
    return salesList.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
  };

  const paymentMethodStats = sales.reduce((acc, sale) => {
    const method = sale.paymentMethod;
    acc[method] = (acc[method] || 0) + parseFloat(sale.totalAmount);
    return acc;
  }, {} as Record<string, number>);

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
              <BarChart3 className="mr-3 text-car-blue" />
              Reportes y Análisis
            </h2>
            <p className="text-gray-600">Análisis detallado de ventas y rendimiento</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select defaultValue="thisMonth">
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="thisWeek">Esta Semana</SelectItem>
                <SelectItem value="thisMonth">Este Mes</SelectItem>
                <SelectItem value="lastMonth">Mes Anterior</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-car-blue hover:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-car-blue">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-car-light rounded-lg flex items-center justify-center">
                  <DollarSign className="text-car-blue" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ventas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculateRevenue(todaySales).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">
                    {todaySales.length} transacciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-car-teal">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-car-teal" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculateRevenue(weekSales).toFixed(2)}
                  </p>
                  <p className="text-sm text-car-teal">
                    {weekSales.length} transacciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Este Mes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculateRevenue(monthSales).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">
                    {monthSales.length} transacciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Promedio/Día</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${monthSales.length > 0 ? (calculateRevenue(monthSales) / 30).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-purple-600">
                    Últimos 30 días
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(paymentMethodStats).map(([method, amount]) => {
                  const percentage = sales.length > 0 
                    ? (amount / calculateRevenue(sales)) * 100 
                    : 0;
                  
                  const methodLabel = {
                    'efectivo': 'Efectivo',
                    'tarjeta': 'Tarjeta',
                    'digital': 'Digital'
                  }[method] || method;

                  return (
                    <div key={method}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{methodLabel}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">${amount.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-car-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Service Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Servicios Completados</span>
                    <span className="text-sm font-bold">{metrics?.servicesCompleted || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Tiempo Promedio</span>
                    <span className="text-sm font-bold">{metrics?.averageTime || 0} min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-car-blue h-2 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Eficiencia</span>
                    <span className="text-sm font-bold">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-car-teal h-2 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Summary Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen de Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Transacciones</th>
                    <th className="text-left py-3 px-4">Ingresos</th>
                    <th className="text-left py-3 px-4">Promedio/Transacción</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(7)].map((_, i) => {
                    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                    const daySales = sales.filter(sale => {
                      const saleDate = new Date(sale.saleDate);
                      return saleDate.toDateString() === date.toDateString();
                    });
                    
                    const dayRevenue = calculateRevenue(daySales);
                    const avgTransaction = daySales.length > 0 ? dayRevenue / daySales.length : 0;

                    return (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {date.toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
                        </td>
                        <td className="py-3 px-4">{daySales.length}</td>
                        <td className="py-3 px-4 font-medium">${dayRevenue.toFixed(2)}</td>
                        <td className="py-3 px-4">${avgTransaction.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
