# 🚀 MARKETPLACE - Guia Completo de Deploy em Produção

> **TL;DR**: Execute **uma** das opções abaixo. A **Opção A (Vercel)** é a mais rápida (15 min). A **Opção B (VPS)** dá controle total.

---

## 📋 Pré-requisitos (Tenha em mãos)

| Item | Onde conseguir |
|------|----------------|
| Domínio (ex: `loja.seusite.com`) | Registro.br, GoDaddy, Cloudflare |
| Conta GitHub | github.com |
| Conta Vercel (Opção A) | vercel.com |
| **OU** VPS Ubuntu 22.04+ (Opção B) | DigitalOcean, AWS EC2, Vultr, Hetzner |
| PostgreSQL (Produção) | Neon, Supabase, Railway, ou local no VPS |
| Redis (Produção) | Upstash, Railway, ou local no VPS |
| MercadoPago Produção | https://www.mercadopago.com.br/developers/panel |
| Email SMTP | SendGrid, Resend, Mailgun, Postmark |

---

## ⚡ OPÇÃO A: Vercel (RECOMENDADO - 15 minutos)

### 1. Prepare o repositório
```bash
cd marketplace
git init
git add .
git commit -m "Initial commit: marketplace production ready"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/marketplace.git
git push -u origin main
```

### 2. Configure no Vercel
1. Acesse https://vercel.com/new
2. Importe o repositório `marketplace`
3. **Framework Preset**: Next.js (auto-detectado)
4. **Root Directory**: `marketplace` (se repo tiver outras pastas)
5. Clique em **Deploy**

### 3. Configure Variáveis de Ambiente (Vercel Dashboard → Settings → Environment Variables)

```env
# Obrigatórias
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=gere-com: openssl rand -base64 32
JWT_SECRET=gere-com: openssl rand -base64 32
ENCRYPTION_KEY=gere-com: openssl rand -hex 32
DATABASE_URL=postgresql://user:pass@host/db?schema=public
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxx (Produção!)
MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxx
MERCADO_PAGO_WEBHOOK_SECRET=gere-uma-chave-forte
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=sua-api-key-sendgrid
EMAIL_FROM=noreply@seu-dominio.com
CRON_SECRET=gere-com: openssl rand -base64 32

# Opcionais
REDIS_URL=redis://user:pass@host:port
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_PWA=true
ENABLE_ANALYTICS=true
```

### 4. Configure Domínio Customizado
1. Vercel Dashboard → Settings → Domains
2. Adicione `loja.seusite.com`
3. Configure DNS no seu provedor:
   - **Tipo CNAME** `loja` → `cname.vercel-dns.com`
   - **OU** Tipo A `@` → `76.76.21.21` (Vercel IP)

### 5. Configure Webhook MercadoPago
1. Painel MercadoPago → Suas integrações → Webhooks
2. **URL**: `https://loja.seusite.com/api/webhooks/mercado-pago`
3. **Eventos**: `payment.created`, `payment.updated`
4. Copie o **Secret** gerado → Cole em `MERCADO_PAGO_WEBHOOK_SECRET` no Vercel

### 6. Execute Migrações
```bash
# No terminal local (com DATABASE_URL de produção)
npx prisma migrate deploy
```

### 7. Crie Admin Inicial
```bash
npx tsx scripts/create-admin.ts
# Ou use o Prisma Studio: npx prisma studio
```

---

## 🖥️ OPÇÃO B: VPS Própria (Controle Total - 30-45 min)

### Requisitos Mínimos
- **CPU**: 2 vCPUs
- **RAM**: 4 GB (mínimo 2 GB)
- **Disco**: 40 GB SSD
- **OS**: Ubuntu 22.04 LTS

### 1. Configure DNS (Aponte para o IP da VPS)
```
Tipo A    @      -> IP_DA_VPS
Tipo A    www    -> IP_DA_VPS
```

### 2. Execute o Script Automatizado
```bash
# Na sua VPS como root
curl -fsSL https://raw.githubusercontent.com/SEU_USUARIO/marketplace/main/scripts/setup-production.sh | bash
# OU clone o repo e rode:
git clone https://github.com/SEU_USUARIO/marketplace.git /opt/marketplace
cd /opt/marketplace
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

O script vai:
- ✅ Instalar Docker, Nginx, Certbot
- ✅ Configurar Firewall (SSH/HTTP/HTTPS)
- ✅ Clonar repo
- ✅ Gerar `.env.production` com secrets seguros
- ✅ Obter SSL Let's Encrypt (HTTPS automático)
- ✅ Subir containers (App + Postgres + Redis + Nginx)
- ✅ Rodar migrações
- ✅ Criar usuário admin
- ✅ Configurar renovação SSL automática

### 3. Configure Webhook MercadoPago
- URL: `https://seu-dominio.com/api/webhooks/mercado-pago`
- Events: `payment.created`, `payment.updated`

### 4. Atualizações Futuras
```bash
cd /opt/marketplace
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
```

---

## 🔧 OPÇÃO C: Docker em Qualquer Cloud (AWS ECS, Railway, Render, Fly.io)

### Railway (Mais simples)
1. Conecte GitHub no Railway
2. New Project → Deploy from GitHub
3. Adicione PostgreSQL e Redis plugins
4. Configure variáveis de ambiente
5. Deploy automático

