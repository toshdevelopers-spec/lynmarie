import { useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import CollectionSection from '../components/CollectionSection';
import NewArrivals from '../components/NewArrivals';
import Reviews from '../components/Reviews';

const Home = () => {
  useEffect(() => {
    document.title = 'LynMarie Boutique | Timeless Style, Curated in Nairobi';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = 'Discover considered everyday style and occasionwear at LynMarie Boutique. Thoughtful fashion, curated with care in Nairobi.';
  }, []);
  return (
    <div className="min-h-screen">
      <HeroSlider />
      <CollectionSection />
      <NewArrivals />
      <Reviews />
    </div>
  );
};

export default Home;
