import { usePageSeo } from '../hooks/usePageSeo';

const returnsSeo = { title: 'Returns and Exchanges | LynMarie Boutique Kenya', description: 'Review the LynMarie Boutique return and exchange policy for women’s clothing orders in Kenya, including eligibility, condition, proof of purchase and how to contact our Nairobi shop.', path: '/returns' };

const Returns = () => {
  usePageSeo(returnsSeo);
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Returns & Exchanges
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            What to know before requesting a return or exchange
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">30-Day Return Policy</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              If an item is not right for you, contact LynMarie Boutique within 30 days of delivery to request a return or exchange. We will confirm eligibility and the available next steps before you send or bring an item back.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Return Conditions</h2>
            <ul className="text-gray-700 font-sans space-y-2 list-disc list-inside">
              <li>Items must be unworn, unwashed, and in original condition</li>
              <li>Original tags must be attached</li>
              <li>Include the original packaging where available</li>
              <li>Proof of purchase required</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">How to Return</h2>
            <ol className="text-gray-700 font-sans space-y-2 list-decimal list-inside">
              <li>Contact our customer service to initiate a return</li>
              <li>Contact us with your order number and the item you would like to return</li>
              <li>Wait for our team to confirm eligibility and return arrangements</li>
              <li>Keep the item unworn, unwashed and tagged while we respond</li>
              <li>Once received and checked, we will confirm the available refund or exchange outcome</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Refunds</h2>
            <p className="text-gray-700 font-sans leading-relaxed">
              If a refund is approved, we will confirm the amount and payment arrangement with you. Processing time can depend on the payment provider. Contact us if you have not received an update after we confirm the refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