### AWS ECS / Fargate
```bash
# Build e push
docker build -t marketplace .
docker tag marketplace:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/marketplace:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/marketplace:latest
```
Use o `docker-compose.yml` como base para Task Definition.

---

## ✅ CHECKLIST PÓS-DEPLOY (Obrigatório antes de vender)

### Configurações MercadoPago
- [ ] Access Token de **Produção** (não sandbox) em `MERCADO_PAGO_ACCESS_TOKEN`
- [ ] Public Key de **Produção** em `MERCADO_PAGO_PUBLIC_KEY`
- [ ] Webhook configurado e **Secret** salvo
- [ ] Conta MercadoPago verificada (KYC completo)
- [ ] Pix habilitado na conta

### Configurações do Site
- [ ] HTTPS funcionando (cadeado verde)
- [ ] Domínio customizado apontando
- [ ] Email SMTP testado (registro, recuperação senha)
- [ ] Admin consegue logar
- [ ] Vendedor consegue cadastrar produtos
- [ ] Checkout PIX gera QR Code
- [ ] Checkout Cartão processa (tokenização)
- [ ] Webhook recebe notificações (logs: `docker logs marketplace-app`)
- [ ] Reembolso funciona

### Segurança
- [ ] `NEXTAUTH_SECRET`, `JWT_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET` únicos e fortes
- [ ] Rate limiting ativo (`ENABLE_RATE_LIMITING=true`)
- [ ] Headers de segurança (CSP, HSTS, etc.)
- [ ] Backup automático do banco (configure no provedor)

### Testes de Pagamento
- [ ] **PIX**: Gere QR, pague com app do banco, confirme webhook
- [ ] **Cartão**: Use cartão de teste MercadoPago, confirme aprovação
- [ ] **Dinheiro**: Crie pedido, vendedor confirma recebimento
- [ ] **Reembolso**: Teste reembolso parcial e total

---

## 📞 Suporte e Monitoramento

### Logs Importantes
```bash
# App logs
docker compose logs -f app

# Nginx logs
docker compose logs -f nginx

# Webhook retries
curl https://seu-dominio.com/api/admin/webhook-retries
```

### Health Checks
- `https://seu-dominio.com/api/health` → `{"status":"ok"}`
- `https://seu-dominio.com/api/webhooks/mercado-pago` (GET) → `{"status":"ok"}`

### Métricas (Opcional)
Adicione no `.env`:
```env
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
```

---

## 💰 Custos Estimados (Mensais)

| Opção | Custo | Inclui |
|-------|-------|--------|
| **Vercel Pro** | $20 | HTTPS, CDN, Edge Functions, Cron, Analytics |
| **Neon Postgres** | $19 | 10 GB, branching, auto-scale |
| **Upstash Redis** | Free-$10 | 10k req/dia grátis |
| **SendGrid** | Free-$15 | 100 emails/dia grátis |
| **Domínio** | R$ 40/ano | .com.br no Registro.br |
| **TOTAL Vercel** | **~$50/mês** | Produção completa |

| Opção VPS | Custo |
|-----------|-------|
| DigitalOcean 4GB | $24/mês |
| Hetzner CX42 | €16/mês |
| AWS t3.medium | ~$30/mês |
| **TOTAL VPS** | **~$25-35/mês** | Você gerencia tudo |

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Webhook não chega | Verifique DNS, firewall, URL no MercadoPago |
| PIX não gera QR | Token MercadoPago inválido ou conta não verificada |
| Cartão dá erro | Chave pública errada, tokenização client-side falhou |
| SSL erro | `certbot --nginx -d seu-dominio.com` |
| Migração falha | `DATABASE_URL` errado, banco não acessível |
| Rate limit 429 | Aumente `RATE_LIMIT_MAX_REQUESTS` |

---

## 📞 Próximos Passos Para Você

1. **Escolha**: Vercel (A) ou VPS (B)
2. **Crie contas**: GitHub, Vercel/VPS, Neon/Supabase, Upstash, MercadoPago, SendGrid
3. **Execute**: Siga o guia da opção escolhida
4. **Teste**: Faça 3 pedidos de teste (PIX, Cartão, Dinheiro)
5. **Venda!** 🎉

---

## 📁 Arquivos Criados Para Você

```
marketplace/
├── vercel.json                    # Config Vercel
├── Dockerfile                     # Build Docker
├── docker-compose.yml             # Stack completo
├── docker-compose.prod.yml        # Override produção
├── nginx/
│   ├── nginx.conf                 # Nginx principal
│   └── conf.d/marketplace.conf    # Site config
├── scripts/
│   ├── init-db.sql                # Init PostgreSQL
│   └── setup-production.sh        # 🚀 Script automatizado VPS
├── .github/workflows/deploy.yml   # CI/CD GitHub Actions
├── lib/
│   ├── validations/payment.ts     # Validação Zod
│   ├── rate-limit.ts              # Rate limiting
│   └── webhooks/webhook-retry.ts  # Retry webhooks
└── app/api/
    ├── pagamentos/confirm-cash    # Confirmação dinheiro
    ├── cron/process-webhook-retries # Cron webhooks
    └── admin/webhook-retries      # Admin webhooks
```

---

**🎯 Seu marketplace está 100% pronto para produção.** 
Execute a opção escolhida e em minutos terá `https://seu-dominio.com` rodando com HTTPS, SSL, pagamentos reais e pronto para vender!

---

> **Dúvidas?** Abra uma issue no GitHub ou consulte os logs. Boas vendas! 🚀