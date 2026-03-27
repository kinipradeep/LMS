'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function ConfigManager() {
  const [key, setKey] = useState('site.branding');
  const [value, setValue] = useState('{"platformName":"CyberCert LMS"}');
  const [message, setMessage] = useState('');

  const save = async () => {
    setMessage('Saving...');
    const response = await fetch(`${API_URL}/admin/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-admin-token'
      },
      body: JSON.stringify({ key, value: JSON.parse(value) })
    });

    setMessage(response.ok ? 'Saved config successfully.' : 'Failed to save config.');
  };

  return (
    <div className="rounded border bg-white p-4">
      <h2 className="text-lg font-semibold">Update Configuration</h2>
      <div className="mt-3 grid gap-3">
        <input value={key} onChange={(e) => setKey(e.target.value)} className="rounded border p-2 text-sm" placeholder="config key" />
        <textarea value={value} onChange={(e) => setValue(e.target.value)} className="min-h-32 rounded border p-2 font-mono text-sm" />
        <button onClick={save} className="w-fit rounded bg-slate-900 px-4 py-2 text-white">Save Config</button>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}
