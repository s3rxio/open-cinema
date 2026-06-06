import { privatePageMetadata } from "@/shared/seo/metadata";

export const metadata = privatePageMetadata;

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
