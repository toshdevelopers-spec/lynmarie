const Privacy = () => {
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Privacy Policy
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Your privacy is important to us
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Information We Collect</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We collect information you provide directly, including name, email address, shipping address, and payment information when you make a purchase.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">How We Use Your Information</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We use your information to process orders, send updates about your orders, and communicate with you about our products and services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Data Security</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, or disclosure.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Your Rights</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              You have the right to access, correct, or delete your personal information. Contact us if you wish to exercise these rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Contact Us</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at info@lynmarieboutique.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
