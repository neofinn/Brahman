# Deploying Brahman on Hostinger

Brahman is a Next.js app with API routes (payments, optional AI and voice), so it needs **Node.js hosting** — not plain
shared PHP hosting. Two ways work on Hostinger.

## A. Hostinger Node.js web app (Business / Cloud plans)

1. hPanel → **Websites → Add website → Node.js app** (or "Deploy web app").
2. Connect GitHub and choose `neofinn/Brahman` (branch `main` once the PR is merged).
3. Settings:
   - Framework: **Next.js** · Node.js version: **20 or newer**
   - Build command: `npm install && npm run build`
   - Start command: `npm start` (Next.js reads the `PORT` Hostinger provides)
4. Add the environment variables below, then deploy and attach your domain. SSL is issued automatically.

## B. Hostinger VPS

```bash
# Ubuntu 22.04+, as a sudo user
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs nginx git
git clone https://github.com/neofinn/Brahman.git && cd Brahman
cp .env.example .env.local   # then fill in the keys below
npm install && npm run build
sudo npm install -g pm2 && pm2 start "npm start" --name brahman && pm2 save && pm2 startup
```

Nginx reverse proxy (`/etc/nginx/sites-available/brahman`), then `sudo certbot --nginx -d yourdomain.com`:

```nginx
server {
  server_name yourdomain.com www.yourdomain.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

To update: `git pull && npm install && npm run build && pm2 restart brahman`.

## Environment variables

| Variable | Needed for | Notes |
| --- | --- | --- |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Selling reports | Razorpay Dashboard → Settings → API Keys. Use `rzp_test_…` keys first, then live keys. |
| `REPORT_TOKEN_SECRET` | Selling reports | Any long random string; signs report unlock tokens. |
| `ANTHROPIC_API_KEY` | Optional AI search and learning | Users never need a key. |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Optional live natural voice | Recorded mantras and kathas work without it. |
| `KNOWLEDGE_FILE` | Optional | Path on persistent disk for learned knowledge. |
| `BRAHMAN_ADMIN_TOKEN` | Optional | To remove learned entries. |

Without the Razorpay keys the site still works: the free basic kundli PDF is available and paid reports show "Coming soon".

## Before taking real payments

- Complete Razorpay KYC and add your website URL, and publish Terms, Privacy, Refund and Contact pages (Razorpay requires them).
- Test a purchase with Razorpay **test keys** end to end, then switch to live keys.
- Prices are in `lib/reports.ts`.
