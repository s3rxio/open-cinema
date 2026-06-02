"use client";

import { useQuery } from "@apollo/client/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Loader
} from "@open-cinema/ui";
import { ContentCard } from "./ContentCard";
import {
  GET_RECENT_CONTENT_QUERY,
  GET_TRENDING_CONTENT_QUERY
} from "@/shared/api/operations/catalog";
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

      {content?.hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setSkip(skip + take)}
            className="px-8 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            Загрузить ещё
          </button>
        </div>
      )}
    </div>
  );
}

function CatalogGrid({ items }: { items: ContentItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <ContentCard
          key={item.id}
          {...item}
          posterUrl={item.posterUrl ?? undefined}
        />
      ))}
    </div>
  );
}

function CatalogLoader() {
  return (
    <div className="flex justify-center py-12">
      <Loader size="lg" />
    </div>
  );
}
