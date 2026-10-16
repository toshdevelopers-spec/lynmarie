import { usePageSeo } from '../hooks/usePageSeo';

const termsSeo = { title: 'Terms and Conditions | LynMarie Boutique Kenya', description: 'Read the terms for shopping imported women’s clothing online with LynMarie Boutique in Kenya, including products, prices, orders, payment, delivery, shop pickup and returns.', path: '/terms' };

const Terms = () => {
  usePageSeo(termsSeo);
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Terms of Service
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Clear information for shopping LynMarie Boutique online and in store
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Acceptance of Terms</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              These terms explain how orders placed through LynMarie Boutique’s website are handled. By placing an order, you confirm that the contact and delivery details you provide are accurate and that you have reviewed the product, price, size and colour shown at checkout.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Products and Services</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Product names, photographs, descriptions, sizes, colours and stock information are provided to help you choose. We work to keep them accurate, although screen settings can affect how colours appear. Availability can change as items sell in store or online. Contact us before ordering if you need help confirming a detail.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Pricing</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Prices are displayed in Kenyan Shillings (KSh). The price shown for an item when you place an order is the price recorded for that order. We may update product prices, offers or availability for future purchases.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Orders and Payment</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              An order acknowledgement confirms that we received your order; it does not by itself confirm dispatch. Payment options shown at checkout include M-Pesa and, for eligible shop-collection orders, payment when collecting. Orders are subject to stock confirmation. If we cannot fulfil an order, we will contact you using the details provided. Store purchases may use the payment methods available at the boutique.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Delivery, collection and returns</h2>
            <p className="text-gray-700 font-sans leading-relaxed">Delivery charges and estimated timelines are described on our <a href="/shipping" className="text-purple-800 underline">shipping information</a> page. If you choose shop collection, wait for confirmation before travelling to collect. Return eligibility and how to contact us are explained in our <a href="/returns" className="text-purple-800 underline">returns and exchanges policy</a>.</p>
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
              To the extent permitted by applicable law, LynMarie Boutique is not responsible for losses caused by circumstances outside our reasonable control. Nothing in these terms limits a right that cannot legally be limited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
