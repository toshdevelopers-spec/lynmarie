const FAQ = () => {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our collection, select your items, add them to cart, and proceed to checkout. You can create an account during checkout or checkout as a guest."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept M-Pesa, credit/debit cards, and bank transfers. All payments are processed securely."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping (available in major cities) takes 1-2 business days."
    },
    {
      question: "Can I track my order?",
      answer: "Yes! Once your order ships, you'll receive a tracking number via email. You can also check your order status in your account."
    },
    {
      question: "What if the item doesn't fit?",
      answer: "We offer a 30-day return policy. You can return or exchange items that don't fit, provided they're in original condition with tags attached."
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes! We offer beautiful gift wrapping for special occasions. You can select this option during checkout."
    }
  ];

  return (
    <div className="min-h-screen py-16 bg-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-950 mb-4 tracking-wide">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 font-sans font-light tracking-wide">
            Find answers to common questions
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-purple-100">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 tracking-wide">
                {faq.question}
              </h3>
              <p className="text-gray-700 font-sans leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 font-sans font-light">
            Still have questions? <a href="/contact" className="text-[#4c00b0] hover:text-purple-800 font-serif font-medium">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
