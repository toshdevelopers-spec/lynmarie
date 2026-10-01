require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE_URL = process.env.WC_BASE_URL;
const CONSUMER_KEY = process.env.WC_KEY;
const CONSUMER_SECRET = process.env.WC_SECRET;

if (!BASE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error("Missing WC_BASE_URL, WC_KEY or WC_SECRET in .env");
    process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, "data");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const api = axios.create({
    baseURL: `${BASE_URL}/wp-json/wc/v3`,
    auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET
    },
    timeout: 60000
});

async function getAll(endpoint, params = {}, label = endpoint) {
    let page = 1;
    let all = [];

    while (true) {
        console.log(`Downloading ${label} - page ${page}...`);

        try {
            const response = await api.get(endpoint, {
                params: {
                    ...params,
                    per_page: 100,
                    page
                }
            });

            const items = response.data;

            if (!Array.isArray(items) || items.length === 0) {
                break;
            }

            all.push(...items);

            console.log(
                `  received ${items.length} records | total: ${all.length}`
            );

            const totalPages = Number(
                response.headers["x-wp-totalpages"] || 0
            );

            if (totalPages && page >= totalPages) {
                break;
            }

            if (items.length < 100) {
                break;
            }

            page++;
        } catch (error) {
            console.error(`Error downloading ${label}, page ${page}`);

            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Response:", error.response.data);
            } else {
                console.error(error.message);
            }

            throw error;
        }
    }

    return all;
}

function saveJSON(filename, data) {
    const filePath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2),
        "utf8"
    );

    console.log(
        `Saved ${data.length ?? "object"} records → ${filePath}`
    );
}

async function main() {
    console.log("======================================");
    console.log(" LynMarie WooCommerce Data Export");
    console.log("======================================\n");

    // Test authentication
    console.log("Testing WooCommerce API authentication...\n");

    try {
        await api.get("/products", {
            params: {
                per_page: 1
            }
        });

        console.log("API authentication successful.\n");
    } catch (error) {
        console.error("API authentication failed.");

        if (error.response) {
            console.error("HTTP status:", error.response.status);
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }

        process.exit(1);
    }

    // --------------------------------
    // PRODUCT CATEGORIES
    // --------------------------------

    const categories = await getAll(
        "/products/categories",
        {},
        "product categories"
    );

    saveJSON("categories.json", categories);

    // --------------------------------
    // PRODUCT TAGS
    // --------------------------------

    const tags = await getAll(
        "/products/tags",
        {},
        "product tags"
    );

    saveJSON("tags.json", tags);

    // --------------------------------
    // PRODUCT ATTRIBUTES
    // --------------------------------

    const attributes = await getAll(
        "/products/attributes",
        {},
        "product attributes"
    );

    saveJSON("attributes.json", attributes);

    // --------------------------------
    // PRODUCTS
    // --------------------------------

    const products = await getAll(
        "/products",
        {},
        "products"
    );

    saveJSON("products.json", products);

    // --------------------------------
    // PRODUCT VARIATIONS
    // --------------------------------

    const variations = [];

    for (const product of products) {
        if (
            product.type === "variable" ||
            (Array.isArray(product.variations) &&
                product.variations.length > 0)
        ) {
            console.log(
                `Downloading variations for product ${product.id}: ${product.name}`
            );

            const productVariations = await getAll(
                `/products/${product.id}/variations`,
                {},
                `variations for product ${product.id}`
            );

            for (const variation of productVariations) {
                variations.push({
                    ...variation,
                    parent_product_id: product.id
                });
            }
        }
    }

    saveJSON("variations.json", variations);

    // --------------------------------
    // CUSTOMERS
    // --------------------------------

    const customers = await getAll(
        "/customers",
        {},
        "customers"
    );

    saveJSON("customers.json", customers);

    // --------------------------------
    // ORDERS
    // --------------------------------

    const orders = await getAll(
        "/orders",
        {},
        "orders"
    );

    saveJSON("orders.json", orders);

    // --------------------------------
    // COUPONS
    // --------------------------------

    const coupons = await getAll(
        "/coupons",
        {},
        "coupons"
    );

    saveJSON("coupons.json", coupons);

    // --------------------------------
    // PRODUCT REVIEWS
    // --------------------------------

    const reviews = await getAll(
        "/products/reviews",
        {},
        "product reviews"
    );

    saveJSON("reviews.json", reviews);

    // --------------------------------
    // SHIPPING ZONES
    // --------------------------------

    const shippingZones = await getAll(
        "/shipping/zones",
        {},
        "shipping zones"
    );

    saveJSON("shipping-zones.json", shippingZones);

    // --------------------------------
    // TAXES
    // --------------------------------

    const taxes = await getAll(
        "/taxes",
        {},
        "taxes"
    );

    saveJSON("taxes.json", taxes);

    // --------------------------------
    // PAYMENT GATEWAYS
    // --------------------------------

    try {
        const paymentGateways = await api.get(
            "/payment_gateways"
        );

        saveJSON(
            "payment-gateways.json",
            paymentGateways.data
        );
    } catch (error) {
        console.log(
            "Could not export payment gateways. Continuing..."
        );
    }

    // --------------------------------
    // SHIPPING METHODS
    // --------------------------------

    try {
        const shippingMethods = await api.get(
            "/shipping_methods"
        );

        saveJSON(
            "shipping-methods.json",
            shippingMethods.data
        );
    } catch (error) {
        console.log(
            "Could not export shipping methods. Continuing..."
        );
    }

    // --------------------------------
    // SUMMARY
    // --------------------------------

    const summary = {
        exported_at: new Date().toISOString(),
        base_url: BASE_URL,
        counts: {
            categories: categories.length,
            tags: tags.length,
            attributes: attributes.length,
            products: products.length,
            variations: variations.length,
            customers: customers.length,
            orders: orders.length,
            coupons: coupons.length,
            reviews: reviews.length,
            shipping_zones: shippingZones.length,
            taxes: taxes.length
        }
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, "export-summary.json"),
        JSON.stringify(summary, null, 2)
    );

    console.log("\n======================================");
    console.log(" EXPORT COMPLETE");
    console.log("======================================");
    console.log(summary);
}

main().catch(error => {
    console.error("\nExport failed.");
    console.error(error);
    process.exit(1);
});
