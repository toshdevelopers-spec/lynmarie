import { prisma } from '../src/config/prisma.js';

const copy = {
  109: { name: 'White and Green Two-Piece Trouser Suit', detail: 'A coordinated two-piece outfit with a colourful top and matching trousers.' },
  108: { name: 'Grey Belted Two-Piece Trouser Suit', detail: 'A tailored-look two-piece set with a matching belt and clean, versatile grey colour.' },
  107: { name: 'Leopard-Print Long Dress', detail: 'A long dress with a bold leopard print for an expressive evening or occasion look.' },
  106: { name: 'Dark Orange High-Low Occasion Dress', detail: 'A statement high-low dress in dark orange, suited to celebrations and special occasions.' },
  105: { name: 'Maroon Long-Sleeve V-Neck Dress', detail: 'A short dress with a V neckline and long sleeves in a rich maroon colour.' },
  104: { name: 'Pink, Blue and White Floral High-Low Dress', detail: 'A floral-patterned dress with an elegant high-low hem in pink, blue and white.' },
  103: { name: 'Pink and Black Striped Office Dress', detail: 'A striped, smart-casual dress in pink and black for workdays and polished daytime plans.' },
  51: { name: 'Yellow Casual Day Dress', detail: 'An easy yellow dress for relaxed daytime plans and warm-weather styling.' },
  50: { name: 'Royal Blue Peplum Trouser Suit', detail: 'A two-piece trouser suit with a peplum top in a vivid royal-blue colour.' },
  49: { name: 'Yellow, White and Black Patterned Dress', detail: 'A patterned dress with sleeves, combining yellow, white and black.' },
  48: { name: 'Light Blue Belted Dinner Dress', detail: 'A light-blue dinner dress with a waist belt for a defined, occasion-ready silhouette.' },
  47: { name: 'Yellow Sleeveless V-Neck Office Dress', detail: 'A sleeveless V-neck dress in yellow for a bright, polished office or daytime look.' },
  46: { name: 'Green and Brown Overlap Dress', detail: 'An overlapping-front dress with a mix of green and brown tones.' },
  45: { name: 'Pink Belted Skater Dinner Dress', detail: 'A pink skater-style dinner dress with a matching belt and a softly flared shape.' },
  44: { name: 'Black and White V-Neck Blouse', detail: 'A V-neck blouse in a versatile black-and-white colour combination.' },
  43: { name: 'Blue Mother-of-the-Bride Long Dress', detail: 'A blue long dress selected for a mother-of-the-bride outfit or another formal celebration.' },
  42: { name: 'Leopard-Print Skirt Suit with Gold Details', detail: 'A coordinated skirt suit with leopard print and gold-tone decorative details.' },
  41: { name: 'Light Green Evening Dress', detail: 'A light-green dress described for evening wear and special occasions.' },
  40: { name: 'Green Net-Detail Dinner Dress', detail: 'A green dinner dress with net detailing for an occasion-ready look.' },
  39: { name: 'Pink and Black Short Occasion Dress', detail: 'A short party dress in pink and black with a princess-inspired fancy style.' },
  38: { name: 'Purple and Cream Puffed-Sleeve Skater Dress', detail: 'A skater-style dress with puffed sleeves in purple and cream. The original catalogue lists polyester fabric.' },
  37: { name: 'Black Two-Piece Trouser Suit', detail: 'A coordinated black trouser suit described for both casual and office wear. The original listing describes a 70% viscose, 30% polyester fabric blend.' },
  36: { name: 'White Shift Dress', detail: 'A clean, versatile white shift dress. The original catalogue lists polyester fabric.' },
  35: { name: 'Pink and White Jumpsuit with Matching Coat', detail: 'A pink-and-white jumpsuit styled with a matching coat for a coordinated occasion look.' },
  34: { name: 'Mustard Yellow Floral Two-Piece Trouser Suit', detail: 'A coordinated trouser suit with a floral blouse in mustard yellow.' },
  33: { name: 'Pink and White Floral Trouser Suit', detail: 'A coordinated women’s trouser suit with a floral design in pink and white.' },
  32: { name: 'Floral Two-Piece Trouser Suit', detail: 'A floral two-piece trouser suit, with listed colour options in white and blue or white and red.' },
  31: { name: 'Green Sleeveless Puffer Jacket', detail: 'A green sleeveless puffer jacket. The original listing describes polyester and nylon fabric.' },
  30: { name: 'Cream Blouse with Camisole Detail', detail: 'A cream blouse with a camisole-style detail, designed to layer into a smart or relaxed outfit.' },
  29: { name: 'Multicoloured Printed Dress', detail: 'A multicoloured printed dress with a lively pattern for a standout daytime or occasion look.' },
  28: { name: 'Black and White Short-Sleeve Blouse with Silver Detail', detail: 'A short-sleeve black-and-white blouse with silver details.' },
  27: { name: 'Multicoloured Rasta Print Dress', detail: 'A multicoloured Rasta-inspired print dress. The original catalogue lists viscose fabric.' },
  26: { name: 'Snake-Print Blazer', detail: 'A statement blazer with a snake print. The original catalogue lists polyester fabric.' },
  25: { name: 'White Tank Top with Silver Front Detail', detail: 'A white sleeveless tank top with silver detailing at the centre front.' },
  24: { name: 'White Trousers with Silver Detail', detail: 'White trousers with silver detailing down the centre for a polished statement look.' },
  23: { name: 'Orange and Coral Strappy Gown with Side Slit', detail: 'A strappy occasion gown with a left-leg slit, listed in orange and coral colour options.' },
  22: { name: 'Multicoloured Flowing Occasion Gown', detail: 'A flowing multicoloured gown for celebrations and formal occasions. The original catalogue lists polyester fabric.' },
  21: { name: 'Purple Floral Dress', detail: 'A purple floral dress. The original catalogue lists a polyester and elastane fabric blend.' },
  20: { name: 'Green Short-Sleeve Blouse with Pocket', detail: 'A green short-sleeve blouse with a practical chest pocket.' },
  19: { name: 'Light Green Dress with White Sleeves and Silver Bodice', detail: 'A light-green dress with white sleeves and silver detail on the bodice.' },
  18: { name: 'White Camisole with Silver Straps and Side Slit', detail: 'A white camisole with silver straps and a side slit for a refined evening look.' },
  17: { name: 'Peach Mother-of-the-Bride Dress with Trench Coat', detail: 'A peach formal dress styled with a coordinating trench coat for a mother-of-the-bride or other special occasion look.' },
  16: { name: 'Black Beaded Neck and Waist Dress', detail: 'A black dress with bead details at the neckline and waist.' },
  15: { name: 'Grey Off-Shoulder Dress', detail: 'A grey off-shoulder dress with a clean, elegant neckline.' },
  14: { name: 'Lime Green Floral Dress', detail: 'A lime-green floral dress for a bright daytime or occasion outfit.' },
  13: { name: 'White One-Shoulder Dress with Detachable Flower', detail: 'A white one-shoulder dress finished with a detachable flower detail.' },
  12: { name: 'Black Dress with Net-Detail Hem', detail: 'A black dress with net detailing at the hem.' },
  11: { name: 'Cream Strapless Occasion Dress', detail: 'A cream strapless dress for formal celebrations and evening occasions.' },
  10: { name: 'Light Blue V-Neck Dress with Kimono Sleeves', detail: 'A light-blue V-neck dress with relaxed kimono sleeves.' },
  9: { name: 'Off-White Linen Dress with Pockets and Belt', detail: 'A sleeveless off-white dress with pockets and a belt. The original catalogue lists linen fabric.' },
  8: { name: 'Multicoloured One-Sleeve Jumpsuit with Cover-Up', detail: 'A multicoloured one-sleeve jumpsuit with an attached cover-up.' },
  7: { name: 'Beige Long-Sleeve Fitted Jumpsuit', detail: 'A beige, body-hugging jumpsuit with long sleeves.' },
  6: { name: 'Green and White Sleeveless Top with Silver Straps', detail: 'A sleeveless green-and-white top with silver straps.' },
  5: { name: 'Blue and White Cotton Crop Top with Front Bow', detail: 'A blue-and-white crop top with a bow at the front. The original catalogue lists cotton fabric.' },
  4: { name: 'Black and White Patterned Sleeveless Jumpsuit', detail: 'A sleeveless jumpsuit with a black-and-white patterned top.' },
  3: { name: 'Navy and White Vertical-Stripe Belted Blazer', detail: 'A navy-and-white vertically patterned blazer with a coordinating belt.' },
  2: { name: 'Yellow Sleeveless Floral Dress', detail: 'A yellow floral dress with a sleeveless cut for a bright occasion or daytime look.' },
  1: { name: 'Navy Blue Culotte Trousers', detail: 'Navy-blue culotte trousers with a relaxed, wide-leg silhouette.' },
};

