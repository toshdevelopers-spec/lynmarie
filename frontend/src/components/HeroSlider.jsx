import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 'statement',
    image: '/images/stunning-barefooted-woman-trendy-fur-coat-dancing-laughing-photoshoot.webp',
    alt: 'Model in a dramatic purple coat, placed on the right with open space for the story on the left',
    align: 'left',
    label: 'THE NEW SEASON',
    title: 'FASHION THAT',
    highlight: 'moves you.',
    description: 'A little drama, a lot of confidence. Find the layers and statement pieces that feel like you.',
    cta: 'Explore the edit',
    href: '/shop',
  },
  {
    id: 'occasion',
    image: '/images/lively-positive-smiling-africanamerican-woman-silver-shiny-stylish-dress-having-fun-partying-bday.webp',
    alt: 'Smiling model in a silver occasion dress on the left, with open purple backdrop on the right',
    align: 'right',
    label: 'MADE FOR YOUR MOMENT',
    title: 'DRESS LIKE',
    highlight: 'you mean it.',
    description: 'From celebrations to after dark, find a look that feels entirely your own.',
    cta: 'Shop occasionwear',
    href: '/category/wedding-wear',
  },
  {
    id: 'everyday',
    image: '/images/girl-yellow-wall-with-shopping-bags.webp',
    alt: 'Shopper carrying boutique bags on the right against a warm cream wall, with space on the left',
    align: 'left',
    label: 'YOUR EVERYDAY, ELEVATED',
    title: 'A LITTLE',
    highlight: 'more you.',
    description: 'Easy pieces, thoughtful details, and the confidence to make every look your own.',
    cta: 'Find your favourites',
    href: '/shop',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const next = useCallback(() => setCurrent(index => (index + 1) % slides.length), []);
  const prev = () => setCurrent(index => (index - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(next, 7000);
    return () => window.clearInterval(timer);
  }, [next, paused]);

  const slide = slides[current];

  return (
    <section
      className={`fashion-hero fashion-hero--${slide.align}`}
      aria-label="Featured LynMarie collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((item, index) => (
        <img
          key={item.id}
          src={item.image}
          alt={index === current ? item.alt : ''}
          aria-hidden={index !== current}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={index === 0 ? 'high' : 'auto'}
          className={`fashion-hero-image ${index === current ? 'is-current' : ''}`}
        />
      ))}
      <div className={`fashion-hero-overlay fashion-hero-overlay--${slide.align}`} aria-hidden="true" />
      <div key={slide.id} className={`fashion-hero-content fashion-hero-content--${slide.align}`}>
        <span className="fashion-hero-eyebrow">{slide.label}</span>
        <h1><span>{slide.title}</span><br /><em>{slide.highlight}</em></h1>
        <p>{slide.description}</p>
        <Link to={slide.href} className="fashion-hero-cta">{slide.cta}<ArrowRight size={17} /></Link>
        <div className="fashion-hero-values" aria-label="Style, Comfort, Confidence">STYLE <i>|</i> COMFORT <i>|</i> CONFIDENCE</div>
      </div>
      <div className="fashion-hero-controls">
        <span className="fashion-hero-counter">0{current + 1} <i>/</i> 0{slides.length}</span>
        <button onClick={prev} aria-label="Previous featured collection"><ChevronLeft size={19} /></button>
        <button onClick={next} aria-label="Next featured collection"><ChevronRight size={19} /></button>
      </div>
    </section>
  );
}
