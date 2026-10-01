export function productDto(p) {
  if (!p) return p;
  const price = Number(p.price ?? 0);
  const regular = Number(p.regularPrice ?? p.price ?? 0);
  const sale = p.salePrice == null ? "" : String(p.salePrice);
  return {
    id: p.id, wordpressId: p.wordpressId, name: p.name, slug: p.slug,
    description: p.description, short_description: p.shortDescription, metaTitle: p.metaTitle, metaDescription: p.metaDescription,
    sku: p.sku, price: String(price), regular_price: String(regular), sale_price: sale,
    prices: { price: Math.round(price * 100), regular_price: Math.round(regular * 100) },
    status: p.status.toLowerCase(), featured: p.featured, purchasable: p.purchasable,
    manage_stock: p.manageStock, stock_quantity: p.stockQuantity,
    stock_status: p.stockStatus === "IN_STOCK" ? "instock" : p.stockStatus === "ON_BACKORDER" ? "onbackorder" : "outofstock",
    on_sale: p.salePrice != null && Number(p.salePrice) < regular,
    images: (p.images || []).map(i => ({ id: i.wordpressId ?? i.id, src: i.url, thumbnail: i.thumbnailUrl, alt: i.altText || "", name: i.name })),
    categories: (p.categories || []).map(x => x.category), tags: (p.tags || []).map(x => x.tag),
    brands: p.brand ? [p.brand] : [],
    attributes: (p.attributes || []).map(a => ({ name: a.attribute.name, slug: a.attribute.slug, visible: a.visible, options: [a.value] })),
    average_rating: String(p.averageRating ?? 0), rating_count: p.ratingCount ?? 0,
    createdAt: p.createdAt,
  };
}
