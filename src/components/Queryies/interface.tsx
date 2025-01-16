interface VideosData {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: User;
  videoUrl: string;
  video_pictures: VideoPicture[];
  video_files:string;
}
interface VideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number | null;
  height: number | null;
  link: string;
}
interface VideoPicture {
  id: number;
  picture: string;
  nr: number;
}

interface User {
  id: number;
  name: string;
  url: string;
}

export type { VideosData };
