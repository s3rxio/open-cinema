export default function WatchLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-black">{children}</div>
  );
}
