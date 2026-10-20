import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useGetCategoriesQuery } from '../services/storefrontApi';
import { categoryArtwork } from '../utils/categoryArtwork';
import Loader from './ui/Loader';

export default function CollectionSection() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const featuredSlugs = ['dresses', 'office-wear', 'evening-dinner-dresses', 'two-piece-sets', 'bags', 'kidswear'];
  const collections = useMemo(() => {
    const available = new Map(categories.filter(category => category._count?.products > 0).map(category => [category.slug, category]));
    return featuredSlugs.map(slug => available.get(slug)).filter(Boolean);
  }, [categories]);

  return (
    <section className="collection-section py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="collection-heading mb-8">
          <div>
              <span className="section-kicker">THE LYNMARIE EDIT · NAIROBI</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-serif font-bold text-purple-950 tracking-wide">
              Shop by category
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600 font-sans">
              Explore dresses, polished workwear, occasion looks and more, with styles selected for our shoppers in Kenya.
            </p>
          </div>
          <Link to="/collections" className="collection-heading-link">View all categories <ArrowRight size={15} /></Link>
        </div>

        {isLoading ? (
          <div className="min-h-48 grid place-items-center"><Loader size="medium" label="Loading categories" /></div>
        ) : collections.length ? (
          <div className="collection-grid">
            {collections.map((category, index) => {
              const artwork = categoryArtwork(category);
              return (
              <Link key={category.id} to={`/category/${category.slug}`} className="collection-card group" style={{ '--collection-order': index }}>
                <div className="collection-card-image">
                  <img src={artwork.src} style={{ objectPosition: artwork.position }} alt={artwork.alt} loading="lazy" decoding="async" />
                  <span className="collection-card-count">{category._count.products} {category._count.products === 1 ? 'style' : 'styles'}</span>
                </div>
                <div className="collection-card-copy">
                  <span className="collection-card-eyebrow">SHOP THE EDIT</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <span className="collection-shop-link">Explore styles <ArrowRight size={16} /></span>
                </div>
              </Link>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-600">Collections will appear here soon.</p>
        )}

        <Link to="/collections" className="collection-see-more">See more collections <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}
