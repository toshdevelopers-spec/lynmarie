# LynMarie Boutique

React/Vite storefront backed by an Express API, Prisma 7, and PostgreSQL. The existing storefront layout and Tailwind styling remain in place; its commerce data now comes from the local API instead of browser calls to WooCommerce.

## Requirements and local setup

- Node.js 20 or newer
- PostgreSQL 14 or newer

Install each app's dependencies:

```sh
cd backend && npm install
cd ../frontend && npm install
```

### Start the app (separate terminals)

PostgreSQL must be running first. On Debian/Ubuntu with PostgreSQL 18, start the system cluster if needed:

```sh
sudo pg_ctlcluster 18 main start
```

Create the `lynmarie` database once if it does not exist, then configure `backend/.env` with its connection URL:

```sh
sudo -u postgres createdb lynmarie
```

**Terminal 1 — backend API:**

```sh
cd ~/Desktop/lyn-marie/backend
npm run db:migrate
npm run data:import
npm run dev
```

The migration command applies all committed schema updates. The data import only needs to run once after the first migration; repeat runs are safe.

**Terminal 2 — frontend:**

```sh
cd ~/Desktop/lyn-marie/frontend
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`; if that port is already occupied Vite selects the next free port). Set `FRONTEND_URL` in the ignored backend `.env` to that exact origin. Multiple local origins can be comma-separated, for example `http://localhost:5173,http://localhost:5174`. The frontend defaults to `VITE_API_URL=http://localhost:5000/api`.

For a fresh machine, copy `backend/.env.example` to `backend/.env`, set the pooled Neon URL as `DATABASE_URL`, the direct Neon URL as `DATABASE_URL_UNPOOLED`, and a long random `JWT_SECRET`. Copy `frontend/.env.example` to `frontend/.env`. The API uses `DATABASE_URL`; Prisma migrations use `DATABASE_URL_UNPOOLED` when present. Keep both database URLs and `JWT_SECRET` backend-only. Never define WooCommerce credentials as `VITE_` variables.

Apply the committed schema migration and start both servers in separate terminals:

```sh
cd backend
npm run db:migrate
npm run dev
```

```sh
cd frontend
npm run dev
```

Check `GET http://localhost:5000/api/health` for the API health response. Backend starts with Helmet security headers, explicit configured-origin CORS, JSON parsing, and request logging.

## Architecture

```text
frontend React pages/components
  -> frontend/src/services/api.js (API URL, bearer token, response handling)
  -> Express routes -> controllers -> services -> Prisma
  -> PostgreSQL
```

Frontend responsibilities:

- React Router owns storefront, authentication, account, cart, and checkout pages.
- `src/services/` is the API boundary; `src/hooks/` and contexts expose data and state to existing UI components.
- Product responses are shaped to retain the field names the storefront already uses (`images[].src`, `prices.*`, `regular_price`, and category/tag arrays). API `prices.*` are integer minor units for existing cart math; the simpler price fields are KSh amounts.
- The cart remains in local storage. At checkout the browser sends product IDs and quantities only. The API reads current prices and stock from PostgreSQL, calculates totals, and records a pending order. A signed-in customer owns the order; guests may check out with billing details.

Backend responsibilities:

- `src/routes`, `controllers`, `services`, `middleware`, `config`, and `utils` separate HTTP wiring, request handling, business rules, authentication/security, Prisma setup, and response shaping.
- JWT bearer authentication and bcrypt password hashes protect customer endpoints. Admin routes check the active database role on every request; use `npm run admin:bootstrap` for the fixed owner account.
- Zod validates authentication, order, and customer inputs. Production error responses do not include stack traces or internal database messages.
- Prisma's PostgreSQL URL is configured through `prisma.config.ts`; `schema.prisma` intentionally has no datasource URL.

## WooCommerce business-data import

The importer reads JSON exports from `~/LynMarie-Migration/api-export/data` (override with backend-only `WC_EXPORT_DIR`). It does not connect to WordPress or import WordPress tables, plugins, passwords, or settings. It uses `wordpressId` as a trace field and new PostgreSQL IDs as application primary keys.

Run after applying the schema migration:

```sh
cd backend
npm run data:import
```

The operation is idempotent: it upserts categories, tags, brands, attributes, customers, addresses, and products, replaces product relationship rows, and upserts image links by product and original media ID. It keeps image URLs and metadata without downloading duplicate files. It can import order line snapshots if a later verified `orders.json` contains orders; current export has zero, so no historical orders are created. Product variations are not fabricated. Imported users have no password hash; they can set a new password by registering with the same email. The script prints counts and failed records with type, WooCommerce ID, and reason; it avoids logging customer profile values.

