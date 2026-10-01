import { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import Loader from '../components/ui/Loader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { Filter, Grid3X3, List } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const categorySlug = searchParams.get('category') || slug;
  const onSale = searchParams.get('on_sale');
  const search = searchParams.get('search');
  const [viewMode, setViewMode] = useState('grid');
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const params = { limit: 100, sort };
  if (categorySlug) params.category = categorySlug;
  if (onSale) params.on_sale = 'true';
  if (search) params.search = search;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;

  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); setSort('date_desc'); if (onSale) { const next = new URLSearchParams(searchParams); next.delete('on_sale'); setSearchParams(next); } };

  const { products, loading, error } = useProducts(params);

  return (
    <div className="min-h-screen py-8 bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-2 tracking-wide">
              {search ? `Search: "${search}"` : onSale ? 'The Sale Edit' : categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ') : 'Shop All'}
            </h1>
            <p className="text-gray-600 font-sans font-light tracking-wide">
              {loading ? 'Loading products...' : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} found${search ? ` for “${search}”` : ''}`}
            </p>
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
          {(minPrice || maxPrice || onSale) && <button type="button" onClick={clearFilters} className="rounded-md px-3 py-2 text-sm text-purple-800 underline">Clear filters</button>}
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="large" />
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
