const Terms = () => {
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Terms of Service
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Please read these terms carefully
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Acceptance of Terms</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              By accessing and using Lyn Marie Boutique's website, you accept and agree to be bound by these Terms of Service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Products and Services</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We strive to accurately display our products. However, we do not warrant that product descriptions are error-free. Colors may vary slightly due to monitor settings.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Pricing</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              All prices are in Kenyan Shillings (KSh) and are subject to change without notice. We reserve the right to modify prices or discontinue products at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Orders and Payment</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We reserve the right to refuse or cancel any order. Payment must be received before order processing. We accept various payment methods as listed on our website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Intellectual Property</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              All content on this website, including text, graphics, logos, and images, is the property of Lyn Marie Boutique and protected by copyright laws.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Limitation of Liability</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Lyn Marie Boutique shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
