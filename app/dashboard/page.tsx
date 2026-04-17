'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { StatsCards } from '@/components/StatsCards';
import { FiltersBar } from '@/components/FiltersBar';
import { LeadsTable, type Lead } from '@/components/LeadsTable';
import { Users } from 'lucide-react';

interface Stats {
  total: number;
  this_week: number;
  converted: number;
  in_progress: number;
  conversion_rate: number;
}

interface Filters {
  search: string;
  source: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFiltersState] = useState<Filters>({ search: '', source: '', status: '' });
  const [tick, setTick] = useState(0);

  const setFilters = useCallback((f: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...f }));
    setPage(1);
  }, []);

  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const params = new URLSearchParams({ page: String(page), per_page: '20' });
      if (filters.source) params.set('source', filters.source);
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/leads?${params}`),
        fetch('/api/leads/stats'),
      ]);

      if (listRes.status === 401) {
        router.push('/login');
        return;
      }

      const [listData, statsData] = await Promise.all([listRes.json(), statsRes.json()]);

      if (!cancelled) {
        setLeads(listData.items ?? []);
        setTotal(listData.total ?? 0);
        setPages(listData.pages ?? 1);
        setStats(statsData);
        setIsLoading(false);
      }
    }

    load().catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [filters, page, tick, router]);

  async function handleStatusChange(id: number, status: string) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success('Statut mis à jour');
      refetch();
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Supprimer le lead "${name}" ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      toast.success('Lead supprimé');
      refetch();
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    document.cookie = 'leads_token=; path=/; max-age=0';
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Toaster theme="dark" position="bottom-right" />

      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#52b788] rounded-lg flex items-center justify-center">
            <Users size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white">Leads Dashboard</span>
          <span className="text-gray-600 text-sm">/ FactureFy</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          Déconnexion
        </button>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Title + count */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Leads sociaux</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isLoading ? 'Chargement...' : `${total} lead${total > 1 ? 's' : ''} au total`}
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-[#161b22] border border-white/10 rounded-lg px-3 py-1.5">
            Webhook : <code className="text-[#52b788]">/api/webhook</code>
          </div>
        </div>

        {/* KPI cards */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <FiltersBar filters={filters} onChange={setFilters} />

        {/* Table */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-gray-500">
              <p>Chargement des leads...</p>
            </div>
          ) : (
            <LeadsTable
              leads={leads}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Page {page} sur {pages} · {total} leads
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 bg-[#161b22] border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="px-4 py-2 bg-[#161b22] border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
