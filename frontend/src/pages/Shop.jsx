import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { Filter, Grid3X3, List } from 'lucide-react';
import { setPageSeo } from '../utils/pageSeo';
import { categorySeoFor } from '../utils/categorySeo';
import { useGetCategoriesQuery } from '../services/storefrontApi';

const Shop = () => {
  const colorOptions = ['Beige', 'Black', 'Black and ivory', 'Black and pink', 'Black and white', 'Black, white and multicolour', 'Blue and black', 'Blue and multicolour', 'Blue and white', 'Blush pink', 'Blush pink and floral', 'Brown', 'Brown and black', 'Brown and cream', 'Burgundy', 'Champagne', 'Charcoal and blue', 'Charcoal and grey', 'Charcoal grey', 'Chocolate brown', 'Cobalt blue', 'Coral', 'Cream and multicolour', 'Cream and taupe', 'Emerald green', 'Fuchsia', 'Fuchsia pink', 'Gold', 'Green', 'Green and black', 'Grey', 'Hot pink', 'Ivory', 'Ivory and blue', 'Jade green', 'Lavender', 'Lilac', 'Mauve', 'Mint green', 'Mocha brown', 'Multicolour', 'Navy', 'Navy and black', 'Navy and multicolour', 'Navy and white', 'Navy blue', 'Olive and cream', 'Orange', 'Pale pink', 'Pink', 'Pink and black', 'Pink and gold', 'Pink and multicolour', 'Pink, yellow and blue', 'Powder blue', 'Purple', 'Purple and pink', 'Red', 'Red and black', 'Red and navy', 'Sage green', 'Slate grey', 'Taupe', 'Taupe and cream', 'Teal', 'Teal and cream', 'Teal and green', 'Teal and white', 'Teal blue', 'Turquoise', 'White', 'White and black', 'White and blue', 'White and orange', 'White and pastel', 'Wine red', 'Yellow and blue', 'Yellow and navy', 'Yellow and white'];
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const categorySlug = searchParams.get('category') || slug;
  const onSale = searchParams.get('on_sale');
  const search = searchParams.get('search');
  const [viewMode, setViewMode] = useState('grid');
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const { data: categories = [] } = useGetCategoriesQuery();

  const params = { limit: 100, sort };
  if (categorySlug) params.category = categorySlug;
  if (onSale) params.on_sale = 'true';
  if (search) params.search = search;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  if (color) params.color = color;

  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setColor(''); setSort('date_desc'); if (onSale || searchParams.has('color')) { const next = new URLSearchParams(searchParams); next.delete('on_sale'); next.delete('color'); setSearchParams(next); } };

  const { products, loading, error } = useProducts(params);
  const categoryName = categories.find(category => category.slug === categorySlug)?.name || (categorySlug ? categorySlug.replace(/-/g, ' ') : '');
  const categorySeo = useMemo(() => categorySlug ? categorySeoFor(categorySlug, categoryName) : null, [categorySlug, categoryName]);
  useEffect(() => {
    const title = search ? `Search women's clothing | LynMarie Boutique` : onSale ? `Sale on Women's Clothes in Kenya | LynMarie Boutique` : categorySeo?.title || `Shop Imported Women's Clothing in Kenya | LynMarie Boutique`;
    const description = search ? `Browse LynMarie Boutique results for ${search}. Explore imported women's dresses, jumpsuits, suits and fashion in Kenya.` : onSale ? `Shop sale styles at LynMarie Boutique in Nairobi. Find imported women's dresses, outfits and occasionwear at reduced prices while available.` : categorySeo?.description || `Shop imported women's clothes online in Kenya at LynMarie Boutique. Explore dresses, jumpsuits, trouser suits, tops and occasionwear at great prices.`;
    return setPageSeo({ title, description, path: categorySlug ? `/category/${categorySlug}` : '/shop', robots: search || onSale ? 'noindex,follow' : undefined });
  }, [categorySlug, categorySeo, search, onSale]);

  return (
    <div className="min-h-screen py-8 bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-2 tracking-wide">
              {search ? `Results for “${search}”` : onSale ? 'The Sale Edit' : categorySeo?.heading || 'Imported Women’s Clothing in Kenya'}
            </h1>
            <p className="text-gray-600 font-sans font-light tracking-wide">
              {loading ? 'Finding your next favourite...' : `${products.length} ${products.length === 1 ? 'style' : 'styles'}${search ? ` found for “${search}”` : ' available to explore'}`}
            </p>
            {!search && <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{categorySeo?.intro || 'Explore imported women’s fashion in Kenya, from elegant dresses and wedding guest outfits to jumpsuits, ladies’ trouser suits and everyday tops. Compare current prices, sizes and colours, then shop online or collect from our Nairobi boutique.'}</p>}
            {!search && categorySeo?.related?.length > 0 && <nav aria-label="Related clothing collections" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">{categorySeo.related.map(item => <Link key={item.slug} to={`/category/${item.slug}`} className="text-purple-800 underline underline-offset-4">{item.label}</Link>)}</nav>}
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <label className="flex items-center gap-2 px-3 py-2 border border-purple-200 rounded-lg bg-white font-sans text-sm">
              <Filter className="w-5 h-5" />
              <span className="sr-only">Sort products</span><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent outline-none"><option value="date_desc">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="title_asc">Name: A to Z</option><option value="popularity_desc">Popular</option></select>
            </label>
            <div className="flex border-2 border-purple-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#4c00b0] text-white' : 'hover:bg-purple-100'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#4c00b0] text-white' : 'hover:bg-purple-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-7 rounded-xl border border-purple-100 bg-white/80 p-4">
          <label className="grid gap-1 text-xs text-gray-600">Minimum price <input aria-label="Minimum price" type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-32 rounded-md border border-purple-200 px-3 py-2" placeholder="KES 0" /></label>
          <label className="grid gap-1 text-xs text-gray-600">Maximum price <input aria-label="Maximum price" type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-32 rounded-md border border-purple-200 px-3 py-2" placeholder="No limit" /></label>
          <label className="grid gap-1 text-xs text-gray-600">Color <select aria-label="Filter by color" value={color} onChange={e => setColor(e.target.value)} className="min-w-36 rounded-md border border-purple-200 bg-white px-3 py-2"><option value="">Any color</option>{colorOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
          {(minPrice || maxPrice || onSale || color) && <button type="button" onClick={clearFilters} className="rounded-md px-3 py-2 text-sm text-purple-800 underline">Clear filters</button>}
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="large" label={categorySlug ? 'Loading this collection' : 'Loading styles'} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 tracking-wide">No products found</h2>
            <p className="text-gray-600 font-sans font-light mb-6">We couldn't find any products matching your criteria.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
