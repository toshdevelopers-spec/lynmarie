const SizeGuide = () => {
  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Size Guide
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Find your perfect fit
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-purple-200">
                <th className="py-3 px-4 text-left font-serif font-bold text-gray-900 tracking-wide">Size</th>
                <th className="py-3 px-4 text-left font-serif font-bold text-gray-900 tracking-wide">Bust (in)</th>
                <th className="py-3 px-4 text-left font-serif font-bold text-gray-900 tracking-wide">Waist (in)</th>
                <th className="py-3 px-4 text-left font-serif font-bold text-gray-900 tracking-wide">Hips (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-purple-100">
                <td className="py-3 px-4 font-sans text-gray-700">XS</td>
                <td className="py-3 px-4 font-sans text-gray-700">32-34</td>
                <td className="py-3 px-4 font-sans text-gray-700">24-26</td>
                <td className="py-3 px-4 font-sans text-gray-700">34-36</td>
              </tr>
              <tr className="border-b border-purple-100">
                <td className="py-3 px-4 font-sans text-gray-700">S</td>
                <td className="py-3 px-4 font-sans text-gray-700">34-36</td>
                <td className="py-3 px-4 font-sans text-gray-700">26-28</td>
                <td className="py-3 px-4 font-sans text-gray-700">36-38</td>
              </tr>
              <tr className="border-b border-purple-100">
                <td className="py-3 px-4 font-sans text-gray-700">M</td>
                <td className="py-3 px-4 font-sans text-gray-700">36-38</td>
                <td className="py-3 px-4 font-sans text-gray-700">28-30</td>
                <td className="py-3 px-4 font-sans text-gray-700">38-40</td>
              </tr>
              <tr className="border-b border-purple-100">
                <td className="py-3 px-4 font-sans text-gray-700">L</td>
                <td className="py-3 px-4 font-sans text-gray-700">38-40</td>
                <td className="py-3 px-4 font-sans text-gray-700">30-32</td>
                <td className="py-3 px-4 font-sans text-gray-700">40-42</td>
              </tr>
              <tr className="border-b border-purple-100">
                <td className="py-3 px-4 font-sans text-gray-700">XL</td>
                <td className="py-3 px-4 font-sans text-gray-700">40-42</td>
                <td className="py-3 px-4 font-sans text-gray-700">32-34</td>
                <td className="py-3 px-4 font-sans text-gray-700">42-44</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-gray-700">XXL</td>
                <td className="py-3 px-4 font-sans text-gray-700">42-44</td>
                <td className="py-3 px-4 font-sans text-gray-700">34-36</td>
                <td className="py-3 px-4 font-sans text-gray-700">44-46</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border-2 border-purple-100">
          <h2 className="text-2xl font-serif font-bold mb-4 tracking-wide">How to Measure</h2>
          <div className="space-y-4 text-gray-700 font-sans">
            <p><strong>Bust:</strong> Measure around the fullest part of your bust.</p>
            <p><strong>Waist:</strong> Measure around the narrowest part of your waist.</p>
            <p><strong>Hips:</strong> Measure around the fullest part of your hips.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
