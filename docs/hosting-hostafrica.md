# Host LynMarie Boutique on HOSTAFRICA

This project has a React/Vite storefront, an Express/Node.js API, and a PostgreSQL database. The steps below put the storefront and API on a HOSTAFRICA Linux VPS and use Neon for managed PostgreSQL.

## Accounts and services

1. Create or sign in to a [HOSTAFRICA account](https://my.hostafrica.com/), register/choose the domain, and order a **Linux VPS**. Choose an Ubuntu image that HOSTAFRICA currently offers, with at least 2 GB RAM as a practical starting point. This app needs full SSH access to keep its Node API running; do not order PHP shared hosting as the only server. HOSTAFRICA describes its Linux VPS as self-managed with root/SSH access and Linux options. See [HOSTAFRICA VPS information](https://help.hostafrica.com/article/flexible-linux-vps-hosting).
2. Create a [Neon account](https://console.neon.tech/signup), then create a PostgreSQL project/database for the shop. Neon’s [connection guide](https://neon.com/docs/get-started/connect-neon) explains how to copy a PostgreSQL connection string from the **Connect** dialog.
3. Keep the domain, VPS IP address, Neon connection string, SSH key, and passwords available. Never put database or JWT secrets in frontend environment variables or commit them to Git.

## 1. Create the production database

In Neon, create a project and database. Select a region reasonably close to the HOSTAFRICA VPS region, if Neon offers one. In **Connect**, select the project, branch, database and role, then copy both the pooled and direct connection strings. Use the pooled URL for API traffic and the direct URL for migrations and imports. Each connection string should look similar to:

```text
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

Use the actual values Neon gives you; the example above is not a working credential. Keep them private. Set the pooled URL (hostname includes `-pooler`) as `DATABASE_URL` for API traffic, and the direct URL (hostname has no `-pooler`) as `DATABASE_URL_UNPOOLED` for Prisma migrations and imports. Neon documents both connection types in its [connection guide](https://neon.com/docs/get-started/connect-neon).

## 2. Point your domain at HOSTAFRICA

In the domain’s DNS manager, create:

- An `A` record for `@` pointing to the VPS public IPv4 address.
- A `CNAME` record for `www` pointing to your root domain (or a second `A` record to the same IP).

DNS changes can take time to become visible. Use the root domain consistently below, for example `lynmarieboutique.com`.

## 3. Prepare the VPS

Log in to the VPS over SSH using the access details HOSTAFRICA provides. The commands below assume Ubuntu and a domain called `lynmarieboutique.com`; replace the domain and repository placeholders with your actual values.

Install system packages and Node.js 22 (the project requires a modern Node version):

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx git curl ca-certificates build-essential
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

Create a dedicated, unprivileged service account and check out the project. First push the project to a private Git repository, then use its clone URL here. If you prefer not to use Git, upload the project files to `/var/www/lynmarie` with `scp` instead.

```bash
sudo adduser --disabled-password --gecos "" lynmarie
sudo mkdir -p /var/www/lynmarie
sudo chown lynmarie:lynmarie /var/www/lynmarie
sudo -iu lynmarie
git clone YOUR_PRIVATE_REPOSITORY_URL /var/www/lynmarie
```

If cloning into a directory that already contains uploaded files, do not run `git clone` over it. Deploy into an empty directory or upload the files into `/var/www/lynmarie`.

## 4. Configure the API and database

Create the backend environment file on the server. Edit it without sharing the contents:

```bash
cd /var/www/lynmarie/backend
cp .env.example .env
nano .env
```

Set production values in `backend/.env` (use Neon’s pooled URL for `DATABASE_URL`):

```dotenv
NODE_ENV=production
PORT=5000
DATABASE_URL="paste-the-Neon-pooled-connection-string-here"
DATABASE_URL_UNPOOLED="paste-the-Neon-direct-connection-string-here"
JWT_SECRET="paste-a-long-random-secret-here"
FRONTEND_URL="https://lynmarieboutique.com,https://www.lynmarieboutique.com"
```

Generate a suitable JWT secret with `openssl rand -base64 48`, then paste its output into the file. Keep `backend/.env` readable only by the service account:

```bash
chmod 600 /var/www/lynmarie/backend/.env
```

Install dependencies, create the Prisma client, and apply database migrations:

```bash
cd /var/www/lynmarie/backend
npm ci
npm run db:generate
npm run db:migrate
```

### Import existing shop data, if needed

If the current catalogue/customer export is available, upload its JSON files to a private folder on the VPS. The export needs the files expected by `backend/scripts/migration/import-woocommerce.js` (including `products.json`, `categories.json`, `customers.json`, and the other export files). Then set `WC_EXPORT_DIR` to that folder and use the direct Neon URL for the one-off import:

```bash
cd /var/www/lynmarie/backend
DATABASE_URL="$DATABASE_URL_UNPOOLED" WC_EXPORT_DIR=/path/to/private/export/data npm run data:import
```

Do not run the import unless you have the export files. It is designed to be repeatable, but it can update existing imported product/customer records. If there is no export, continue; products can be created from the admin dashboard after setup.

Create or promote the owner admin account. The script uses the email `adelewigitz@gmail.com`; if the account has no password, it prompts securely for one:

```bash
cd /var/www/lynmarie/backend
npm run admin:bootstrap
```

Use a unique password of at least 12 characters and store it in a password manager.

## 5. Build the frontend for your domain

Set the public API URL **before** building Vite. The Nginx configuration below serves the API at the same domain under `/api`:

```bash
cd /var/www/lynmarie/frontend
printf 'VITE_API_URL=https://lynmarieboutique.com/api\n' > .env.production
npm ci
npm run build
```

If you use a different domain, replace it in `.env.production` and in the backend `FRONTEND_URL`, then rebuild. `VITE_` values are included in browser code, so never put secrets in them.

## 6. Keep the Node API running with systemd

The dependency installs and build above can run as `lynmarie`. Before continuing, leave that account's shell by typing `exit`, then run the following server administration commands from your original SSH account (which has `sudo` access). Do not grant the application account root access just to install the service.

Find the Node binary path with `command -v node` (commonly `/usr/bin/node`), then create a systemd service. If you used another path for the project or Node, adjust it below:

```bash
sudo nano /etc/systemd/system/lynmarie-api.service
```

Use this service definition:

```ini
[Unit]
Description=LynMarie Boutique API
After=network.target

[Service]
Type=simple
User=lynmarie
Group=lynmarie
WorkingDirectory=/var/www/lynmarie/backend
EnvironmentFile=/var/www/lynmarie/backend/.env
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable the API service and inspect its status/logs:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now lynmarie-api
sudo systemctl status lynmarie-api
sudo journalctl -u lynmarie-api -n 100 --no-pager
```

## 7. Configure Nginx and HTTPS

Create the site configuration:

```bash
sudo nano /etc/nginx/sites-available/lynmarie
```

Add this configuration, replacing the domain in both `server_name` lines:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name lynmarieboutique.com www.lynmarieboutique.com;

    root /var/www/lynmarie/frontend/dist;
    index index.html;
    client_max_body_size 10m;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site and allow web traffic through the firewall:

```bash
sudo ln -s /etc/nginx/sites-available/lynmarie /etc/nginx/sites-enabled/lynmarie
sudo nginx -t
sudo systemctl reload nginx
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Do not open port `5000` to the public internet; Nginx forwards `/api` traffic to the API locally. Then add free HTTPS using Certbot after DNS points to the VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lynmarieboutique.com -d www.lynmarieboutique.com
```

## 8. Confirm the live site

Open `https://lynmarieboutique.com`, visit a product, sign in to `/auth/login`, and open `/admin`. Check the API health endpoint:

```text
https://lynmarieboutique.com/api/health
```

It should return a success response with the database and schema marked ready. If it reports a missing schema, run `npm run db:migrate` from the backend directory and restart `lynmarie-api`. For service errors, check `sudo journalctl -u lynmarie-api -n 100 --no-pager` and Nginx logs at `/var/log/nginx/error.log`.

## Updating the site later

After pushing changes to your Git repository, SSH into the VPS and run:

```bash
sudo -iu lynmarie
cd /var/www/lynmarie
git pull
cd backend
npm ci
npm run db:generate
npm run db:migrate
cd ../frontend
npm ci
npm run build
exit
```

Back in your original SSH account, restart the API service:

```bash
sudo systemctl restart lynmarie-api
```

For production data, schedule and verify database backups separately from code deployment. HOSTAFRICA notes that VPS backup plans/snapshots may be an add-on; do not assume a VPS snapshot replaces tested database backups. Keep the Neon database credentials private, review database usage/billing in Neon, and test restoring backups before relying on them.

## Important launch limitations

- Checkout currently records pending orders but does not charge cards or M-Pesa. Configure a payment provider and test its live callbacks before accepting online payments.
- Password reset does not have an email delivery provider configured, so production reset emails will not be sent yet.
- The database import depends on the original WooCommerce JSON export. Store that export securely and do not commit it to the source repository.
- If product photos still point to the previous store’s WordPress media URLs, migrate those images to storage you control before removing the old hosting account.
