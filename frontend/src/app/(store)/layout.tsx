import Navbar from '@/components/layout/Navbar';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50">{children}</main>
    </>
  );
}
