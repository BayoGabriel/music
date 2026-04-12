export type SongDocument = {
  id: string;
  title: string;
  artist: string;
  fileUrl: string;
  coverImageUrl: string;
  duration: number;
  isActive: boolean;
  createdAt: Date;
};
