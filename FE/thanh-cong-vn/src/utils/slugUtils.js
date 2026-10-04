/**
 * Helper to convert Vietnamese string to clean slug
 */
export function toSlug(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Resolve product slug or fallback to generated slug from name, then ID
 */
export function getProductSlugOrId(product) {
  if (!product) return "";
  if (typeof product === "string") return product;
  return product.slug || (product.name ? toSlug(product.name) : product.id) || "";
}

/**
 * Get full product link
 */
export function getProductPath(product) {
  const target = getProductSlugOrId(product);
  return target ? `/san-pham/${target}` : "/san-pham";
}
