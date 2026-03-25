import Link from 'next/link';
import { api } from '@/lib/api';

type Certificate = {
  id: string;
  certificateNo: string;
  issuedAt: string;
  user: { name: string };
  verificationUrl: string;
  quiz: { title: string; course: { title: string } };
  shareLinks: { linkedin: string; facebook: string; x: string; whatsapp: string };
};

export default async function VerifyCertificatePage({
  params
}: {
  params: Promise<{ verificationCode: string }>;
}) {
  const { verificationCode } = await params;
  const certificate = await api<Certificate>(`/certificates/verify/${verificationCode}`);

  return (
    <section className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-emerald-700">Verified Certificate</p>
      <h1 className="mt-3 text-center text-3xl font-bold text-slate-900">{certificate.quiz.course.title}</h1>
      <p className="mt-6 text-center text-slate-600">This certifies that</p>
      <p className="mt-2 text-center text-2xl font-semibold">{certificate.user.name}</p>
      <p className="mt-4 text-center text-slate-700">
        has successfully completed <strong>{certificate.quiz.title}</strong>.
      </p>
      <p className="mt-6 text-center text-sm text-slate-500">
        Certificate #{certificate.certificateNo} • Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm">
        <a className="rounded border px-3 py-1" href={certificate.shareLinks.linkedin} target="_blank" rel="noreferrer">Share on LinkedIn</a>
        <a className="rounded border px-3 py-1" href={certificate.shareLinks.facebook} target="_blank" rel="noreferrer">Share on Facebook</a>
        <a className="rounded border px-3 py-1" href={certificate.shareLinks.x} target="_blank" rel="noreferrer">Share on X</a>
        <a className="rounded border px-3 py-1" href={certificate.shareLinks.whatsapp} target="_blank" rel="noreferrer">Share on WhatsApp</a>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Verification URL: <span className="font-mono">{certificate.verificationUrl}</span>
      </div>

      <div className="mt-4 text-center">
        <Link href="/dashboard" className="text-sm text-cyan-700 underline">Back to Dashboard</Link>
      </div>
    </section>
  );
}
