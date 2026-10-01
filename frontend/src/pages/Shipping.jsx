const Shipping = () => {
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Shipping Information
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Everything you need to know about our shipping policies
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Free Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We offer free shipping on all orders over KSh 10,000 within Kenya. Standard shipping takes 3-5 business days.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Standard Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              For orders under KSh 10,000, standard shipping is KSh 500. Delivery typically takes 3-5 business days.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Express Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Express shipping is available for KSh 1,000 with delivery within 1-2 business days in major cities.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">International Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We currently ship within Kenya only. International shipping will be available soon.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Order Processing</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Orders are processed within 1-2 business days. You will receive a confirmation email with tracking information once your order ships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
