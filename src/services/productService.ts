import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import type { Product, ProductFormData } from "../types/product";

const PRODUCTS_COLLECTION = "products";

/**
 * Get all products
 * Latest products will appear first.
 */
export const getProducts = async (): Promise<Product[]> => {
  const productsQuery = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(productsQuery);

  return snapshot.docs.map((productDocument) => ({
    id: productDocument.id,
    ...productDocument.data(),
  })) as Product[];
};

/**
 * Get one product by Firestore document ID.
 */
export const getProductById = async (
  productId: string
): Promise<Product | null> => {
  const productReference = doc(
    db,
    PRODUCTS_COLLECTION,
    productId
  );

  const productSnapshot = await getDoc(productReference);

  if (!productSnapshot.exists()) {
    return null;
  }

  return {
    id: productSnapshot.id,
    ...productSnapshot.data(),
  } as Product;
};

/**
 * Create a new product.
 */
export const createProduct = async (
  productData: ProductFormData
): Promise<string> => {
  const productReference = await addDoc(
    collection(db, PRODUCTS_COLLECTION),
    {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return productReference.id;
};

/**
 * Update an existing product.
 */
export const updateProduct = async (
  productId: string,
  productData: Partial<ProductFormData>
): Promise<void> => {
  const productReference = doc(
    db,
    PRODUCTS_COLLECTION,
    productId
  );

  await updateDoc(productReference, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a product permanently.
 */
export const deleteProduct = async (
  productId: string
): Promise<void> => {
  const productReference = doc(
    db,
    PRODUCTS_COLLECTION,
    productId
  );

  await deleteDoc(productReference);
};