export const PRODUCT_CATEGORIES = [
  "T-Shirt",
  "Blouse",
  "Shirt",
  "Dress",
  "Skirt",
  "Short Skirt",
  "Long Skirt",
  "Pants",
  "Jeans",
  "Shorts",
  "Leggings",
  "Jumpsuit",
  "Two-Piece Set",
  "Jacket",
  "Cardigan",
  "Sweater",
  "Coat",
  "Shoes",
  "Sandals",
  "Bags",
  "Accessories",
] as const;

export const PRODUCT_SIZES = [
  "Free Size",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
] as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[number];

export type ProductSize =
  (typeof PRODUCT_SIZES)[number];
  export type Product = {
  id: string;
  name: string;
  price: number;
  regularPrice?: number;
  livePrice?: number;
  stock?: number;
  category?: ProductCategory;
  sizes?: ProductSize[];
  image?: string;
  image2?: string;
  image3?: string;
  image4?: string;
};
export type ProductFormData = {
  name: string;
  price: number;
  regularPrice?: number;
  livePrice?: number;
  stock?: number;
  category?: ProductCategory;
  sizes?: ProductSize[];
  image?: string;
  image2?: string;
  image3?: string;
  image4?: string;
};