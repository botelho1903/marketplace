#!/bin/bash
# ============================================================
# MARKETPLACE - Production Setup Script
# ============================================================
# Usage: chmod +x setup-production.sh && ./setup-production.sh
# Run as root on your VPS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        MARKETPLACE - Production Setup Script                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script deve ser executado como root (use sudo)${NC}"
   exit 1
fi

# Get domain from user
read -p "Digite seu domínio (ex: marketplace.seusite.com): " DOMAIN
if [[ -z "$DOMAIN" ]]; then
    echo -e "${RED}Domínio é obrigatório${NC}"
    exit 1
fi

read -p "Digite seu email para Let's Encrypt: " EMAIL
if [[ -z "$EMAIL" ]]; then
    echo -e "${RED}Email é obrigatório${NC}"
    exit 1
fi

# Get MercadoPago credentials
echo -e "${YELLOW}Configurações do MercadoPago (Produção):${NC}"
read -p "MERCADO_PAGO_ACCESS_TOKEN (APP_USR-...): " MP_ACCESS_TOKEN
read -p "MERCADO_PAGO_PUBLIC_KEY (APP_USR-...): " MP_PUBLIC_KEY
read -p "MERCADO_PAGO_WEBHOOK_SECRET: " MP_WEBHOOK_SECRET

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-32)

# Database configuration
POSTGRES_DB="marketplace"
POSTGRES_USER="marketplace"

echo -e "${GREEN}✓ Credenciais coletadas${NC}"
echo ""

# Create project directory
PROJECT_DIR="/opt/marketplace"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo -e "${BLUE}=== Instalando dependências do sistema ===${NC}"
apt-get update
apt-get install -y \
    docker.io \
    docker-compose-plugin \
    nginx \
    certbot \
    python3-certbot-nginx \
    curl \
    jq \
    htop \
    ufw

systemctl enable docker
systemctl start docker

echo -e "${GREEN}✓ Docker instalado${NC}"

echo -e "${BLUE}=== Configurando Firewall ===${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo -e "${GREEN}✓ Firewall configurado${NC}"

echo -e "${BLUE}=== Clonando repositório ===${NC}"
read -p "URL do repositório Git (ex: https://github.com/usuario/marketplace.git): " GIT_REPO
if [[ -z "$GIT_REPO" ]]; then
    echo -e "${YELLOW}Pulando clone do repositório. Copie os arquivos manualmente para $PROJECT_DIR${NC}"
else
    git clone $GIT_REPO .
    echo -e "${GREEN}✓ Repositório clonado${NC}"
fi

echo -e "${BLUE}=== Criando arquivo .env.production ===${NC}"
cat > .env.production <<EOF
# ============================================================
# MARKETPLACE - Production Environment
# Generated: $(date)
# ============================================================

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# JWT & Encryption
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Database
DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres:5432/$POSTGRES_DB?schema=public
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Redis
REDIS_URL=redis://redis:6379

# MercadoPago (Production)
MERCADO_PAGO_ACCESS_TOKEN=$MP_ACCESS_TOKEN
MERCADO_PAGO_PUBLIC_KEY=$MP_PUBLIC_KEY
MERCADO_PAGO_WEBHOOK_SECRET=$MP_WEBHOOK_SECRET

# Email (configure with your provider)
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@$DOMAIN

# Cron
CRON_SECRET=$CRON_SECRET

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_PWA=true
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_RATE_LIMITING=true
ENABLE_DEBUG_LOGS=false
EOF

echo -e "${GREEN}✓ .env.production criado${NC}"

echo -e "${BLUE}=== Criando docker-compose.prod.yml ===${NC}"
cat > docker-compose.prod.yml <<EOF
# Auto-generated production override
services:
  app:
    environment:
      - NEXT_PUBLIC_APP_URL=https://$DOMAIN
      - NEXTAUTH_URL=https://$DOMAIN
    deploy:
      replicas: 3

  nginx:
    environment:
      - DOMAIN=$DOMAIN
      - EMAIL=$EMAIL
EOF

echo -e "${GREEN}✓ docker-compose.prod.yml criado${NC}"

echo -e "${BLUE}=== Configurando Nginx para Certbot (HTTP apenas) ===${NC}"
cat > /etc/nginx/sites-available/marketplace <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

