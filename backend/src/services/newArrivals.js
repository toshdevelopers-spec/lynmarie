import { prisma } from "../config/prisma.js";
import { productDto } from "../utils/product.js";

const settingKey = "home.new_arrivals";
const include = {
  images: { orderBy: { position: "asc" } },
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
  attributes: { include: { attribute: true } },
  brand: true,
};

export async function getNewArrivalIds() {
  const setting = await prisma.storeSetting.findUnique({ where: { key: settingKey } });
  return Array.isArray(setting?.value) ? setting.value.filter(id => Number.isInteger(id) && id > 0).slice(0, 8) : [];
}

export async function saveNewArrivalIds(ids) {
  return prisma.storeSetting.upsert({
    where: { key: settingKey },
    create: { key: settingKey, value: ids, updatedAt: new Date() },
    update: { value: ids, updatedAt: new Date() },
  });
}

export async function listNewArrivals() {
  const ids = await getNewArrivalIds();
  if (!ids.length) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    include,
  });
  const byId = new Map(rows.map(row => [row.id, row]));
  return ids.map(id => byId.get(id)).filter(Boolean).map(productDto);
}
