export enum ContentType {
  MOVIE = "MOVIE",
  SERIES = "SERIES"
}

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  releaseDate: Date;
  rating: number;
  type: ContentType;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface SearchResult {
  items: SearchResultItem[];
  total: number;
  hasMore: boolean;
}

export interface CreateContentData {
  title: string;
  description: string;
  releaseDate: Date;
  genre?: string;
  director?: string;
  rating: number;
}

export type UpdateContentData = Partial<CreateContentData>;
