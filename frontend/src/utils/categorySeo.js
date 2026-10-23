const tailored = {
  dresses: {
    title: "Women's Dresses in Kenya | Shop Online | LynMarie Boutique",
    description: "Shop women's dresses online in Kenya, from day and maxi dresses to elegant occasion styles. Browse LynMarie Boutique in Nairobi with delivery across Kenya or collect at Jamia Mall.",
    heading: "Women’s Dresses in Kenya",
    intro: "Browse women’s dresses at LynMarie Boutique in Nairobi. Shop day dresses, maxi dresses, midi dresses and occasion styles online across Kenya. Product pages show current photos, colours, prices and available sizes. Choose delivery across Kenya or collect from our boutique at Jamia Mall, 1st Floor, Shop F56, Nairobi.",
    related: [
      { slug: 'evening-dinner-dresses', label: 'Evening and dinner dresses' },
      { slug: 'bridal-occasion', label: 'Bridal and occasionwear' },
      { slug: 'kidswear', label: 'Kidswear' },
    ],
  },
  kidswear: {
    title: "Kids' Clothes in Kenya | Shop Kidswear Online | LynMarie Boutique",
    description: "Shop kids' clothes and occasion outfits in Kenya at LynMarie Boutique. Browse available children's styles online, with Nairobi collection and delivery across Kenya.",
    heading: "Kids’ Clothes in Kenya",
    intro: "Explore children’s clothing and occasion outfits at LynMarie Boutique in Nairobi. Browse the current kidswear collection online, check each product for available colours, photos and sizes, and choose delivery across Kenya or collection at Jamia Mall, 1st Floor, Shop F56.",
    related: [
      { slug: 'dresses', label: 'Women’s dresses' },
      { slug: 'bridal-occasion', label: 'Bridal and occasionwear' },
    ],
  },
  'office-wear': {
    title: "Women's Office Wear in Kenya | LynMarie Boutique",
    description: "Shop women's office wear in Kenya, including polished workwear and coordinated outfits. Browse LynMarie Boutique online with delivery across Kenya and collection in Nairobi.",
    heading: "Women’s Office Wear in Kenya",
    intro: "Browse polished women’s workwear at LynMarie Boutique in Nairobi. Explore the current office wear collection, compare product photos, colours, prices and available sizes, then choose delivery across Kenya or collection at Jamia Mall.",
    related: [
      { slug: 'dresses', label: 'Women’s dresses' },
      { slug: 'two-piece-sets', label: 'Two-piece sets' },
      { slug: 'tops-blouses', label: 'Tops and blouses' },
    ],
  },
  'evening-dinner-dresses': {
    title: "Evening & Dinner Dresses in Kenya | LynMarie Boutique",
    description: "Find women's dinner dresses and evening styles in Kenya at LynMarie Boutique. Browse occasion dresses online, with delivery across Kenya or collection in Nairobi.",
    heading: "Evening and Dinner Dresses in Kenya",
    intro: "Explore dinner dresses, evening styles and occasionwear for celebrations and nights out. LynMarie Boutique is based at Jamia Mall in Nairobi and offers online shopping with delivery across Kenya. Check each product page for current photos, colours and sizes.",
    related: [
      { slug: 'dresses', label: 'All women’s dresses' },
      { slug: 'bridal-occasion', label: 'Bridal and occasionwear' },
    ],
  },
};

export function categorySeoFor(slug, name = '') {
  const categoryName = name || String(slug || '').replaceAll('-', ' ');
  return tailored[slug] || {
    title: `${categoryName.replace(/\b\w/g, letter => letter.toUpperCase())} in Kenya | LynMarie Boutique`,
    description: `Shop ${categoryName.toLowerCase()} online in Kenya at LynMarie Boutique in Nairobi. Browse current styles, prices and available sizes, with delivery across Kenya or collection at Jamia Mall.`,
    heading: `${categoryName.replace(/\b\w/g, letter => letter.toUpperCase())} in Kenya`,
    intro: `Browse ${categoryName.toLowerCase()} at LynMarie Boutique in Nairobi. Explore current styles online, check each product for photos, colours, prices and available sizes, then choose delivery across Kenya or collection from our Jamia Mall boutique.`,
    related: [{ slug: 'dresses', label: 'Women’s dresses' }, { slug: 'two-piece-sets', label: 'Two-piece sets' }],
  };
}
