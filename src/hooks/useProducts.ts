import { useCallback, useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/productService";

import type {
  Product,
  ProductFormData,
} from "../types/product";

type UseProductsReturn = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: ProductFormData) => Promise<string>;
  editProduct: (
    productId: string,
    productData: Partial<ProductFormData>
  ) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
};

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const productList = await getProducts();

      setProducts(productList);
    } catch (caughtError) {
      console.error("Failed to load products:", caughtError);

      setError("Products could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const addProduct = async (
    productData: ProductFormData
  ): Promise<string> => {
    try {
      setError(null);

      const productId = await createProduct(productData);

      await refreshProducts();

      return productId;
    } catch (caughtError) {
      console.error("Failed to create product:", caughtError);

      setError("Product could not be created.");

      throw caughtError;
    }
  };

  const editProduct = async (
    productId: string,
    productData: Partial<ProductFormData>
  ): Promise<void> => {
    try {
      setError(null);

      await updateProduct(productId, productData);

      await refreshProducts();
    } catch (caughtError) {
      console.error("Failed to update product:", caughtError);

      setError("Product could not be updated.");

      throw caughtError;
    }
  };

  const removeProduct = async (
    productId: string
  ): Promise<void> => {
    try {
      setError(null);

      await deleteProduct(productId);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== productId
        )
      );
    } catch (caughtError) {
      console.error("Failed to delete product:", caughtError);

      setError("Product could not be deleted.");

      throw caughtError;
    }
  };

  return {
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    editProduct,
    removeProduct,
  };
};