const stripHtml = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const titleCase = value => value.replace(/\b\w/g, char => char.toUpperCase());

try {
  const dryRun = process.argv.includes('--dry-run');
  const products = await prisma.product.findMany({ where: { id: { in: Object.keys(copy).map(Number) } }, include: { attributes: { include: { attribute: true } }, images: { orderBy: { position: 'asc' } }, categories: { include: { category: true } } } });
  if (dryRun) console.info(JSON.stringify({ mode: 'dry-run', productsFound: products.length, productsExpected: Object.keys(copy).length, products: products.map(product => ({ id: product.id, currentName: product.name, newName: copy[product.id]?.name, images: product.images.length })) }));
  let imageCount = 0;
  for (const product of products) {
    const item = copy[product.id];
    const attributes = product.attributes.reduce((out, attribute) => {
      const key = attribute.attribute.name.toLowerCase();
      (out[key] ||= []).push(attribute.value);
      return out;
    }, {});
    const colours = [...new Set(attributes.color || attributes.colour || [])];
    const sizes = [...new Set(attributes.size || [])];
    const categoryNames = product.categories.map(link => link.category.name);
    const searchText = item.name.toLowerCase();
    const categoryText = /jumpsuit/.test(searchText) ? 'women’s jumpsuits' : /trouser suit|two-piece/.test(searchText) || categoryNames.includes('Two-Piece Sets') ? 'women’s two-piece sets and trouser suits' : /trouser|culotte/.test(searchText) ? 'women’s trousers and bottoms' : /blouse|\btop\b|blazer|jacket|tank/.test(searchText) || categoryNames.includes('Tops') ? 'women’s blouses, tops and jackets' : categoryNames.includes('Wedding Wear') ? 'formal and wedding guest outfits' : 'women’s dresses and occasionwear';
    const sizeText = sizes.length ? ` Sizes currently listed for this style: ${sizes.join(', ')}.` : '';
    const colourText = colours.length ? ` The listed colour is ${colours.join(' / ')}.` : '';
    const intro = `${item.detail}${colourText}${sizeText}`;
    const description = `${intro} Part of the imported women’s fashion selection at LynMarie Boutique, Nairobi. Check the product photos, current price and available options before ordering. Shop online in Kenya, choose delivery, or collect from our Jamia Mall boutique.`;
    const metaDescription = `${item.name}${colours.length ? ` in ${colours.join(' / ')}` : ''}. Shop imported ${categoryText} at LynMarie Boutique, Nairobi. View real photos, listed sizes and price; order online in Kenya or collect at Jamia Mall.`.slice(0, 300);
    const metaTitle = `${item.name} | LynMarie Boutique Kenya`.slice(0, 250);
    if (dryRun) continue;
    await prisma.product.update({ where: { id: product.id }, data: { name: item.name, shortDescription: intro, description, metaTitle, metaDescription } });
    for (const [position, image] of product.images.entries()) {
      const altText = `${item.name}${colours.length ? ` in ${colours.join(' and ')}` : ''} — women’s clothing at LynMarie Boutique, Nairobi, Kenya, product photo ${position + 1}`;
      await prisma.productImage.update({ where: { id: image.id }, data: { altText } });
      imageCount += 1;
    }
  }

  const categoryDescriptions = {
    'sale': 'Shop sale clothing at LynMarie Boutique in Nairobi. Browse selected imported women’s dresses, trouser suits and occasionwear at reduced prices while stock lasts.',
    'two-piece-sets': 'Shop women’s two-piece sets and trouser suits in Kenya. Explore coordinated tops and trousers from LynMarie Boutique, with current sizes, colours and prices listed on each product.',
    'wedding-wear': 'Find wedding guest dresses and formal occasionwear at LynMarie Boutique in Nairobi. Explore long dresses, dinner dresses and polished outfits for celebrations in Kenya.',
    'tops': 'Browse women’s tops and blouses at LynMarie Boutique. Shop imported styles online in Kenya and check each product for available colours, sizes and current prices.',
    'dresses': 'Shop women’s dresses online in Kenya, from floral day dresses and work dresses to dinner dresses, gowns and wedding guest outfits. See current sizes and prices at LynMarie Boutique.',
    'jumpsuits': 'Browse women’s jumpsuits in Kenya, including occasion-ready and everyday styles. View the available colours, sizes and prices at LynMarie Boutique in Nairobi.',
    'bottoms': 'Shop women’s trousers and culottes at LynMarie Boutique. Browse current colours, sizes and prices, with online ordering and Nairobi shop collection.',
    'blazers-jackets': 'Explore women’s blazers and jackets at LynMarie Boutique, Nairobi. Shop statement prints and versatile layers, with current product photos, sizes and prices.',
    'uncategorized': 'Shop this LynMarie Boutique style online in Kenya or visit our Nairobi boutique. Check the product page for available photos, sizes and current prices.',
  };
  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
  const categoryBySlug = new Map(categories.map(category => [category.slug, category]));
  if (!dryRun) {
    const oldUncategorized = categoryBySlug.get('uncategorized');
    if (oldUncategorized) await prisma.category.update({ where: { id: oldUncategorized.id }, data: { name: 'Blazers & Jackets', slug: 'blazers-jackets' } });
    for (const [slug, name] of [['dresses', 'Dresses'], ['jumpsuits', 'Jumpsuits'], ['bottoms', 'Trousers & Bottoms'], ['blazers-jackets', 'Blazers & Jackets']]) {
      const description = categoryDescriptions[slug];
      const category = await prisma.category.upsert({ where: { slug }, create: { slug, name, description }, update: { name, description } });
      categoryBySlug.set(slug, category);
    }
    const assignment = {
      dresses: [107,106,105,104,103,51,49,48,47,46,45,43,41,40,39,38,36,29,27,21,19,17,16,15,14,13,12,11,10,9,2],
      jumpsuits: [35,8,7,4], bottoms: [24,1], 'blazers-jackets': [31,26,3],
      tops: [44,30,28,25,20,18,6,5], 'wedding-wear': [106,43,42,27,23,22,17,16,11],
    };
    for (const [slug, ids] of Object.entries(assignment)) {
      const category = categoryBySlug.get(slug);
      await prisma.productCategory.createMany({ data: ids.map(productId => ({ productId, categoryId: category.id })), skipDuplicates: true });
    }
  }
  for (const category of categories) {
    const slug = category.slug === 'uncategorized' ? 'blazers-jackets' : category.slug;
    const description = categoryDescriptions[slug] || `Browse ${titleCase(category.name)} at LynMarie Boutique, a Nairobi women’s clothing boutique. Explore imported fashion online in Kenya and check product pages for current prices, colours and sizes.`;
    if (!dryRun && category.slug !== 'uncategorized') await prisma.category.update({ where: { id: category.id }, data: { description } });
  }
  if (!dryRun) console.info(JSON.stringify({ productsUpdated: products.length, imagesRelabeled: imageCount, categoriesUpdated: categories.length + 3 }));
} finally {
  await prisma.$disconnect();
}
