import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { categorySeoFor } from '../src/utils/categorySeo.js';

const origin = 'https://www.lynmarieboutique.com';
const api = (process.env.VITE_API_URL || 'https://lynmarie-backend.vercel.app/api').replace(/\/+$/, '');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const plain = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

try {
  const allProducts = [];
  let page = 1;
  let totalPages = 1;
  do {
    let response;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(`${api}/products?limit=100&page=${page}`, { signal: AbortSignal.timeout(20000) });
        break;
      } catch (error) {
        lastError = error;
        if (attempt === 2) throw new Error(`Unable to fetch ${api}/products (3 attempts): ${error.cause?.code || error.message}`);
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    if (!response.ok) throw new Error(`Product API returned ${response.status}`);
    const result = await response.json();
    allProducts.push(...(result.data || []));
    totalPages = result.pagination?.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  let categories = [];
  try {
    const response = await fetch(`${api}/categories`, { signal: AbortSignal.timeout(20000) });
    if (response.ok) categories = (await response.json()).data || [];
    else console.warn(`Category SEO prerender skipped: category API returned ${response.status}.`);
  } catch (error) {
    console.warn(`Category SEO prerender skipped: ${error.cause?.code || error.message}`);
  }

  const template = await readFile(path.resolve('dist/index.html'), 'utf8');
  for (const product of allProducts) {
    const slug = String(product.slug || product.id).replace(/[^a-z0-9-]/gi, '');
    if (!slug) continue;
    const title = product.metaTitle || `${product.name} | LynMarie Boutique Kenya`;
    const description = product.metaDescription || plain(product.short_description || product.description) || `Shop ${product.name} online in Kenya from LynMarie Boutique, Nairobi. View current price, product photos, colours and available sizes.`;
    const url = `${origin}/product/${slug}`;
    const image = product.images?.[0]?.src || `${origin}/logo.webp`;
    const price = Number(product.price || 0).toFixed(2);
    const availability = product.stock_status === 'outofstock' ? 'https://schema.org/OutOfStock' : product.stock_status === 'onbackorder' ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock';
    const productSchema = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description, image: (product.images || []).map(item => item.src).filter(Boolean), sku: product.sku || undefined, brand: { '@type': 'Brand', name: 'LynMarie Boutique' }, offers: { '@type': 'Offer', url, priceCurrency: 'KES', price, availability, itemCondition: 'https://schema.org/NewCondition' } };
    const photos = (product.images || []).map((item, index) => `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || `${product.name} product photo ${index + 1} from LynMarie Boutique, Nairobi, Kenya`)}" loading="${index ? 'lazy' : 'eager'}" style="width:min(42vw,420px);max-height:560px;object-fit:contain;margin:8px">`).join('');
    const fallback = `<main class="seo-prerender" style="max-width:1100px;margin:2rem auto;padding:1rem;font-family:Arial,sans-serif;color:#241532"><nav><a href="/">LynMarie Boutique</a> / <a href="/shop">Shop women’s fashion in Kenya</a> / ${escapeHtml(product.name)}</nav><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(description)}</p><p><strong>Price: KES ${escapeHtml(price)}</strong></p>${photos}<p>Shop imported women’s clothing online in Kenya or visit LynMarie Boutique at Jamia Mall, 1st Floor, Shop F56, Nairobi. Check the live product page for available sizes, colours and stock.</p><p><a href="/product/${escapeHtml(slug)}">View ${escapeHtml(product.name)} and order online</a></p></main>`;
    let html = template
      .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${escapeHtml(url)}" />`)
      .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escapeHtml(image)}" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
      .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`)
      .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
      .replace('</head>', `<script type="application/ld+json">${JSON.stringify(productSchema).replace(/</g, '\\u003c')}</script></head>`);
    const outputDir = path.resolve('dist/product');
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, `${slug}.html`), html);
  }

  let prerenderedCategories = 0;
  for (const category of categories) {
    const slug = String(category.slug || '').replace(/[^a-z0-9-]/gi, '');
    if (!slug) continue;
    const items = allProducts.filter(product => product.categories?.some(item => item.slug === category.slug));
    if (!items.length) continue;
    const seo = categorySeoFor(category.slug, category.name);
    const url = `${origin}/category/${slug}`;
    const cards = items.map(product => {
      const productSlug = String(product.slug || product.id).replace(/[^a-z0-9-]/gi, '');
      const image = product.images?.[0]?.thumbnail || product.images?.[0]?.src;
      const price = product.on_sale && product.sale_price ? product.sale_price : product.price;
      return `<article style="min-width:0;border:1px solid #eee5ed;border-radius:12px;overflow:hidden;background:#fff"><a href="/product/${escapeHtml(productSlug)}" style="color:#241532;text-decoration:none"><img src="${escapeHtml(image || `${origin}/logo.webp`)}" alt="${escapeHtml(product.images?.[0]?.alt || `${product.name} from LynMarie Boutique, Nairobi, Kenya`)}" loading="lazy" style="display:block;width:100%;aspect-ratio:3/4;object-fit:cover"><div style="padding:12px"><h3 style="margin:0 0 8px;font-size:16px">${escapeHtml(product.name)}</h3><p style="margin:0;color:#4c00b0;font-weight:700">KES ${escapeHtml(price)}</p></div></a></article>`;
    }).join('');
    const related = seo.related.map(item => `<li><a href="/category/${escapeHtml(item.slug)}">${escapeHtml(item.label)}</a></li>`).join('');
    const collectionSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: seo.heading,
      description: seo.description,
      url,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((product, index) => ({
          '@type': 'ListItem', position: index + 1,
          url: `${origin}/product/${String(product.slug || product.id).replace(/[^a-z0-9-]/gi, '')}`,
          name: product.name,
        })),
      },
    };
    const fallback = `<main style="max-width:1200px;margin:2rem auto;padding:1rem;font-family:Arial,sans-serif;color:#241532"><nav aria-label="Breadcrumb"><a href="/">LynMarie Boutique</a> / <a href="/collections">Clothing collections</a> / ${escapeHtml(category.name)}</nav><h1>${escapeHtml(seo.heading)}</h1><p style="max-width:850px;line-height:1.7">${escapeHtml(seo.intro)}</p><nav aria-label="Related collections"><ul>${related}</ul></nav><h2>Shop ${escapeHtml(category.name)} online</h2><p>${items.length} styles available from LynMarie Boutique in Nairobi, with delivery across Kenya and collection at Jamia Mall.</p><section aria-label="${escapeHtml(category.name)} products" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px">${cards}</section></main>`;
    const image = items[0]?.images?.[0]?.src || `${origin}/logo.webp`;
    const html = template
      .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(seo.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(seo.title)}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${escapeHtml(url)}" />`)
      .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escapeHtml(image)}" />`)
      .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
      .replace('</head>', `<script type="application/ld+json">${JSON.stringify(collectionSchema).replace(/</g, '\\u003c')}</script></head>`);
    await mkdir(path.resolve('dist/category'), { recursive: true });
    await writeFile(path.resolve('dist/category', `${slug}.html`), html);
    prerenderedCategories += 1;
  }
  console.info(`Generated SEO product pages for ${allProducts.length} live products.`);
  console.info(`Generated SEO category pages for ${prerenderedCategories} live collections.`);
} catch (error) {
  console.warn(`Product SEO prerender skipped: ${error.message}`);
}
