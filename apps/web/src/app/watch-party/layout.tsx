export default function WatchPartyLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-zinc-950">
      {children}
    </div>
  );
}
