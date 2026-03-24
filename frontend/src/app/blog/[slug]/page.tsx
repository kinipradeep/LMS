import { api } from '@/lib/api';

type Post = { title: string; content: unknown };

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await api<Post>(`/pages/${slug}`);

  return (
    <article className="rounded bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{page.title}</h1>
      <pre className="mt-4 overflow-x-auto rounded bg-slate-100 p-4 text-sm">{JSON.stringify(page.content, null, 2)}</pre>
    </article>
  );
}
