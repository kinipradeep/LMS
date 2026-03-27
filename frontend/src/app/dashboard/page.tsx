import Link from 'next/link';
import { api } from '@/lib/api';

type Course = { id: string; title: string };
type Certificate = {
  id: string;
  certificateNo: string;
  issuedAt: string;
  verificationUrl: string;
  quiz: { title: string; course: { title: string } };
  shareLinks: { linkedin: string; facebook: string; x: string; whatsapp: string };
};

export default async function DashboardPage() {
  const courses = await api<Course[]>('/my-courses', { headers: { Authorization: `Bearer demo-token` } });
  const certificates = await api<Certificate[]>('/my-certificates', {
    headers: { Authorization: `Bearer demo-token` }
  }).catch(() => []);

export default async function DashboardPage() {
  const courses = await api<Course[]>('/my-courses', { headers: { Authorization: `Bearer demo-token` } });

  return (
    <section>
      <h1 className="mb-5 text-2xl font-bold">My Courses</h1>
      <div className="space-y-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/course/${course.id}`} className="block rounded border bg-white p-4 hover:shadow-sm">
            {course.title}
          </Link>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-xl font-semibold">My Certificates</h2>
      <div className="space-y-3">
        {certificates.length === 0 && (
          <p className="rounded border border-dashed bg-slate-50 p-4 text-sm text-slate-600">
            No certificates yet. Pass a quiz with 70%+ and generate your certificate.
          </p>
        )}
        {certificates.map((certificate) => (
          <div key={certificate.id} className="rounded border bg-white p-4">
            <p className="font-medium">{certificate.quiz.course.title} — {certificate.quiz.title}</p>
            <p className="text-sm text-slate-600">Certificate #{certificate.certificateNo}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <a className="rounded border px-3 py-1" href={certificate.verificationUrl}>View</a>
              <a className="rounded border px-3 py-1" href={certificate.shareLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="rounded border px-3 py-1" href={certificate.shareLinks.facebook} target="_blank" rel="noreferrer">Facebook</a>
              <a className="rounded border px-3 py-1" href={certificate.shareLinks.x} target="_blank" rel="noreferrer">X</a>
              <a className="rounded border px-3 py-1" href={certificate.shareLinks.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
