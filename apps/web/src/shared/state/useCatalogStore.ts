import { create } from "zustand";

export type CatalogTab = "new" | "popular";

type CatalogState = {
  tab: CatalogTab;
  setTab: (tab: CatalogTab) => void;
};

export const useCatalogStore = create<CatalogState>(set => ({
  tab: "new",
  setTab: tab => set({ tab })
}));
