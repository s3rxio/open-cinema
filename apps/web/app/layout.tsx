import "@/app/styles/global.css";
import { AppProviders } from "@/app/providers";

export const metadata = {
  title: "Open Cinema",
  description: "Catalog + player"
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
