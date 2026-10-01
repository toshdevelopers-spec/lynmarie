const Returns = () => {
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Returns & Exchanges
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Our hassle-free return policy
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">30-Day Return Policy</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of delivery for a full refund or exchange.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Return Conditions</h2>
            <ul className="text-gray-700 font-sans space-y-2 list-disc list-inside">
              <li>Items must be unworn, unwashed, and in original condition</li>
              <li>Original tags must be attached</li>
              <li>Original packaging must be included</li>
              <li>Proof of purchase required</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">How to Return</h2>
            <ol className="text-gray-700 font-sans space-y-2 list-decimal list-inside">
              <li>Contact our customer service to initiate a return</li>
              <li>Receive return authorization and shipping label</li>
              <li>Package the item securely</li>
              <li>Ship the item back to us</li>
              <li>Receive refund or exchange once processed</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Refunds</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Refunds are processed within 5-7 business days of receiving your return. The refund will be credited to your original payment method.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
