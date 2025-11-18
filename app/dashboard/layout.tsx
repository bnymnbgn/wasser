export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))]">
      {children}
    </div>
  );
}
