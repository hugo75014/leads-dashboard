'use client';

import { Trash2 } from 'lucide-react';

export interface Lead {
  id: number;
  source: string;
  platform_username: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  notes: string | null;
  created_at: string | null;
}

const SOURCE_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/15 text-pink-400',
  facebook:  'bg-blue-600/15 text-blue-500',
  tiktok:    'bg-gray-500/15 text-gray-300',
  linkedin:  'bg-sky-500/15 text-sky-400',
  manychat:  'bg-purple-500/15 text-purple-400',
  zapier:    'bg-orange-500/15 text-orange-400',
  direct:    'bg-gray-700/30 text-gray-400',
};

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-[#52b788]/15 text-[#52b788]',
  contacted: 'bg-yellow-500/15 text-yellow-400',
  trial:     'bg-blue-500/15 text-blue-400',
  converted: 'bg-[#52b788]/30 text-[#52b788] font-semibold',
  lost:      'bg-red-500/15 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau', contacted: 'Contacté', trial: 'Essai', converted: 'Converti', lost: 'Perdu',
};

interface Props {
  leads: Lead[];
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number, name: string) => void;
}

export function LeadsTable({ leads, onStatusChange, onDelete }: Props) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Aucun lead pour le moment</p>
        <p className="text-sm mt-1">Les leads ManyChat/Zapier apparaîtront ici automatiquement</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left">
            {['Nom / @username', 'Source', 'Statut', 'Email', 'Téléphone', 'Date', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-4">
                <p className="text-white font-medium">{lead.full_name || '—'}</p>
                {lead.platform_username && (
                  <p className="text-gray-500 text-xs mt-0.5">{lead.platform_username}</p>
                )}
              </td>
              <td className="px-4 py-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${SOURCE_COLORS[lead.source] ?? 'bg-gray-700/30 text-gray-400'}`}>
                  {lead.source}
                </span>
              </td>
              <td className="px-4 py-4">
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/20 ${STATUS_COLORS[lead.status] ?? ''}`}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v} className="bg-[#161b22] text-white">{l}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-4 text-gray-400">{lead.email || '—'}</td>
              <td className="px-4 py-4 text-gray-400">{lead.phone || '—'}</td>
              <td className="px-4 py-4 text-gray-500 text-xs">
                {lead.created_at ? new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => onDelete(lead.id, lead.full_name || String(lead.id))}
                  className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
