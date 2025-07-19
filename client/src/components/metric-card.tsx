import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  trendColor?: "green" | "red" | "blue" | "orange";
  borderColor?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendColor = "green",
  borderColor = "border-car-blue",
  iconBgColor = "bg-car-light",
  iconColor = "text-car-blue"
}: MetricCardProps) {
  const trendColors = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-car-teal",
    orange: "text-orange-600"
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trendColors[trendColor]}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`${iconColor} text-xl`} />
        </div>
      </div>
    </div>
  );
}
