import { usePageSeo } from '../hooks/usePageSeo';

const sizeSeo = { title: 'Women’s Clothing Size Guide | LynMarie Boutique Nairobi', description: 'Use the LynMarie Boutique size guide before ordering dresses, jumpsuits and trouser suits online in Kenya. Check each product’s listed sizes and ask us for fit help.', path: '/size-guide' };

const SizeGuide = () => {
  usePageSeo(sizeSeo);
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Size Guide
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Check the size options listed for each individual style
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 overflow-x-auto">
          <p className="mb-5 max-w-3xl text-gray-700 font-sans leading-relaxed">Imported clothing can use different sizing systems, and the fit may vary between designs. We list the sizes currently available on each product page. Please use that product’s own size options as the source of truth instead of assuming every size label maps to the same measurements.</p>
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 text-gray-700 font-sans leading-relaxed"><h2 className="mb-2 font-serif text-xl font-bold text-purple-950">How to check your measurements</h2><p>Use a soft tape measure over light clothing. Measure around the fullest part of your bust, the narrowest part of your waist and the fullest part of your hips. Compare your measurements with a similar garment that fits you comfortably, then contact us if you would like help before ordering.</p></div>
          <table className="mt-6 w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-purple-200">
                <th className="py-3 px-4 text-left font-serif font-bold text-gray-900 tracking-wide">Garment label shown</th>
                <th className="py-3 px-4 text-left font-serif font-bold text-gray-900 tracking-wide">How to use it</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-purple-100"><td className="py-3 px-4 font-sans text-gray-700">Numeric (for example, 36, 38 or 40)</td><td className="py-3 px-4 font-sans text-gray-700">Choose only from the sizes displayed on that product page; labels can vary by brand and cut.</td></tr>
              <tr><td className="py-3 px-4 font-sans text-gray-700">Letter (for example, S, M or L)</td><td className="py-3 px-4 font-sans text-gray-700">Check the product’s available options and compare your measurements with a similar garment that fits you.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100">
          <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">Need help choosing a size?</h2>
          <p className="text-gray-700 font-sans leading-relaxed">Send the product name and the size you usually wear to <a className="text-purple-800 underline" href="https://wa.me/254794071233">LynMarie Boutique on WhatsApp</a> or visit us at Jamia Mall, 1st Floor, Shop F56, Nairobi.</p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
