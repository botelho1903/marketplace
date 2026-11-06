# Vercel Environment Variables Setup Script (Bash version for Git Bash / WSL)
# Execute: bash setup-env.sh

# ============================================
# PREENCHA OS VALORES ABAIXO (obrigatórios)
# ============================================

# Stripe Connect (produção) - ESSENCIAL PARA MULTI-VENDEDOR
STRIPE_SECRET_KEY="sk_live_XXXXXXXXXXXXXXXXXXXXXXXX"
STRIPE_PUBLISHABLE_KEY="pk_live_XXXXXXXXXXXXXXXXXXXXXXXX"
STRIPE_WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXXXXXXXXXX"
STRIPE_CONNECT_CLIENT_ID="ca_XXXXXXXXXXXXXXXXXXXXXXXX"

# Mercado Pago (produção Brasil)
MP_ACCESS_TOKEN="APP_USR-XXXXXXXXXXXXXXXXXXXXXXXX"
MP_PUBLIC_KEY="APP_USR-XXXXXXXXXXXXXXXXXXXXXXXX"
MP_WEBHOOK_SECRET="XXXXXXXXXXXXXXXXXXXXXXXX"

# AWS S3 (imagens dos produtos)
AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="marketplace-botelho-prod"

# Email (Gmail com senha de app)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="seu-email@gmail.com"
EMAIL_SERVER_PASSWORD="senha-de-app-do-google"
EMAIL_FROM="Marketplace <noreply@botelho.com>"

# Auth & Config
JWT_SECRET="nszFBkykSq9hQ8UHIIgbEPOkkArN1SGDyE50/P36IIM="
NEXTAUTH_URL="https://www.botelho.com"
NEXT_PUBLIC_APP_URL="https://www.botelho.com"
BCRYPT_ROUNDS="12"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# ============================================
# NÃO EDITE ABAIXO
# ============================================

echo "=== Adicionando Environment Variables no Vercel Production ==="

envs=(
    "STRIPE_SECRET_KEY:$STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY:$STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET:$STRIPE_WEBHOOK_SECRET"
    "STRIPE_CONNECT_CLIENT_ID:$STRIPE_CONNECT_CLIENT_ID"
    "MERCADO_PAGO_ACCESS_TOKEN:$MP_ACCESS_TOKEN"
    "MERCADO_PAGO_PUBLIC_KEY:$MP_PUBLIC_KEY"
    "MERCADO_PAGO_WEBHOOK_SECRET:$MP_WEBHOOK_SECRET"
    "AWS_ACCESS_KEY_ID:$AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY:$AWS_SECRET_ACCESS_KEY"
    "AWS_REGION:$AWS_REGION"
    "AWS_S3_BUCKET:$AWS_S3_BUCKET"
    "EMAIL_SERVER_HOST:$EMAIL_SERVER_HOST"
    "EMAIL_SERVER_PORT:$EMAIL_SERVER_PORT"
    "EMAIL_SERVER_USER:$EMAIL_SERVER_USER"
    "EMAIL_SERVER_PASSWORD:$EMAIL_SERVER_PASSWORD"
    "EMAIL_FROM:$EMAIL_FROM"
    "JWT_SECRET:$JWT_SECRET"
    "NEXTAUTH_URL:$NEXTAUTH_URL"
    "NEXT_PUBLIC_APP_URL:$NEXT_PUBLIC_APP_URL"
    "BCRYPT_ROUNDS:$BCRYPT_ROUNDS"
    "RATE_LIMIT_WINDOW_MS:$RATE_LIMIT_WINDOW_MS"
    "RATE_LIMIT_MAX_REQUESTS:$RATE_LIMIT_MAX_REQUESTS"
)

for env in "${envs[@]}"; do
    NAME="${env%%:*}"
    VALUE="${env#*:}"

    if [[ "$VALUE" == *"XXXX"* ]] || [[ "$VALUE" == *"seu-email"* ]] || [[ "$VALUE" == *"senha-de-app"* ]]; then
        echo "⚠️  PULANDO $NAME - valor não preenchido!"
        continue
    fi

    echo -n "Adicionando $NAME... "
    vercel env add "$NAME" production --value "$VALUE" --yes
done

echo ""
echo "=== Instalando Upstash Redis (gratuito) ==="
echo "1. Aceite os termos: https://vercel.com/ianbotelho4-8158/~/integrations/accept-terms/upstash?source=cli"
echo "2. Rode: vercel install upstash/upstash-kv"

echo ""
echo "=== Próximos Passos ==="
echo "1. Configure Stripe Connect: https://dashboard.stripe.com/connect/settings"
echo "2. Webhook Stripe: https://www.botelho.com/api/webhooks/stripe"
echo "3. Webhook Mercado Pago: https://www.botelho.com/api/webhooks/mercadopago"
echo "4. Crie bucket S3: marketplace-botelho-prod"
echo "5. Deploy final: vercel --prod"

echo ""
echo "=== Verificar Deploy ==="
echo "curl https://www.botelho.com"