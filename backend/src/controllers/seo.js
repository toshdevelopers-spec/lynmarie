import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../middleware/errors.js';

const base = 'https://www.lynmarieboutique.com';
const xml = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export const sitemap = asyncHandler(async (_req, res) => {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, name: true, updatedAt: true, images: { select: { url: true, altText: true }, orderBy: { position: 'asc' } } }, orderBy: { updatedAt: 'desc' } }),
    prisma.category.findMany({ where: { products: { some: { product: { status: 'PUBLISHED' } } } }, select: { slug: true, updatedAt: true } }),
  ]);
  const pages = ['/', '/shop', '/collections', '/contact', '/shipping', '/returns', '/size-guide', '/faq', '/privacy', '/terms'];
  const entries = [
    ...pages.map(path => `<url><loc>${base}${path}</loc></url>`),
    ...categories.map(category => `<url><loc>${base}/category/${encodeURIComponent(category.slug)}</loc><lastmod>${category.updatedAt.toISOString()}</lastmod></url>`),
    ...products.map(product => `<url><loc>${base}/product/${encodeURIComponent(product.slug)}</loc><lastmod>${product.updatedAt.toISOString()}</lastmod>${product.images.map(image => `<image:image><image:loc>${xml(image.url)}</image:loc><image:title>${xml(image.altText || product.name)}</image:title></image:image>`).join('')}</url>`),
  ].join('');
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries}</urlset>`);
});
