import type { Timestamp } from "firebase/firestore";

export const PRODUCT_CATEGORIES = [
  "T-Shirt",
  "Dress",
  "Pants",
  "Shoes",
  "Bags",
  "Accessories",
] as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Free Size",
] as const;

export type ProductSize =
  (typeof PRODUCT_SIZES)[number];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: ProductCategory;
  sizes: ProductSize[];
  stock: number;
  isActive: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: ProductCategory;
  sizes: ProductSize[];
  stock: number;
  isActive: boolean;
}