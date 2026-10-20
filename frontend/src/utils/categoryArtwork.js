const artBySlug = {
  dresses: { src: '/dresses.webp', position: 'center 28%', alt: 'African woman wearing a white fitted dress' },
  'office-wear': { src: '/bottoms.webp', position: 'center 26%', alt: 'African woman wearing a polished white trouser suit' },
  'evening-dinner-dresses': { src: '/images/lively-positive-smiling-africanamerican-woman-silver-shiny-stylish-dress-having-fun-partying-bday.webp', position: '24% 28%', alt: 'African woman in a silver evening dress' },
  'bridal-occasion': { src: '/images/wedding.webp', position: 'center 30%', alt: 'African bride in a white wedding gown' },
  'two-piece-sets': { src: '/images/two-piece-sets.webp', position: 'center 28%', alt: 'African woman wearing a coordinated two-piece outfit' },
  'tops-blouses': { src: '/tops.webp', position: 'center 24%', alt: 'African woman wearing a patterned blouse' },
  bottoms: { src: '/bottoms.webp', position: 'center 24%', alt: 'African woman wearing tailored trousers' },
  jumpsuits: { src: '/jumpsuits.webp', position: 'center 24%', alt: 'African woman wearing a red jumpsuit' },
  kidswear: { src: '/images/kids-dresses.webp', position: 'center 24%', alt: 'African girl wearing a party dress' },
  bags: { src: '/images/categories/bags.jpg', position: 'center 47%', alt: 'Printed white structured handbag from the LynMarie collection' },
  shoes: { src: '/images/categories/shoes.jpg', position: 'center 48%', alt: 'Red, white and black pointed slingback heel from the LynMarie collection' },
  outerwear: { src: '/images/sassy-chic-woman-stands-with-self-assured-expression-puts-trendy-shades-looks-confidently-dressed-fashion-luxury-clothes-last-collection-ready-party-date-street-style.webp', position: 'center 24%', alt: 'African woman wearing a bright pink coat' },
  'hats-accessories': { src: '/images/positive-afro-american-woman-turns-from-camera-aside-has-cheerful-expression-stands-against-clothing-rail-has-phone-talk.webp', position: 'center 32%', alt: 'African woman browsing fashion in a boutique' },
};

const fallback = { src: '/images/two-piece-sets.webp', position: 'center 28%', alt: 'African woman wearing a coordinated two-piece outfit' };

export function categoryArtwork(category) {
  return artBySlug[category?.slug] || fallback;
}
