import HeroSlider from '../components/HeroSlider';
import CollectionSection from '../components/CollectionSection';
import NewArrivals from '../components/NewArrivals';
import Reviews from '../components/Reviews';
import { usePageSeo } from '../hooks/usePageSeo';

const homeSeo = {
  title: "Imported Women's Clothes in Kenya at Great Prices | LynMarie Boutique",
  description: "Shop imported women's dresses, jumpsuits, trouser suits, tops and occasionwear at LynMarie Boutique. Find great prices, M-Pesa checkout, Nairobi shop collection and delivery across Kenya.",
  path: '/',
};

const Home = () => {
  usePageSeo(homeSeo);
  return (
    <div className="min-h-screen">
      <HeroSlider />
      <section className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8" aria-labelledby="lynmarie-fashion-heading">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-purple-800">LynMarie Boutique · Nairobi, Kenya</p>
        <h2 id="lynmarie-fashion-heading" className="font-serif text-2xl font-semibold text-purple-950 md:text-3xl">Imported women’s fashion, chosen for real life</h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-gray-700">Explore elegant dresses for weddings and evenings, easy everyday dresses, flattering jumpsuits, ladies’ trouser suits, tops and separates. Shop online in Kenya, pay with M-Pesa, choose collection from our Jamia Mall boutique, or arrange delivery.</p>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-gray-600">Looking for women’s clothes online in Kenya, an occasion dress in Nairobi, a smart trouser suit for work, or a fresh outfit for your next event? Browse the LynMarie edit and find a style that suits your moment and budget.</p>
      </section>
      <CollectionSection />
      <NewArrivals />
      <Reviews />
    </div>
  );
};

export default Home;
