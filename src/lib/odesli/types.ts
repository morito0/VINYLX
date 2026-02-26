export interface OdesliResponse {
  entityUniqueId: string;
  userCountry: string;
  pageUrl: string;
  linksByPlatform: Record<
    string,
    {
      url: string;
      entityUniqueId: string;
    }
  >;
  entitiesByUniqueId: Record<
    string,
    {
      id: string;
      type: string;
      title?: string;
      artistName?: string;
      thumbnailUrl?: string;
      thumbnailWidth?: number;
      thumbnailHeight?: number;
      apiProvider: string;
      platforms: string[];
    }
  >;
}
