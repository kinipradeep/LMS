import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'CyberCert LMS',
  description: 'Cybersecurity certification learning platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </body>
    </html>
  );
}
