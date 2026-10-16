import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useGetCategoriesQuery } from '../services/storefrontApi';
import { categoryArtwork } from '../utils/categoryArtwork';
import { usePageSeo } from '../hooks/usePageSeo';

const collectionsSeo = { title: "Women's Clothing Collections in Kenya | LynMarie Boutique", description: "Browse LynMarie Boutique clothing collections in Nairobi, Kenya. Shop imported dresses, wedding wear, two-piece trouser suits, tops and sale styles at great prices.", path: '/collections' };

export default function Collections() {
  usePageSeo(collectionsSeo);
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const collections = categories.filter(category => category._count?.products > 0);

  return (
    <div className="collections-page">
      <header className="collections-page-heading">
        <span className="section-kicker collections-page-kicker">STYLE, COMFORT, CONFIDENCE</span>
        <h1 className="collections-page-title">Find your collection</h1>
        <p className="collections-page-intro">Explore imported women’s clothing in Nairobi and shop online across Kenya. Find occasion dresses, wedding guest looks, two-piece trouser suits, tops and current sale styles, with prices and available sizes shown on each piece.</p>
      </header>
      <div className="collections-page-grid">
        {collections.map((category, index) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="collection-card collections-page-card group"
            style={{ animationDelay: `${Math.min(index, 7) * 65}ms` }}
          >
            <div className="collection-card-image">
              <img src={categoryArtwork(category)} alt={`${category.name} women’s clothing collection from LynMarie Boutique in Nairobi, Kenya`} loading="lazy" decoding="async" />
              <span className="collection-card-count">{category._count.products} {category._count.products === 1 ? 'piece' : 'pieces'}</span>
            </div>
            <div className="collection-card-copy">
              <span className="collection-card-eyebrow">THE LYNMARIE EDIT</span>
              <h2>{category.name}</h2>
              <span className="collection-shop-link">Explore collection <ArrowRight size={16} /></span>
            </div>
          </Link>
        ))}
      </div>
      {!isLoading && !collections.length && <p className="py-12 text-center text-gray-600">There are no collections to show yet.</p>}
    </div>
  );
}
