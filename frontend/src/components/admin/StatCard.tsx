import { TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  color?: 'cyan' | 'purple' | 'green' | 'blue';
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'cyan',
}: StatCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-500 to-teal-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-indigo-500',
  };

  return (
    <Card 
      className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
      style={{
        backdropFilter: 'blur(2px) saturate(120%)',
        WebkitBackdropFilter: 'blur(2px) saturate(120%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </Card>
  );
}

