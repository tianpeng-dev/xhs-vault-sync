export interface XhsMedia {
  url: string;
  type: "image" | "video";
  ext?: string;
  localPath?: string;
}

export interface XhsNote {
  id: string;
  title: string;
  author: string;
  url: string;
  tags: string[];
  content: string;
  createdAt?: string;
  updatedAt?: string;
  media: XhsMedia[];
}

export interface BookmarkPage {
  notes: Array<{
    noteId: string;
    xsecToken: string;
  }>;
  cursor: string;
  hasMore: boolean;
}
