import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/metric-card";
import ServiceForm from "@/components/service-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Car, Package, Clock, List, Warehouse, TrendingUp, AlertTriangle } from "lucide-react";
import type { InventoryItem, Sale } from "@shared/schema";

interface Metrics {
  dailySales: number;
  servicesCompleted: number;
  averageTime: number;
  lowStockCount: number;
}

export default function Dashboard() {
  const { data: metrics } = useQuery<Metrics>({
    queryKey: ["/api/sales/metrics"],
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: recentSales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  // Filter sales for service queue (pending and in-progress)
  const serviceQueue = recentSales
    .filter(sale => sale.status === 'pending' || sale.status === 'in-progress')
    .slice(0, 5);

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Principal</h2>
            <p className="text-gray-600">Resumen de actividades del car wash</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Turno actual</p>
              <p className="font-medium text-gray-900">08:00 - 16:00</p>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Ventas Hoy"
            value={`$${metrics?.dailySales.toFixed(2) || '0.00'}`}
            subtitle="vs ayer"
            icon={DollarSign}
            trend="↑ +12% vs ayer"
            trendColor="green"
            borderColor="border-car-blue"
            iconBgColor="bg-car-light"
            iconColor="text-car-blue"
          />
          
          <MetricCard
            title="Servicios Hoy"
            value={metrics?.servicesCompleted || 0}
            subtitle="completados"
            icon={Car}
            trend={`${serviceQueue.length} en proceso`}
            trendColor="blue"
            borderColor="border-car-teal"
            iconBgColor="bg-teal-100"
            iconColor="text-car-teal"
          />
          
          <MetricCard
            title="Stock Bajo"
            value={metrics?.lowStockCount || 0}
            subtitle="items"
            icon={Package}
            trend={metrics?.lowStockCount ? "⚠ Requiere atención" : "✓ En orden"}
            trendColor={metrics?.lowStockCount ? "orange" : "green"}
            borderColor="border-orange-500"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-500"
          />
          
          <MetricCard
            title="Tiempo Promedio"
            value={`${metrics?.averageTime || 30} min`}
            subtitle="por servicio"
            icon={Clock}
            trend="✓ Dentro del objetivo"
            trendColor="green"
            borderColor="border-green-500"
            iconBgColor="bg-green-100"
            iconColor="text-green-500"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Section */}
          <div className="lg:col-span-2">
            <ServiceForm />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Service Queue */}
            <Card className="bg-white shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-gray-900">
                  <List className="text-car-teal mr-2" />
                  Cola de Servicios
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {serviceQueue.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay servicios en cola</p>
                  ) : (
                    serviceQueue.map((sale) => (
                      <div 
                        key={sale.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                          sale.status === 'in-progress' 
                            ? 'bg-yellow-50 border-yellow-400' 
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900">Venta #{sale.id}</p>
                          <p className="text-sm text-gray-600">${parseFloat(sale.totalAmount).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            sale.status === 'in-progress' ? 'text-yellow-700' : 'text-blue-700'
                          }`}>
                            {sale.status === 'in-progress' ? 'En proceso' : 'En espera'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sale.estimatedCompletionTime} min
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Inventory */}
            <Card className="bg-white shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-gray-900">
                  <Warehouse className="text-orange-500 mr-2" />
                  Inventario Crítico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {lowStockItems.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay items con stock bajo</p>
                  ) : (
                    lowStockItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="text-orange-500 text-sm h-4 w-4" />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-orange-600">
                          {parseFloat(item.currentStock).toFixed(1)} {item.unit}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white shadow-md">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-gray-900">
                  <TrendingUp className="text-green-500 mr-2" />
                  Estadísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Servicios más populares</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lavado Premium</span>
                      <span className="text-car-blue font-medium">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lavado Básico</span>
                      <span className="text-car-teal font-medium">30%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Solo Encerado</span>
                      <span className="text-gray-600 font-medium">25%</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Eficiencia del día</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
