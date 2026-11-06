# Vercel Environment Variables Setup Script
# Execute este script APÓS preencher os valores abaixo
# cd C:\Users\User\marketplace
# .\setup-env.ps1

# ============================================
# PREENCHA OS VALORES ABAIXO (obrigatórios)
# ============================================

# Stripe Connect (produção) - ESSENCIAL PARA MULTI-VENDEDOR
$STRIPE_SECRET_KEY = "sk_live_XXXXXXXXXXXXXXXXXXXXXXXX"
$STRIPE_PUBLISHABLE_KEY = "pk_live_XXXXXXXXXXXXXXXXXXXXXXXX"
$STRIPE_WEBHOOK_SECRET = "whsec_XXXXXXXXXXXXXXXXXXXXXXXX"
$STRIPE_CONNECT_CLIENT_ID = "ca_XXXXXXXXXXXXXXXXXXXXXXXX"

# Mercado Pago (produção Brasil)
$MP_ACCESS_TOKEN = "APP_USR-XXXXXXXXXXXXXXXXXXXXXXXX"
$MP_PUBLIC_KEY = "APP_USR-XXXXXXXXXXXXXXXXXXXXXXXX"
$MP_WEBHOOK_SECRET = "XXXXXXXXXXXXXXXXXXXXXXXX"

# AWS S3 (imagens dos produtos)
$AWS_ACCESS_KEY_ID = "AKIAXXXXXXXXXXXXXXXX"
$AWS_SECRET_ACCESS_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
$AWS_REGION = "us-east-1"
$AWS_S3_BUCKET = "marketplace-botelho-prod"

# Email (Gmail com senha de app)
$EMAIL_SERVER_HOST = "smtp.gmail.com"
$EMAIL_SERVER_PORT = "587"
$EMAIL_SERVER_USER = "seu-email@gmail.com"
$EMAIL_SERVER_PASSWORD = "senha-de-app-do-google"  # NÃO é senha do login!
$EMAIL_FROM = "Marketplace <noreply@botelho.com>"

# Auth & Config
$JWT_SECRET = "nszFBkykSq9hQ8UHIIgbEPOkkArN1SGDyE50/P36IIM="
$NEXTAUTH_URL = "https://www.botelho.com"
$NEXT_PUBLIC_APP_URL = "https://www.botelho.com"
$BCRYPT_ROUNDS = "12"
$RATE_LIMIT_WINDOW_MS = "900000"
$RATE_LIMIT_MAX_REQUESTS = "100"

# ============================================
# NÃO EDITE ABAIXO - COMANDOS AUTOMÁTICOS
# ============================================

Write-Host "=== Adicionando Environment Variables no Vercel Production ===" -ForegroundColor Green

$envs = @(
    @{Name="STRIPE_SECRET_KEY"; Value=$STRIPE_SECRET_KEY},
    @{Name="STRIPE_PUBLISHABLE_KEY"; Value=$STRIPE_PUBLISHABLE_KEY},
    @{Name="STRIPE_WEBHOOK_SECRET"; Value=$STRIPE_WEBHOOK_SECRET},
    @{Name="STRIPE_CONNECT_CLIENT_ID"; Value=$STRIPE_CONNECT_CLIENT_ID},
    @{Name="MERCADO_PAGO_ACCESS_TOKEN"; Value=$MP_ACCESS_TOKEN},
    @{Name="MERCADO_PAGO_PUBLIC_KEY"; Value=$MP_PUBLIC_KEY},
    @{Name="MERCADO_PAGO_WEBHOOK_SECRET"; Value=$MP_WEBHOOK_SECRET},
    @{Name="AWS_ACCESS_KEY_ID"; Value=$AWS_ACCESS_KEY_ID},
    @{Name="AWS_SECRET_ACCESS_KEY"; Value=$AWS_SECRET_ACCESS_KEY},
    @{Name="AWS_REGION"; Value=$AWS_REGION},
    @{Name="AWS_S3_BUCKET"; Value=$AWS_S3_BUCKET},
    @{Name="EMAIL_SERVER_HOST"; Value=$EMAIL_SERVER_HOST},
    @{Name="EMAIL_SERVER_PORT"; Value=$EMAIL_SERVER_PORT},
    @{Name="EMAIL_SERVER_USER"; Value=$EMAIL_SERVER_USER},
    @{Name="EMAIL_SERVER_PASSWORD"; Value=$EMAIL_SERVER_PASSWORD},
    @{Name="EMAIL_FROM"; Value=$EMAIL_FROM},
    @{Name="JWT_SECRET"; Value=$JWT_SECRET},
    @{Name="NEXTAUTH_URL"; Value=$NEXTAUTH_URL},
    @{Name="NEXT_PUBLIC_APP_URL"; Value=$NEXT_PUBLIC_APP_URL},
    @{Name="BCRYPT_ROUNDS"; Value=$BCRYPT_ROUNDS},
    @{Name="RATE_LIMIT_WINDOW_MS"; Value=$RATE_LIMIT_WINDOW_MS},
    @{Name="RATE_LIMIT_MAX_REQUESTS"; Value=$RATE_LIMIT_MAX_REQUESTS}
)

foreach ($env in $envs) {
    if ($env.Value -like "*XXXX*" -or $env.Value -like "*seu-email*" -or $env.Value -like "*senha-de-app*") {
        Write-Host "⚠️  PULANDO $($env.Name) - valor não preenchido!" -ForegroundColor Yellow
        continue
    }

    Write-Host "Adicionando $($env.Name)..." -NoNewline
    $result = vercel env add $env.Name production --value $env.Value --yes 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓" -ForegroundColor Green
    } else {
        Write-Host " ✗" -ForegroundColor Red
        Write-Host "  Erro: $result" -ForegroundColor Red
    }
}

Write-Host "`n=== Instalando Upstash Redis (gratuito) ===" -ForegroundColor Green
Write-Host "1. Aceite os termos: https://vercel.com/ianbotelho4-8158/~/integrations/accept-terms/upstash?source=cli" -ForegroundColor Cyan
Write-Host "2. Rode: vercel install upstash/upstash-kv" -ForegroundColor Cyan

Write-Host "`n=== Próximos Passos ===" -ForegroundColor Green
Write-Host "1. Configure Stripe Connect no Dashboard: https://dashboard.stripe.com/connect/settings" -ForegroundColor Cyan
Write-Host "2. Adicione webhooks Stripe: https://www.botelho.com/api/webhooks/stripe" -ForegroundColor Cyan
Write-Host "3. Adicione webhooks Mercado Pago: https://www.botelho.com/api/webhooks/mercadopago" -ForegroundColor Cyan
Write-Host "4. Crie bucket S3: marketplace-botelho-prod" -ForegroundColor Cyan
Write-Host "5. Rode: vercel --prod" -ForegroundColor Cyan

Write-Host "`n=== Verificar Deploy ===" -ForegroundColor Green
Write-Host "curl https://www.botelho.com" -ForegroundColor Cyan