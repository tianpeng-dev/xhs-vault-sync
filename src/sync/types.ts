export interface XhsMedia {
  url: string;
  type: "image" | "video";
  ext?: string;
  localPath?: string;
}

export interface XhsComment {
  author: string;
  content: string;
  createdAt?: string;
  likes?: string;
}

export interface XhsNote {
  id: string;
  title: string;
  author: string;
  url: string;
  tags: string[];
  content: string;
  syncIndex?: number;
  syncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  media: XhsMedia[];
  comments?: XhsComment[];
}

export interface BookmarkPage {
  notes: Array<{
    noteId: string;
    xsecToken: string;
    title?: string;
    author?: string;
    coverUrl?: string;
    noteType?: string;
  }>;
  cursor: string;
  hasMore: boolean;
  debug: {
    topLevelKeys: string[];
    dataKeys: string[];
    noteCount: number;
    hasMore: boolean;
    cursorPresent: boolean;
    codeType: string;
    codeValue?: string;
    messagePresent: boolean;
    messagePreview?: string;
    tokenCount?: number;
    sourceSummary?: string;
    itemKeySummary?: string;
    cardKeySummary?: string;
  };
}
