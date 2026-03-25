'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function CoursePublisher() {
  const [payload, setPayload] = useState({
    title: 'CRISC Masterclass',
    slug: 'crisc-masterclass',
    description: 'Risk and control deep-dive for certification readiness.',
    price: 14999,
    thumbnail: '',
    published: false
  });
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState('');

  const createCourse = async () => {
    setStatus('Creating course...');
    const response = await fetch(`${API_URL}/creator/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-trainer-token'
      },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    setStatus(response.ok ? `Created: ${text}` : `Failed: ${text}`);
  };

  const publishCourse = async (published: boolean) => {
    setStatus(published ? 'Publishing...' : 'Unpublishing...');
    const response = await fetch(`${API_URL}/creator/courses/${courseId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-trainer-token'
      },
      body: JSON.stringify({ published })
    });
    const text = await response.text();
    setStatus(response.ok ? `Updated: ${text}` : `Failed: ${text}`);
  };

  return (
    <div className="rounded border bg-white p-4">
      <h2 className="text-lg font-semibold">Course Creation & Publishing</h2>
      <div className="mt-3 grid gap-2">
        <input className="rounded border p-2 text-sm" value={payload.title} onChange={(e) => setPayload((p) => ({ ...p, title: e.target.value }))} />
        <input className="rounded border p-2 text-sm" value={payload.slug} onChange={(e) => setPayload((p) => ({ ...p, slug: e.target.value }))} />
        <textarea className="rounded border p-2 text-sm" value={payload.description} onChange={(e) => setPayload((p) => ({ ...p, description: e.target.value }))} />
        <input className="rounded border p-2 text-sm" type="number" value={payload.price} onChange={(e) => setPayload((p) => ({ ...p, price: Number(e.target.value) }))} />
        <button onClick={createCourse} className="w-fit rounded bg-slate-900 px-4 py-2 text-white">Create Course</button>
      </div>
      <div className="mt-4 grid gap-2">
        <input className="rounded border p-2 text-sm" placeholder="Course ID for publish" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={() => publishCourse(true)} className="rounded bg-green-700 px-3 py-2 text-white">Publish</button>
          <button onClick={() => publishCourse(false)} className="rounded bg-amber-600 px-3 py-2 text-white">Unpublish</button>
        </div>
      </div>
      <pre className="mt-3 overflow-x-auto rounded bg-slate-100 p-3 text-xs">{status}</pre>
    </div>
  );
}
