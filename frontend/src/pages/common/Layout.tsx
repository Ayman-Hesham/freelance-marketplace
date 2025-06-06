import { Navbar } from '../../components/common/NavBar';

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