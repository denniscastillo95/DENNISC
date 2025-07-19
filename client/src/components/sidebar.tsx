import { Link, useLocation } from "wouter";
import { Car, BarChart3, ScanBarcode, Package, ShoppingCart, Settings, User } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Ventas", href: "/sales", icon: ScanBarcode },
  { name: "Inventario", href: "/inventory", icon: Package },
  { name: "Compras", href: "/purchases", icon: ShoppingCart },
  { name: "Reportes", href: "/reports", icon: BarChart3 },
  { name: "Servicios", href: "/services", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-car-navy text-white flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-car-blue rounded-lg flex items-center justify-center">
            <Car className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Carwash Peña Blanca</h1>
            <p className="text-blue-300 text-sm">Sistema POS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-car-blue text-white" 
                      : "hover:bg-blue-800"
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Dennis Castillo</p>
            <p className="text-xs text-blue-300">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
