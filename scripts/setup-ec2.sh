#!/usr/bin/env bash
set -euo pipefail

echo "-------------------------------------------------------"
echo "[Setup] BookSmart EC2 setup (idempotent) starting... $(date)"
echo "-------------------------------------------------------"

# 1. Update (idempotent)
sudo apt-get update -y

# 2. Node.js 20 (idempotent: skip if already installed)
if ! command -v node &>/dev/null || [[ $(node -v) != v20* ]]; then
    echo "[Setup] Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "[Setup] Node.js 20 already installed: $(node -v)"
fi

# 3. PM2 (idempotent: npm install -g is safe to repeat)
echo "[Setup] Installing PM2 global..."
sudo npm install -g pm2 --force
sudo pm2 startup ubuntu -u ubuntu --hp /home/ubuntu || true

# 4. Nginx (idempotent)
echo "[Setup] Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx || true

# 5. Redis (idempotent)
echo "[Setup] Installing Redis..."
sudo apt-get install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server || true

# 6. UFW Firewall (idempotent: ufw rules are additive, not duplicated)
echo "[Setup] Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000/tcp
echo "y" | sudo ufw enable || true

# 7. Nginx Config for BookSmart (idempotent: write/overwrite)
echo "[Setup] Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/booksmart > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    root /var/www/booksmart;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

# 8. Enable site (idempotent: ln -sf overwrites)
sudo ln -sf /etc/nginx/sites-available/booksmart /etc/nginx/sites-enabled/
# Remove default if it exists
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 9. App directories (idempotent)
sudo mkdir -p /home/ubuntu/booksmart
sudo mkdir -p /var/www/booksmart
sudo chown -R ubuntu:ubuntu /home/ubuntu/booksmart /var/www/booksmart

echo "-------------------------------------------------------"
echo "[Setup] EC2 setup complete! Instance is ready for deployment."
echo "-------------------------------------------------------"