ln -sf /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

mkdir -p /var/www/certbot
nginx -t && systemctl reload nginx

echo -e "${GREEN}✓ Nginx configurado para validação HTTP${NC}"

echo -e "${BLUE}=== Obtendo certificado SSL (Let's Encrypt) ===${NC}"
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Certificado SSL obtido com sucesso${NC}"
else
    echo -e "${RED}✗ Falha ao obter certificado. Verifique DNS e tente novamente.${NC}"
    echo -e "${YELLOW}Você pode rodar manualmente depois: certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
fi

echo -e "${BLUE}=== Gerando DH params ===${NC}"
if [ ! -f /etc/nginx/dhparam.pem ]; then
    openssl dhparam -out /etc/nginx/dhparam.pem 2048
fi

echo -e "${BLUE}=== Configurando Nginx final (HTTPS) ===${NC}"
# Copy our nginx configs
mkdir -p /etc/nginx/marketplace
cp -r nginx/* /etc/nginx/marketplace/

# Update domain in nginx config
sed -i "s/seu-dominio.com/$DOMAIN/g" /etc/nginx/marketplace/conf.d/marketplace.conf
sed -i "s/admin@seu-dominio.com/$EMAIL/g" /etc/nginx/marketplace/conf.d/marketplace.conf

# Include in main nginx.conf
if ! grep -q "include /etc/nginx/marketplace/conf.d" /etc/nginx/nginx.conf; then
    sed -i '/include \/etc\/nginx\/conf.d\/\*.conf;/a\    include /etc/nginx/marketplace/conf.d/*.conf;' /etc/nginx/nginx.conf
fi

nginx -t && systemctl reload nginx

echo -e "${GREEN}✓ Nginx HTTPS configurado${NC}"

echo -e "${BLUE}=== Subindo containers ===${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo -e "${YELLOW}Aguardando serviços iniciarem...${NC}"
sleep 30

echo -e "${BLUE}=== Executando migrações do banco ===${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

echo -e "${BLUE}=== Criando usuário admin inicial ===${NC}"
read -p "Email do admin inicial: " ADMIN_EMAIL
read -s -p "Senha do admin: " ADMIN_PASSWORD
echo ""

docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 12);
  await prisma.user.upsert({
    where: { email: '$ADMIN_EMAIL' },
    update: { role: 'ADMIN', status: 'ACTIVE', emailVerified: new Date() },
    create: {
      email: '$ADMIN_EMAIL',
      passwordHash: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date()
    }
  });
  console.log('Admin criado/atualizado');
}
createAdmin().catch(console.error).finally(() => prisma.\$disconnect());
"

echo -e "${GREEN}✓ Admin criado${NC}"

echo -e "${BLUE}=== Configurando renovação automática SSL ===${NC}"
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --nginx --deploy-hook 'nginx -s reload'") | crontab -

echo -e "${BLUE}=== Verificando saúde dos serviços ===${NC}"
sleep 10
curl -f https://$DOMAIN/api/health && echo -e "${GREEN}✓ Health check OK${NC}" || echo -e "${RED}✗ Health check falhou${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    SETUP CONCLUÍDO! 🎉                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Seu marketplace está rodando em:${NC} https://$DOMAIN"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Configure o webhook no MercadoPago:"
echo "   URL: https://$DOMAIN/api/webhooks/mercado-pago"
echo "   Eventos: payment.created, payment.updated"
echo ""
echo "2. Configure DNS do seu domínio:"
echo "   Tipo A    @     -> IP do seu servidor"
echo "   Tipo A    www   -> IP do seu servidor"
echo ""
echo "3. Teste os pagamentos:"
echo "   - Acesse https://$DOMAIN"
echo "   - Crie um produto"
echo "   - Faça um pedido de teste"
echo ""
echo "4. Monitore logs:"
echo "   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo ""
echo -e "${BLUE}Arquivos importantes:${NC}"
echo "  - .env.production (credenciais)"
echo "  - docker-compose.yml + docker-compose.prod.yml"
echo "  - /etc/nginx/marketplace/ (config nginx)"
echo "  - /etc/letsencrypt/ (certificados SSL)"
echo ""
echo -e "${GREEN}Para atualizar: cd $PROJECT_DIR && git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build${NC}"