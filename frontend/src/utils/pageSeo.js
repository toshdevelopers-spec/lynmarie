const upsertMeta = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);
  const created = !element;
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  const previous = element.getAttribute('content');
  element.setAttribute('content', content);
  return () => { if (created) element.remove(); else element.setAttribute('content', previous || ''); };
};

export function setPageSeo({ title, description, path, image, jsonLd, robots }) {
  const priorTitle = document.title;
  document.title = title;
  const restoreMeta = [
    upsertMeta('meta[name="description"]', { name: 'description' }, description),
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title),
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description),
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, `https://www.lynmarieboutique.com${path}`),
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title),
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description),
  ];
  if (robots) restoreMeta.push(upsertMeta('meta[name="robots"]', { name: 'robots' }, robots));
  if (image) restoreMeta.push(upsertMeta('meta[property="og:image"]', { property: 'og:image' }, image));
  let canonical = document.head.querySelector('link[rel="canonical"]');
  const createdCanonical = !canonical;
  if (!canonical) canonical = Object.assign(document.createElement('link'), { rel: 'canonical' });
  const previousCanonical = canonical.getAttribute('href');
  if (!canonical.isConnected) document.head.appendChild(canonical);
  canonical.href = `https://www.lynmarieboutique.com${path}`;
  const script = jsonLd ? document.createElement('script') : null;
  if (script) {
    script.type = 'application/ld+json';
    script.dataset.pageSeo = 'true';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
  return () => {
    document.title = priorTitle;
    restoreMeta.forEach(restore => restore());
    if (createdCanonical) canonical.remove(); else canonical.setAttribute('href', previousCanonical || '');
    script?.remove();
  };
}
