import { Navbar } from '../components/NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <main className="mt-4">
        {children}
      </main>
    </>
  );
}