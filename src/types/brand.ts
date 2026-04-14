export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  cover: string;
  description: string | null;
  products_count: number;
  is_active: boolean | null;
  sort_number: number;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  linkedin: string | null;
  pinterest: string | null;
}
