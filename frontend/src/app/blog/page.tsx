import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Cybersecurity Insights & Exam Tips',
  description:
    'Expert articles on CISSP, CISM, CRISC, CCSP certifications, cybersecurity trends, and career guidance.',
};

async function getPosts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/cms/posts?published=true`,
    { next: { revalidate: 300 } } // ISR — revalidate every 5 min
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Cybersecurity Blog</h1>
        <p className="mt-2 text-gray-500">
          Insights, study guides, and career advice for IT and security professionals.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts yet. Check back soon!</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {post.coverImageUrl && (
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="mb-4 h-40 w-full rounded-lg object-cover"
                />
              )}
              <div className="flex flex-wrap gap-1 mb-2">
                {post.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500 line-clamp-3">{post.excerpt}</p>
              <time className="mt-3 block text-xs text-gray-400">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </time>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
