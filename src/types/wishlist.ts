import type { ProductListItem } from './product';

export interface WishlistItem extends ProductListItem {
  wishlist_id: number;
}
