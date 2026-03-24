import Link from 'next/link';
import { api } from '@/lib/api';

type Post = { id: string; title: string; slug: string; createdAt: string };

export default async function BlogPage() {
  const posts = await api<Post[]>('/posts');

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Blog</h1>
      <div className="space-y-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded border bg-white p-4 hover:shadow-sm">
            <h2 className="font-semibold">{post.title}</h2>
            <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
