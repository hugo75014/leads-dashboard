'use client';

import { Users, TrendingUp, Clock, Target } from 'lucide-react';

interface Stats {
  total: number;
  this_week: number;
  converted: number;
  in_progress: number;
  conversion_rate: number;
}

export function StatsCards({ stats }: { stats: Stats | null }) {
  const cards = [
    { label: 'Total leads',     value: stats?.total ?? '—',           color: 'text-white',        icon: <Users size={16} /> },
    { label: 'Cette semaine',   value: stats?.this_week ?? '—',       color: 'text-[#52b788]',    icon: <TrendingUp size={16} /> },
    { label: 'Taux conversion', value: stats ? `${stats.conversion_rate}%` : '—', color: 'text-blue-400', icon: <Target size={16} /> },
    { label: 'En cours',        value: stats?.in_progress ?? '—',     color: 'text-yellow-400',   icon: <Clock size={16} /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-[#161b22] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-xs uppercase tracking-widest">{c.label}</p>
            <span className="text-gray-600">{c.icon}</span>
          </div>
          <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
