import { usePageSeo } from '../hooks/usePageSeo';

const privacySeo = { title: 'Privacy Policy | LynMarie Boutique Online Shop', description: 'Learn how LynMarie Boutique uses account, order, contact and site-usage information to provide online clothing orders, customer support and shop collection in Kenya.', path: '/privacy' };

const Privacy = () => {
  usePageSeo(privacySeo);
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
              When you create an account, contact us or place an order, we collect details such as your name, email address, phone number, delivery or collection details, order items and payment references you choose to provide. Passwords are stored as protected password hashes. We also collect basic site and cart activity to operate and improve the shop.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">How We Use Your Information</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We use these details to manage your account, check and fulfil orders, contact you about a purchase, respond to enquiries, handle payment references and returns, protect the website, and understand which products and pages are useful to shoppers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Data Security</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              LynMarie Boutique uses access controls and service providers for hosting, database storage, image delivery and transactional email. We limit account access to authorised store staff and take reasonable steps to protect the information processed by the website. No internet service can guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Your Rights</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              You can review and update profile details in your account. For help accessing, correcting or requesting removal of personal information, email info@lynmarieboutique.com or WhatsApp 0794 071233. Some order records may need to be retained for customer service, accounting or legal requirements.
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
