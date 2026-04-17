'use client';

interface Filters {
  search: string;
  source: string;
  status: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}

export function FiltersBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Rechercher par nom, email, @username..."
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        className="flex-1 px-4 py-2.5 bg-[#161b22] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#52b788] transition-colors"
      />
      <select
        value={filters.source}
        onChange={(e) => onChange({ source: e.target.value })}
        className="px-4 py-2.5 bg-[#161b22] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#52b788] transition-colors"
      >
        <option value="">Toutes les sources</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="tiktok">TikTok</option>
        <option value="linkedin">LinkedIn</option>
        <option value="manychat">ManyChat</option>
        <option value="zapier">Zapier</option>
        <option value="direct">Direct</option>
      </select>
      <select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value })}
        className="px-4 py-2.5 bg-[#161b22] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#52b788] transition-colors"
      >
        <option value="">Tous les statuts</option>
        <option value="new">Nouveau</option>
        <option value="contacted">Contacté</option>
        <option value="trial">Essai</option>
        <option value="converted">Converti</option>
        <option value="lost">Perdu</option>
      </select>
    </div>
  );
}
