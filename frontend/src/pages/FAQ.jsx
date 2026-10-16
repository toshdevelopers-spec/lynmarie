import { usePageSeo } from '../hooks/usePageSeo';

const faqSeo = { title: 'Women’s Fashion Shopping FAQs | LynMarie Boutique Kenya', description: 'Answers about shopping women’s dresses, jumpsuits and trouser suits from LynMarie Boutique: sizes, M-Pesa, delivery, shop collection and returns in Kenya.', path: '/faq' };

const FAQ = () => {
  usePageSeo(faqSeo);
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse the collection, open a product to review its photos, available size and colour options, then add it to your cart. At checkout you can provide your contact details and choose delivery or collection from our Jamia Mall shop."
    },
    {
      question: "What kind of women’s clothes can I shop at LynMarie Boutique?",
      answer: "Our Nairobi boutique curates imported women’s clothing such as dresses, dinner and occasion dresses, jumpsuits, two-piece trouser suits, skirts and tops. The live catalogue shows the styles currently available."
    },
    {
      question: "Where is the LynMarie Boutique shop in Nairobi?",
      answer: "Visit us at Jamia Mall, 1st Floor, Shop F56, Tubman Road and Kimathi Street, Nairobi. You can also choose shop collection for eligible website orders and wait for our confirmation before visiting."
    },
    {
      question: "How do I choose the right dress or clothing size?",
      answer: "Sizes vary by label and style. Check the options on the individual product page and read our size guide. If you are unsure, send us the product name and your usual size on WhatsApp before ordering."
    },
    {
      question: "What payment methods do you accept?",
      answer: "Online checkout currently offers M-Pesa. For shop collection, eligible orders can be paid when you arrive. At the boutique, ask the seller which cash, card, M-Pesa or bank options are available."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard delivery is estimated at 3–5 business days after dispatch. Express delivery is estimated at 1–2 business days in supported major cities. See our shipping page for charges and details."
    },
    {
      question: "Can I track my order?",
      answer: "Sign in and open My Account to review orders linked to your account. Guest shoppers can contact us with their order number and checkout phone number for an update."
    },
    {
      question: "What if the item doesn't fit?",
      answer: "Please check our Returns & Exchanges page for the current return window and item-condition requirements. If you are unsure about fit, contact us before ordering and we can help you review the size information shown for that item."
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Gift wrapping is not currently listed as a checkout option. Contact the boutique before placing your order to ask whether it can be arranged for your selected item."
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
            Practical answers about sizes, prices, M-Pesa, delivery and Nairobi shop collection
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
