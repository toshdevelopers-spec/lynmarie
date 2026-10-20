import "dotenv/config";
import { prisma } from "../src/config/prisma.js";

const categories = [
  ["Dresses", "dresses", "Shop women’s day dresses, occasion dresses, maxi dresses, midi dresses and fitted styles in a range of colours and prints."],
  ["Two-Piece Sets", "two-piece-sets", "Coordinated two-piece outfits, including matching tops and trousers or skirts for polished everyday and occasion dressing."],
  ["Office Wear", "office-wear", "Polished women’s workwear, including tailored trouser suits, skirt suits and coordinated pieces for meetings and professional occasions."],
  ["Evening & Dinner Dresses", "evening-dinner-dresses", "Women’s dinner dresses, evening gowns and cocktail styles for dinners, celebrations and special nights out."],
  ["Tops & Blouses", "tops-blouses", "Blouses, shirts, dressy tops and casual separates in solid colours, prints and statement details."],
  ["Bottoms", "bottoms", "Women’s trousers, skirts and other separates to pair with tops, blouses and coordinated outfits."],
  ["Jumpsuits", "jumpsuits", "One-piece women’s jumpsuits and playsuits, from relaxed daytime pieces to polished evening styles."],
  ["Outerwear", "outerwear", "Light jackets, cardigans and layering pieces to complete workwear, casual and occasion outfits."],
  ["Bridal & Occasion", "bridal-occasion", "Wedding, bridal party and special-event clothing and accessories, including elegant formalwear."],
  ["Kidswear", "kidswear", "Children’s clothing and occasion outfits in playful colours and comfortable styles."],
  ["Bags", "bags", "Handbags, shoulder bags, clutches and practical fashion bags in classic and seasonal colours."],
  ["Shoes", "shoes", "Women’s footwear, including heels, flats, sandals and casual shoes for everyday and occasion wear."],
  ["Hats & Accessories", "hats-accessories", "Fashion hats, scarves, jewellery and finishing accessories for everyday looks and special occasions."],
];

try {
  for (const [name, slug, description] of categories) {
    await prisma.category.upsert({ where: { slug }, create: { name, slug, description }, update: { name, description } });
  }
  console.log(`Upserted ${categories.length} clothing categories.`);
} finally {
  await prisma.$disconnect();
}
