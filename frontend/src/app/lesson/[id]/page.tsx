import { api } from '@/lib/api';

type Lesson = {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
};

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await api<Lesson>(`/lessons/${id}`, { headers: { Authorization: `Bearer demo-token` } });

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe src={lesson.videoUrl} className="h-full w-full" allowFullScreen title={lesson.title} />
      </div>
      <article className="prose max-w-none rounded bg-white p-4" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      <button className="rounded bg-green-700 px-4 py-2 text-white">Mark Complete</button>
    </section>
  );
}
