import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

async function getPost(slug: string) {
  const res = await fetch(`${API}/cms/posts/${slug}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="mb-8 h-64 w-full rounded-2xl object-cover"
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags?.map((tag: string) => (
          <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {tag}
          </span>
        ))}
      </div>

      <h1 className="text-4xl font-bold text-gray-900 leading-tight">{post.title}</h1>

      <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
        {post.author?.name && <span>By {post.author.name}</span>}
        <span>·</span>
        <time>
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </time>
      </div>

      <div
        className="prose prose-blue max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
