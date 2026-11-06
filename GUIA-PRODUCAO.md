# Guia Completo - Marketplace Botelho Multi-Vendedor
# Produção: https://www.botelho.com

## ✅ JÁ FEITO
- [x] Neon PostgreSQL criado e conectado
- [x] Schema Prisma pushado no banco
- [x] Deploy Vercel funcionando: https://www.botelho.com
- [x] `DATABASE_URL` em produção
- [x] Scripts de setup criados: `setup-env.ps1` e `setup-env.sh`

---

## 📋 CHECKLIST DE PRODUÇÃO (FAZER AGORA)

### 1. PREENCHER setup-env.ps1 COM SEUS VALORES REAIS
```powershell
# Edite o arquivo e substitua os XXXXXX pelos valores reais
notepad C:\Users\User\marketplace\setup-env.ps1
```

### 2. RODAR O SCRIPT
```powershell
cd C:\Users\User\marketplace
.\setup-env.ps1
```

### 3. INSTALAR UPSTASH REDIS (GRATUITO)
```bash
# 1. Aceite termos no browser:
# https://vercel.com/ianbotelho4-8158/~/integrations/accept-terms/upstash?source=cli

# 2. Instale:
vercel install upstash/upstash-kv
```

### 4. CONFIGURAR STRIPE CONNECT (ESSENCIAL P/ MULTI-VENDEDOR)
1. https://dashboard.stripe.com/connect/settings
2. Copie **Client ID** → `STRIPE_CONNECT_CLIENT_ID`
3. Webhooks → `https://www.botelho.com/api/webhooks/stripe`
   - Eventos: `account.updated`, `person.updated`, `capability.updated`, `account.application.deauthorized`, `checkout.session.completed`, `payment_intent.succeeded`, `payout.paid`, `payout.failed`
4. Connect Onboarding → Configure para Brasil (CPF/CNPJ, conta bancária, Pix)

### 5. CONFIGURAR MERCADO PAGO
1. https://www.mercadopago.com.br/developers/panel/credentials
2. Webhooks → `https://www.botelho.com/api/webhooks/mercadopago`

### 6. CRIAR BUCKET S3 (AWS)
- Bucket: `marketplace-botelho-prod`
- Region: `us-east-1`
- CORS configurado para upload de imagens

### 7. EMAIL (GMAIL)
1. Google Account → Segurança → Senhas de app
2. Crie senha para "Marketplace"
3. Use em `EMAIL_SERVER_PASSWORD`

### 8. DEPLOY FINAL
```bash
cd C:\Users\User\marketplace
vercel --prod
```

### 9. VERIFICAR TUDO FUNCIONANDO
```bash
# Homepage
curl https://www.botelho.com

# Admin
curl https://www.botelho.com/admin

# Seller
curl https://www.botelho.com/seller

# API Health
curl https://www.botelho.com/api/health
```

---

## 🔑 VARIÁVEIS OBRIGATÓRIAS (resumo)

| Variável | Exemplo | Onde Pegar |
|----------|---------|------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe Dashboard → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe → Webhooks |
| `STRIPE_CONNECT_CLIENT_ID` | `ca_...` | Stripe Connect → Settings |
| `MERCADO_PAGO_ACCESS_TOKEN` | `APP_USR-...` | MP → Credenciais Produção |
| `MERCADO_PAGO_PUBLIC_KEY` | `APP_USR-...` | MP → Credenciais |
| `MERCADO_PAGO_WEBHOOK_SECRET` | `...` | MP → Webhooks |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | `...` | AWS IAM |
| `AWS_S3_BUCKET` | `marketplace-botelho-prod` | Seu bucket |
| `EMAIL_SERVER_PASSWORD` | `abcd efgh ijkl mnop` | Google → Senhas de app |
| `REDIS_URL` | `redis://...` | Auto após instalar Upstash |
| `JWT_SECRET` | `nszFBkykSq9hQ8UHIIgbEPOkkArN1SGDyE50/P36IIM=` | Já gerado |
| `NEXTAUTH_URL` | `https://www.botelho.com` | ✓ |
| `NEXT_PUBLIC_APP_URL` | `https://www.botelho.com` | ✓ |

---

## 📁 ARQUIVOS CRIADOS/ATUALIZADOS
```
marketplace/
├── setup-env.ps1      # Script PowerShell (Windows)
├── setup-env.sh       # Script Bash (Git Bash/WSL/Linux)
├── .env.local         # Variáveis DEV (com DATABASE_URL Neon)
├── .vercel/project.json # Link Vercel
├── prisma/schema.prisma # Schema multi-vendedor completo
└── GUIA-PRODUCAO.md   # Este arquivo
```

---

## 🎯 ESTRUTURA MULTI-VENDEDOR JÁ PRONTA
- **Admin**: `/admin` - Dashboard, usuários, produtos, pedidos, configurações
- **Seller**: `/seller` - Dashboard, produtos, configurações, perfil da loja
- **Comissão**: `SellerProfile.commissionRate` (padrão 10%)
- **Split Pagamento**: Wallet + Stripe Connect
- **Onboarding Vendedor**: `/vender` + Stripe Connect Onboarding

---

## ⚠️ IMPORTANTE
**Sem Stripe Connect**, os pagamentos caem TODOS na sua conta Stripe e você terá que repassar manualmente para os vendedores. **Configure o Connect antes de ir ao ar!**

---

## 🆘 PROBLEMAS COMUNS

| Erro | Solução |
|------|---------|
| "Database connection failed" | Verifique `DATABASE_URL` no Vercel Dashboard |
| "Redis connection failed" | Instale Upstash e aguarde propagar |
| "Stripe webhook failed" | Verifique URL e secret do webhook |
| "S3 upload failed" | Verifique CORS e credenciais AWS |
| "Email not sending" | Use senha de app Gmail, não senha normal |

---

## 📞 PRÓXIMOS PASSOS APÓS DEPLOY
1. Testar cadastro de vendedor em `/vender`
2. Testar onboarding Stripe Connect
3. Testar criação de produto como vendedor
4. Testar compra e split de pagamento
5. Configurar domínio personalizado (se não for botelho.com)
6. SSL/HTTPS já ativo via Vercel

---

**Execute o `setup-env.ps1` após preencher os valores e depois `vercel --prod`!**