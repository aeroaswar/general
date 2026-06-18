'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAcara } from '@/context/AcaraContext';
import { AppShell } from '@/components/AppShell';
import { AcaraCard } from '@/components/AcaraCard';
import { AcaraForm } from '@/components/AcaraForm';
import { Plus, CalendarCheck } from 'lucide-react';
import type { Acara } from '@/types/acara';

export default function HomePage() {
  const { acara, isLoaded } = useAcara();
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Acara | null>(null);

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(a: Acara) { setEditing(a); setFormOpen(true); }

  return (
    <AppShell pageTitle="Daftar Acara">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Daftar Acara</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {acara.length} acara terdaftar
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-card"
          >
            <Plus className="h-4 w-4" />
            Buat Acara
          </button>
        </div>

        {/* Grid */}
        {!isLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : acara.length === 0 ? (
          <EmptyState onCreateClick={openCreate} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {acara
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((a) => (
                <AcaraCard
                  key={a.id}
                  acara={a}
                  onOpen={() => router.push(`/${a.id}`)}
                  onEdit={() => openEdit(a)}
                />
              ))}
          </div>
        )}
      </div>

      <AcaraForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </AppShell>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
        <CalendarCheck className="h-8 w-8 text-primary-500" />
      </div>
      <h2 className="text-base font-semibold text-text-primary mb-1">Belum ada acara</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-xs">
        Buat acara pertama untuk mulai mengelola anggaran, rundown, dan vendor.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        Buat Acara
      </button>
    </div>
  );
}
