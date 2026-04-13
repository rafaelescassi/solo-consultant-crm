import { PortalHeader } from '@/components/portal/portal-header';
import { PortalSidebar } from '@/components/portal/portal-sidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="hidden xl:block xl:w-64 xl:fixed xl:inset-y-0 border-r border-border">
        <PortalSidebar />
      </div>
      <div className="xl:pl-64 flex flex-col min-h-screen">
        <PortalHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
