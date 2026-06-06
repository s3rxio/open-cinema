import "@/app/styles/global.css";
import { AppProviders } from "@/app/providers";
import { rootMetadata } from "@/shared/seo/metadata";
import { WebSiteJsonLd } from "@/shared/seo/json-ld";
import { YandexMetrika } from "@/shared/seo/yandex-metrika";

export const metadata = rootMetadata;

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
        <WebSiteJsonLd />
        <YandexMetrika />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
