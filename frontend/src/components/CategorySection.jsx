import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CategorySection = () => {
  const categories = [
    { 
      name: 'Dresses', 
      slug: 'dresses', 
      emoji: '👗',
      description: 'Elegant dresses for every occasion',
    },
    { 
      name: 'Tops', 
      slug: 'tops', 
      emoji: '👚',
      description: 'Stylish tops to elevate your look',
    },
    { 
      name: 'Jumpsuits', 
      slug: 'bottoms-jumpsuits', 
      emoji: '👖',
      description: 'Easy one-piece styles for days and evenings.',
    },
    { 
      name: 'Wedding Wear', 
      slug: 'wedding-wear', 
      emoji: '💍',
      description: 'Make your special day perfect',
    },
    { 
      name: 'Two-Piece Sets', 
      slug: 'two-piece-sets', 
      emoji: '✨',
      description: 'Coordinated outfits made easy',
    },
    { 
      name: 'Kids Dresses', 
      slug: 'kids-dresses', 
      emoji: '👧',
      description: 'Adorable styles for little ones',
    },
    { 
      name: 'Jackets', 
      slug: 'jackets', 
      emoji: '🧥',
      description: 'Stay warm and fashionable',
    },
    { 
      name: 'Sale', 
      slug: 'sale', 
      emoji: '🏷️',
      description: 'Amazing deals you cannot miss',
      isSale: true
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of fashion categories designed to make you shine
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={category.isSale ? '/shop?on_sale=true' : `/category/${category.slug}`}
              className="group relative aspect-square bg-purple-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-5xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.emoji}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#4c00b0] transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-[#4c00b0]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
