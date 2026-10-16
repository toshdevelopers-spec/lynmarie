import { usePageSeo } from '../hooks/usePageSeo';

const shippingSeo = { title: 'Delivery and Shop Collection in Kenya | LynMarie Boutique', description: 'See LynMarie Boutique delivery information for online clothing orders in Kenya, including standard and express delivery options and collecting from our Jamia Mall shop in Nairobi.', path: '/shipping' };

const Shipping = () => {
  usePageSeo(shippingSeo);
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Shipping Information
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Delivery across Kenya and collection from our Nairobi boutique
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Free Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Delivery is free for orders over KSh 10,000 within Kenya. Standard delivery is estimated at 3–5 business days after dispatch. Timelines may vary by destination and during busy periods.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Standard Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              For orders under KSh 10,000, standard delivery is KSh 500. The estimated delivery time is 3–5 business days after dispatch.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Express Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Express delivery is KSh 1,000 and is available in major cities, with an estimated 1–2 business day delivery time after dispatch. Contact us to confirm service availability for your location.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">International Shipping</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              Online delivery is currently available within Kenya. For a shop visit or collection, find us at Jamia Mall, 1st Floor, Shop F56, Tubman Road and Kimathi Street, Nairobi.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Order Processing</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              We aim to process orders within 1–2 business days. Delivery estimates begin after dispatch. We will contact you using the phone number or email address on your order if we need to confirm details. For collection orders, please wait for our confirmation before coming to the shop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
