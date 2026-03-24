'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function CreatorStudio() {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('CISSP Domain Practice Quiz');
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'claude'>('openai');
  const [domain, setDomain] = useState('Access Control');
  const [result, setResult] = useState('');

  const generateQuiz = async () => {
    setResult('Generating quiz...');
    const response = await fetch(`${API_URL}/creator/quizzes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer demo-trainer-token'
      },
      body: JSON.stringify({
        provider,
        courseId,
        title,
        duration: 45,
        domain,
        questionCount: 10,
        difficulty: 'medium'
      })
    });

    const text = await response.text();
    setResult(response.ok ? `Generated successfully: ${text}` : `Generation failed: ${text}`);
  };

  return (
    <div className="rounded border bg-white p-4">
      <h2 className="text-lg font-semibold">AI Quiz Engine</h2>
      <p className="mt-1 text-sm text-slate-600">Generate quiz sets with OpenAI, Gemini, or Claude.</p>
      <div className="mt-3 grid gap-3">
        <input value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded border p-2 text-sm" placeholder="Course UUID" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded border p-2 text-sm" placeholder="Quiz title" />
        <input value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded border p-2 text-sm" placeholder="Domain" />
        <select value={provider} onChange={(e) => setProvider(e.target.value as 'openai' | 'gemini' | 'claude')} className="rounded border p-2 text-sm">
          <option value="openai">OpenAI (ChatGPT)</option>
          <option value="gemini">Google Gemini</option>
          <option value="claude">Anthropic Claude</option>
        </select>
        <button onClick={generateQuiz} className="w-fit rounded bg-cyan-700 px-4 py-2 text-white">Generate and Save Quiz</button>
        <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs">{result}</pre>
      </div>
    </div>
  );
}
