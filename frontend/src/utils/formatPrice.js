// Format price in Kenyan Shillings
export const formatPrice = (price) => {
  if (!price) return 'KSh 0.00';
  const numPrice = parseFloat(price);
  return `KSh ${numPrice.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Calculate discount percentage
export const calculateDiscount = (regularPrice, salePrice) => {
  if (!regularPrice || !salePrice) return 0;
  const regular = parseFloat(regularPrice);
  const sale = parseFloat(salePrice);
  if (regular <= sale) return 0;
  return Math.round(((regular - sale) / regular) * 100);
};

// Calculate cart total
export const calculateCartTotal = (items) => {
  return items.reduce((total, item) => {
    const price = Number(item.prices?.price ?? item.sale_price ?? item.price ?? 0) / (item.prices?.price != null ? 100 : 1);
    return total + (price * item.quantity);
  }, 0);
};

// Calculate cart subtotal (before discounts)
export const calculateCartSubtotal = (items) => {
  return items.reduce((total, item) => {
    const regularPrice = Number(item.prices?.regular_price ?? item.regular_price ?? item.price ?? 0) / (item.prices?.regular_price != null ? 100 : 1);
    return total + (regularPrice * item.quantity);
  }, 0);
};

// Calculate cart savings
export const calculateCartSavings = (items) => {
  return items.reduce((total, item) => {
    const regularPrice = Number(item.prices?.regular_price ?? item.regular_price ?? item.price ?? 0) / (item.prices?.regular_price != null ? 100 : 1);
    const salePrice = Number(item.prices?.price ?? item.sale_price ?? item.price ?? 0) / (item.prices?.price != null ? 100 : 1);
    if (regularPrice > salePrice) {
      return total + ((regularPrice - salePrice) * item.quantity);
    }
    return total;
  }, 0);
};
