import { CreatorStudio } from '@/components/admin/CreatorStudio';

export default function AdminQuizzesPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Trainer/Admin Quiz Studio</h1>
      <p className="text-sm text-slate-600">Create quizzes with AI models and persist directly to the LMS quiz bank.</p>
      <CreatorStudio />
    </section>
  );
}
