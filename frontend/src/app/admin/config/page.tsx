import { api } from '@/lib/api';
import { ConfigManager } from '@/components/admin/ConfigManager';

type Config = { key: string; value: unknown; updatedAt: string };

export default async function AdminConfigPage() {
  const config = await api<Config[]>('/admin/config', { headers: { Authorization: 'Bearer demo-admin-token' } });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin - Configuration</h1>
      <p className="text-sm text-slate-600">Centralized platform configuration for branding, integrations, SEO, and providers.</p>
      <ConfigManager />
      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Current Config Keys</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {config.map((entry) => (
            <li key={entry.key}>
              <span className="font-mono">{entry.key}</span> · Updated {new Date(entry.updatedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
