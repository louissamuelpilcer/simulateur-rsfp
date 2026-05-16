import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  color?: "blue" | "green" | "red" | "purple" | "orange";
  trend?: { value: number; label: string };
}

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", text: "text-[#003189]", icon: "text-[#003189] bg-blue-100" },
  green: { bg: "bg-green-50", text: "text-green-800", icon: "text-green-700 bg-green-100" },
  red: { bg: "bg-red-50", text: "text-red-800", icon: "text-red-700 bg-red-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-800", icon: "text-purple-700 bg-purple-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-800", icon: "text-orange-700 bg-orange-100" },
};

export default function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "blue",
  trend,
}: MetricCardProps) {
  const colors = COLOR_MAP[color];
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500 font-medium leading-snug">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className={`text-xs font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>
          {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value).toFixed(1)} % {trend.label}
        </div>
      )}
    </div>
  );
}
