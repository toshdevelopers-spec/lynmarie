import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useGetCategoriesQuery } from '../services/storefrontApi';
import { categoryArtwork } from '../utils/categoryArtwork';

export default function Collections() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const collections = categories.filter(category => category._count?.products > 0);

  return (
    <div className="collections-page">
      <header className="collections-page-heading">
        <span className="section-kicker">STYLE, COMFORT, CONFIDENCE</span>
        <h1>Find your collection</h1>
        <p>Explore every edit, thoughtfully chosen for the way you want to feel.</p>
      </header>
      <div className="collections-page-grid">
        {collections.map(category => (
          <Link key={category.id} to={`/category/${category.slug}`} className="collection-card group">
            <div className="collection-card-image">
              <img src={categoryArtwork(category)} alt={`${category.name} collection`} loading="lazy" decoding="async" />
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
