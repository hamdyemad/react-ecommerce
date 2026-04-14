export interface Slider {
  id: number;
  image?: string;
  media_type: 'image' | 'video';
  media_url: string;
  title: string | null;
  description: string | null;
  slider_link: string;
  created_at: string;
  updated_at: string;
}
