import "./global.css";
import { AppProviders } from "./providers";

export const metadata = {
  title: "Open Cinema",
  description: "Catalog + player"
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
