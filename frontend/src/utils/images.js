export function hideBrokenProductImage(event) {
  event.currentTarget.remove();
}

export function isRepresentativeProductImage(image) {
  return Boolean(image?.src?.includes('/open-source/pexels-') || image?.thumbnail?.includes('/open-source/pexels-'));
}