Current export summary: 58 simple published products, 121 product images, 10 categories, 123 tags, 2 global attributes, 83 customers, zero variations, and zero orders. Brands are derived from product brand data because no separate brands export is present. Image URLs still point to the old WordPress uploads and can later be copied into new media storage.

The export also contains shipping-zone/method, tax, and payment-gateway configuration files. They are not loaded into this first application schema: the current checkout has no agreed shipping/tax calculation rules or payment provider integration. The importer does not silently reinterpret those settings as live checkout behavior.

## API routes

- `GET /api/health`
- `GET /api/products` supports `page`, `limit`/`per_page`, `search`, `category` (ID or slug), `brand` (ID or slug), `minPrice`, `maxPrice`, `sort`, `orderby`, `order`, `featured`, `on_sale`, and `stockStatus`.
- `GET /api/products/:id` and `GET /api/products/slug/:slug`
- `GET /api/categories`, `GET /api/categories/:id`, `GET /api/brands`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/auth/me`
- `GET/PATCH /api/customers/me`, `GET /api/customers/me/orders`, `GET /api/customers/me/addresses`, `PUT /api/customers/me/addresses/:type`, `POST /api/customers/me/password`
- `POST /api/cart` validates and prices a submitted cart; the app currently keeps cart state client-side.
- `POST /api/orders` creates a server-priced pending order. `GET /api/orders` and `GET /api/orders/:id` are for the authenticated customer's orders.
- `GET /api/reviews`, `GET /api/products/:id/reviews`, and `POST /api/reviews` (new reviews require moderation).
- `POST /api/inquiries` stores contact-form messages; `POST /api/events` records anonymous visitor, search, product-view, and cart-add activity.
- `/api/admin/*` endpoints require an authenticated admin. These manage products, inventory, categories, customers/staff, orders, reviews, enquiries, cart activity, and dashboard summaries.

Responses use `{ success, data, message? }`; product lists also include `pagination`. Product lookup accepts numeric internal IDs, numeric original IDs, or slugs as applicable.

## Password reset, payment, and shipping boundaries

Password-reset tokens are random, stored only as hashes, expire after an hour, and are single-use. This repo has no mail provider configured: development returns a reset token and the existing reset screen lets you choose a new password; production returns the generic success response and requires an email delivery provider to be connected before customer-facing reset email can work. No reset token or customer password is written to logs.

Orders currently use `PENDING` and record the selected payment method; this code does not charge a card, initiate M-Pesa, calculate shipping fees, or send order email. Those integrations require provider credentials and business rules. The database stores order-item product name/SKU/quantity/unit price/total snapshots so history remains readable if the product changes later.

## Store admin and inventory

Run the owner bootstrap once after the database migration. It securely prompts for the first owner password (input is not echoed) and promotes the matching account without changing an existing password:

```sh
cd backend
npm run admin:bootstrap
```

The only owner account is `adelewigitz@gmail.com`. Sign in through the normal login page, then open `/admin`. Both the route and every management API require the `ADMIN` role; the frontend check is only a convenience, and API authorization is enforced by the backend. The owner can create additional administrators. Other admins can add customers, but cannot grant admin access or disable the owner.

The dashboard provides a left-side navigation for products and stock, shop categories, customer/staff access, orders, cart activity, frequent visitors, reviews, and contact enquiries. Product fields include category links, image URLs, descriptions, sale and regular prices, stock quantity, visibility, and SEO title/description. Removing a product archives it from the storefront so historic order snapshots remain intact. Disabling a user preserves their orders. When a stock-managed order is created, inventory is atomically decremented; a product reaching zero stock is marked out of stock and disappears from public catalog/search/detail results. To put it back on sale, edit its quantity and publish it.

The cart remains browser-local for now; admin cart activity is an event record of additions (product, anonymous visitor ID, quantity, timestamp), not a live synchronized cart. Frequent visitor metrics use a random browser identifier and event counts, not names or email addresses. A submitted contact form is stored as an enquiry in PostgreSQL. Admin-created product images currently use URLs; the existing WordPress product image links are retained by the importer and can be replaced with new media URLs later.

## Validation and checks

```sh
cd backend
npm run db:validate
npm run db:generate
npm run db:migrate
```

```sh
cd frontend
npm run lint
npm run build
```

Backend API/database checks and the data importer require a reachable PostgreSQL database configured in `backend/.env`. Keep credentials out of source control and client bundles.
