import { useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { api } from '../services/api';
import { useGetProductsQuery, useGetReviewsQuery } from '../services/storefrontApi';
import Loader from './ui/Loader';

const Reviews = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    reviewer: '',
    reviewer_email: '',
    review: '',
    product_id: ''
  });
  const { data: reviews = [], isLoading: loading } = useGetReviewsQuery();
  const { data: products = [] } = useGetProductsQuery({ limit: 100 }, { skip: !showForm });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/reviews', { productId: Number(formData.product_id), reviewer: formData.reviewer, reviewer_email: formData.reviewer_email, review: formData.review, rating: formData.rating });
      setSubmitSuccess(true);
      setFormData({ rating: 5, reviewer: '', reviewer_email: '', review: '', product_id: '' });
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Could not submit your review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 cursor-pointer transition-colors ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
        }`}
        onClick={() => interactive && onChange(i + 1)}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <Loader size="large" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-sans font-light tracking-wide mb-6">
            Don't just take our word for it — hear from our happy customers
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-[#4c00b0] text-white rounded-full font-serif font-medium hover:bg-[#3d008f] transition-colors tracking-wide"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {showForm && (
          <div className="max-w-2xl mx-auto mb-12 bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-100">
            <h3 className="text-2xl font-serif font-bold mb-6 tracking-wide">Share Your Experience</h3>
            {submitSuccess && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg font-sans">
                Thank you for your review! It will be published after moderation.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {submitError && <p className="mb-4 text-sm text-red-600">{submitError}</p>}
              <div className="mb-4">
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Product</label>
                <select required value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0] font-sans">
                  <option value="">Choose a product</option>
                  {products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Rating</label>
                <div className="flex gap-1">
                  {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.reviewer}
                  onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0] font-sans"
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={formData.reviewer_email}
                  onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0] font-sans"
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-serif font-medium mb-2 tracking-wide">Your Review</label>
                <textarea
                  required
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c00b0] font-sans h-32"
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-[#4c00b0] text-white rounded-lg font-serif font-medium hover:bg-[#3d008f] transition-colors tracking-wide disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(review.rating)}
                </div>
                
                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-200 opacity-50" />
                  <p className="text-gray-700 font-sans font-light leading-relaxed pl-6">
                    {review.review}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-100">
                  <div>
                    <p className="font-serif font-semibold text-gray-900 tracking-wide">
                      {review.reviewer}
                    </p>
                    {review.verified && (
                      <p className="text-xs text-[#4c00b0] font-sans">Verified Purchase</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 font-sans font-light">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;
