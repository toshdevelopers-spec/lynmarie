import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../services/storefrontApi';
import Loader from './ui/Loader';
import ErrorMessage from './ui/ErrorMessage';

const NewArrivals = () => {
  const { data: products = [], isLoading: loading, isError: error } = useGetProductsQuery({
    per_page: 8,
    orderby: 'date',
    order: 'desc',
  });

  if (loading) {
    return (
      <section className="py-16 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader size="large" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ErrorMessage message="Failed to load new arrivals. Please try again later." />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-2 tracking-wide">
              New Arrivals
            </h2>
            <p className="text-gray-600 font-sans font-light tracking-wide">
              Fresh styles just in
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#4c00b0] text-white rounded-full hover:bg-[#3d008f] transition-colors font-serif font-medium tracking-wide"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageUrl = product.images?.[0]?.src || '/3.png';
            const hasSale = product.on_sale && product.sale_price;
            const price = hasSale ? product.sale_price : product.price;
            const regularPrice = product.regular_price;

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {hasSale && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Sale
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-serif font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#4c00b0] transition-colors tracking-wide">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {hasSale && (
                      <span className="text-gray-400 line-through text-sm font-sans">
                        KSh {regularPrice}
                      </span>
                    )}
                    <span className="text-[#4c00b0] font-serif font-bold">
                      KSh {price}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4c00b0] text-white rounded-full hover:bg-[#3d008f] transition-colors font-serif font-medium tracking-wide"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
