import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/blog', label: 'Blog' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin', label: 'Admin' }
];

export function Navbar() {
  return (
    <header className="border-b bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="font-bold text-cyan-300">CyberCert LMS</Link>
        <div className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-cyan-300">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
