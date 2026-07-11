import type { ChangeEvent } from "react";

import { PRODUCT_CATEGORIES } from "../../../types/product";

type ProductToolbarProps = {
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

function ProductToolbar({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}: ProductToolbarProps) {
  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    onSearchChange(event.target.value);
  };

  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    onCategoryChange(event.target.value);
  };

  return (
    <section className="product-toolbar">
      <div className="product-search-wrapper">
        <span>⌕</span>

        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search product name or category..."
        />
      </div>

      <select
        className="product-category-filter"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <option value="All">All Categories</option>

        {PRODUCT_CATEGORIES.map((category) => (
          <option value={category} key={category}>
            {category}
          </option>
        ))}
      </select>
    </section>
  );
}

export default ProductToolbar;
