# 🔐 GitHub Secrets Setup Guide

Configure these in: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

---

## 📋 **Required Secrets (All Environments)**

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `CAPACITOR_SERVER_URL` | `https://seu-app.vercel.app` | Sua URL do Vercel após deploy |
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Neon/Supabase/Railway/PlanetScale |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Gerar: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://seu-app.vercel.app` | Mesma URL do CAPACITOR_SERVER_URL |
| `JWT_SECRET` | `openssl rand -base64 32` | Gerar: `openssl rand -base64 32` (diferente do NEXTAUTH_SECRET) |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` | Gerar: `openssl rand -hex 32` (32 chars hex) |

---

## 💳 **Mercado Pago (Produção)**

| Secret Name | Value | Onde Pegar |
|-------------|-------|------------|
| `MERCADO_PAGO_ACCESS_TOKEN` | `APP_USR-xxxxxxxxxxxxx` | https://www.mercadopago.com.br/developers/panel → Sua aplicação → Credenciais de produção |
| `MERCADO_PAGO_PUBLIC_KEY` | `APP_USR-xxxxxxxxxxxxx` | Mesmo local acima |
| `MERCADO_PAGO_WEBHOOK_SECRET` | `xxxxxxxxxxxxxxxx` | Painel MP → Webhooks → Secret |

> **⚠️ IMPORTANTE:** Configure o webhook no MP para: `https://seu-app.vercel.app/api/webhooks/mercado-pago`

---

## 📧 **Email (SMTP)**

| Secret Name | Exemplo | Provedores |
|-------------|---------|------------|
| `EMAIL_SERVER_HOST` | `smtp.sendgrid.net` | SendGrid, Resend, Mailgun, Postmark |
| `EMAIL_SERVER_PORT` | `587` | Geralmente 587 (TLS) ou 465 (SSL) |
| `EMAIL_SERVER_USER` | `apikey` | SendGrid usa "apikey", outros usam username |
| `EMAIL_SERVER_PASSWORD` | `SG.xxxxx` | Sua API key / senha SMTP |
| `EMAIL_FROM` | `noreply@seudominio.com` | Email verificado no provedor |

---

## ☁️ **AWS S3 (Upload de arquivos)**

| Secret Name | Onde Pegar |
|-------------|------------|
| `AWS_ACCESS_KEY_ID` | AWS Console → IAM → Usuário → Chaves de acesso |
| `AWS_SECRET_ACCESS_KEY` | Mesmo local (salve na criação!) |
| `AWS_REGION` | `us-east-1` ou sua região |
| `AWS_S3_BUCKET` | Nome do bucket S3 criado |

> **Bucket Policy para uploads públicos:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicRead",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::seu-bucket/*"
  }]
}
```

> **CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://seu-app.vercel.app"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 🔴 **Redis (Rate Limiting)**

| Secret Name | Onde Pegar |
|-------------|------------|
| `REDIS_URL` | `rediss://user:pass@host:port` (Upstash, Redis Cloud, Railway) |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 minutos) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` (req por janela) |

---

## 🚀 **Vercel Deploy (Automático)**

| Secret Name | Onde Pegar |
|-------------|------------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens → Create |
| `VERCEL_ORG_ID` | `vercel inspect https://seu-app.vercel.app` → `orgId` |
| `VERCEL_PROJECT_ID` | Mesmo comando acima → `projectId` |

```bash
# Instalar Vercel CLI e pegar IDs:
npm i -g vercel
vercel login
vercel inspect https://seu-app.vercel.app
```

---

## 🔐 **Keystore para Release APK (Play Store)**

### **1. Gerar Keystore (Uma vez só):**
```bash
# No seu PC (PowerShell):
keytool -genkeypair \
  -alias marketplace \
  -keyalg RSA \
  -keysize 2048 \
  -validity 9125 \
  -keystore marketplace-release.jks \
  -storepass SUA_SENHA_FORTE \
  -keypass SUA_SENHA_FORTE \
  -dname "CN=Seu Nome, OU=Dev, O=Sua Empresa, L=Cidade, ST=Estado, C=BR"
```

### **2. Converter para Base64:**
```powershell
# PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("marketplace-release.jks")) | Set-Clipboard
```

### **3. Adicionar Secrets no GitHub:**
| Secret Name | Valor |
|-------------|-------|
| `KEYSTORE_BASE64` | (Cole o Base64 copiado acima) |
| `KEYSTORE_PASSWORD` | `SUA_SENHA_FORTE` |
| `KEY_ALIAS` | `marketplace` |
| `KEY_PASSWORD` | `SUA_SENHA_FORTE` |

> ⚠️ **GUARDE** o arquivo `marketplace-release.jks` e as senhas! **Sem eles não dá para atualizar o app na Play Store.**

---

## ✅ **Checklist Completo**

### **Obrigatórios (Build funciona):**
- [ ] `CAPACITOR_SERVER_URL`
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL`
- [ ] `JWT_SECRET`
- [ ] `ENCRYPTION_KEY`

### **Pagamentos:**
- [ ] `MERCADO_PAGO_ACCESS_TOKEN`
- [ ] `MERCADO_PAGO_PUBLIC_KEY`
- [ ] `MERCADO_PAGO_WEBHOOK_SECRET`

### **Email & Arquivos:**
- [ ] `EMAIL_SERVER_HOST`
- [ ] `EMAIL_SERVER_PORT`
- [ ] `EMAIL_SERVER_USER`
- [ ] `EMAIL_SERVER_PASSWORD`
- [ ] `EMAIL_FROM`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`
- [ ] `AWS_S3_BUCKET`

### **Rate Limiting:**
- [ ] `REDIS_URL`
- [ ] `RATE_LIMIT_WINDOW_MS`
- [ ] `RATE_LIMIT_MAX_REQUESTS`

### **Deploy Automático:**
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

### **APK Release (Play Store):**
- [ ] `KEYSTORE_BASE64`
- [ ] `KEYSTORE_PASSWORD`
- [ ] `KEY_ALIAS`
- [ ] `KEY_PASSWORD`

---

## 🎯 **Como Testar Localmente Antes de Commitar**

```bash
# 1. Criar .env.local com todos os valores:
cp .env.example .env.local
# Edite .env.local com seus valores reais

# 2. Testar build local:
npm run build

# 3. Testar APK local (se tem Android Studio):
npx cap sync android
npx cap open android
```

---

## 🔄 **Fluxo Automático Completo**

```
Push to main
    │
    ├─► PR Checks (TypeScript, ESLint, Prettier, Build)
    │       │
    │       └─► Se passa → Deploy Vercel (Produção)
    │
    ├─► Build APK (Debug) → Artifact Download
    │
    └─► Tag v1.0.0 → Build APK (Release Signed) → GitHub Release + Play Store
```

---

## 🆘 **Troubleshooting**

| Problema | Solução |
|----------|---------|
| `VERCEL_TOKEN` inválido | Gere novo em vercel.com/account/tokens |
| `DATABASE_URL` erro SSL | Adicione `?sslmode=require` no final |
| `KEYSTORE_BASE64` erro | Refaça a conversão: `base64 -d` deve gerar `.jks` válido |
| Webhook MP falha | Verifique se URL no painel MP bate com `NEXTAUTH_URL/api/webhooks/mercado-pago` |
| Build APK falha memória | Adicione `GRADLE_OPTS: "-Xmx4g"` (já está no workflow) |

---

**Após configurar tudo, faça um push para `main` e veja a mágica acontecer em Actions! 🚀**