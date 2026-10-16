export function fallbackProductImage(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  image.src = "/images/stylish-woman-with-shopping-bags.webp";
}
