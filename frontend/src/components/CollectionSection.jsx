import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetCategoriesQuery } from '../services/storefrontApi';
import { categoryArtwork } from '../utils/categoryArtwork';

export default function CollectionSection() {
  const { data: categories = [] } = useGetCategoriesQuery();
  const track = useRef(null);
  const collections = useMemo(
    () => categories.filter(category => category._count?.products > 0),
    [categories],
  );

  const scroll = direction => {
    track.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  return (
    <section className="collection-section py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="collection-heading mb-8">
          <div>
            <span className="section-kicker">CURATED FOR YOUR EVERYDAY MOVE</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-serif font-bold text-purple-950 tracking-wide">
              Collections
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600 font-sans">
              Find your next favourite in pieces selected for style, comfort and confidence.
            </p>
          </div>
          <div className="collection-controls" aria-label="Scroll collections">
            <button type="button" onClick={() => scroll(-1)} aria-label="Previous collections"><ChevronLeft /></button>
            <button type="button" onClick={() => scroll(1)} aria-label="Next collections"><ChevronRight /></button>
          </div>
        </div>

        {collections.length ? (
          <div className="collection-track" ref={track}>
            {collections.map(category => (
              <Link key={category.id} to={`/category/${category.slug}`} className="collection-card group">
                <div className="collection-card-image">
                  <img src={categoryArtwork(category)} alt={`${category.name} collection`} loading="lazy" decoding="async" />
                  <span className="collection-card-count">{category._count.products} {category._count.products === 1 ? 'piece' : 'pieces'}</span>
                </div>
                <div className="collection-card-copy">
                  <span className="collection-card-eyebrow">THE LYNMARIE EDIT</span>
                  <h3>{category.name}</h3>
                  <span className="collection-shop-link">Explore collection <ArrowRight size={16} /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-600">Collections will appear here soon.</p>
        )}

        <Link to="/collections" className="collection-see-more">See more collections <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}
