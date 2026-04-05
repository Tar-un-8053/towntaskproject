import { ReactNode } from 'react';
import TopNav from './TopNav';
import Footer from './Footer';
import EmergencyFab from '../common/EmergencyFab';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1">{children}</main>
      <EmergencyFab />
      <Footer />
    </div>
  );
}

