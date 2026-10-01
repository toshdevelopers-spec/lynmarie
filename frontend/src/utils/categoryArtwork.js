const art = {
  kids: '/images/kids-dresses.webp',
  jackets: '/images/sassy-chic-woman-stands-with-self-assured-expression-puts-trendy-shades-looks-confidently-dressed-fashion-luxury-clothes-last-collection-ready-party-date-street-style.webp',
  tops: '/images/positive-afro-american-woman-turns-from-camera-aside-has-cheerful-expression-stands-against-clothing-rail-has-phone-talk.webp',
  occasion: '/images/collections/wedding-unsplash.webp',
  sets: '/images/collections/two-piece-unsplash.webp',
  shopping: '/images/collections/sale-unsplash.webp',
  apparel: '/images/woman-surrounded-by-clothing-pile.webp',
};

export function categoryArtwork(category) {
  const text = `${category?.name || ''} ${category?.slug || ''}`.toLowerCase();
  if (/kid|child/.test(text)) return art.kids;
  if (/jacket|coat|outerwear/.test(text)) return art.jackets;
  if (/top|shirt|blouse/.test(text)) return art.tops;
  if (/wedding|occasion|party|evening|dress|gown/.test(text)) return art.occasion;
  if (/sale|accessor|bag/.test(text)) return art.shopping;
  if (/two.?piece|set|collection/.test(text)) return art.sets;
  return art.apparel;
}
