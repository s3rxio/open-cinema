"use client";

import { useQuery } from "@apollo/client/react";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Loader
} from "@open-cinema/ui";
import { ContentCard, CONTENT_CARD_GRID_CLASS } from "@/entities/content";
import { useContentCardBookmark } from "@/entities/favorite";
import {
  GET_RECENT_CONTENT_QUERY,
  GET_TRENDING_CONTENT_QUERY
} from "@/entities/catalog";
import { useState } from "react";
import type { ContentItem } from "@/shared/api/operation-types";

export function CatalogList() {
  const [tab, setTab] = useState<"new" | "popular">("new");
  const [skip, setSkip] = useState(0);
  const take = 20;

  const recentContentQuery = useQuery(GET_RECENT_CONTENT_QUERY, {
    variables: { skip, take },
    skip: tab !== "new"
  });

  const trendingContentQuery = useQuery(GET_TRENDING_CONTENT_QUERY, {
    variables: { skip, take },
    skip: tab !== "popular"
  });

  const isLoading =
    tab === "new" ? recentContentQuery.loading : trendingContentQuery.loading;
  const content =
    tab === "new"
      ? recentContentQuery.data?.getRecentContent
      : trendingContentQuery.data?.getTrendingContent;
  const items = content?.items || [];

  return (
    <div className="space-y-6">
      <Tabs
        value={tab}
        onValueChange={value => {
          setTab(value as "new" | "popular");
          setSkip(0);
        }}
      >
        <TabsList>
          <TabsTrigger value="new">Новинки</TabsTrigger>
          <TabsTrigger value="popular">Популярные</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          {recentContentQuery.loading && <CatalogLoader />}
          {recentContentQuery.data && <CatalogGrid items={items} />}
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          {trendingContentQuery.loading && <CatalogLoader />}
          {trendingContentQuery.data && <CatalogGrid items={items} />}
        </TabsContent>
      </Tabs>

      {content?.hasMore === true && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setSkip(skip + take)}>
            Загрузить ещё
          </Button>
        </div>
      )}
    </div>
  );
}

function CatalogGrid({ items }: { items: ContentItem[] }) {
  return (
    <div className={CONTENT_CARD_GRID_CLASS}>
      {items.map(item => (
        <CatalogContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function CatalogContentCard({ item }: { item: ContentItem }) {
  const bookmark = useContentCardBookmark(item.id, item.type);

  return <ContentCard {...item} {...bookmark} fluid />;
}

function CatalogLoader() {
  return (
    <div className="flex justify-center py-12">
      <Loader size="lg" />
    </div>
  );
}
