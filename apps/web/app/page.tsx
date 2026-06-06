import { buildPageMetadata } from "@/shared/seo/metadata";
import { SITE_NAME } from "@/shared/seo/site";
import { HomePage } from "@/pages/home";

export const metadata = buildPageMetadata({
  title: `${SITE_NAME} — онлайн-кинотеатр`,
  description:
    "Смотрите фильмы и сериалы онлайн: популярное, новинки, каталог с фильтрами, избранное и совместный просмотр.",
  path: "/",
  absoluteTitle: true
});

export default HomePage;
