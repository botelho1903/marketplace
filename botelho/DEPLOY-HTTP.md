# Marketplace - HTTP Deployment Guide

Este guia explica como fazer o deploy do Marketplace como um site convencional acessível via HTTP direto, sem necessidade de HTTPS/SSL.

## 🎯 Objetivo

- Acesso direto via link (ex: `http://seu-ip:3000` ou `http://seudominio.com`)
- Funciona em qualquer dispositivo (celular, tablet, desktop)
- Sem configuração de SSL/HTTPS
- Preserva todo design, funcionalidades, banco de dados e conteúdo

---

## 📋 Pré-requisitos

- **Node.js 20+**
- **PostgreSQL 14+** (local ou remoto)
- **Redis 7+** (opcional, para cache/sessões)
- **Docker & Docker Compose** (opcional, recomendado para produção)

---

## 🚀 Opção 1: Docker Compose (Recomendado)

Mais simples e isola tudo em containers.

### 1. Configure as variáveis de ambiente

```bash
cp .env.production .env
# Edite .env com seus valores reais
```

### 2. Suba tudo com um comando

```bash
docker-compose up -d
```

Isso cria:
- `marketplace-db` - PostgreSQL na porta 5432
- `marketplace-redis` - Redis na porta 6379
- `marketplace-app` - App Next.js na porta 3000

### 3. Acesse

```
http://localhost:3000
```

### 4. Para produção (com domínio)

Edite `docker-compose.yml`:
```yaml
environment:
  - NEXTAUTH_URL=http://seudominio.com
  - NEXT_PUBLIC_APP_URL=http://seudominio.com
```

---

## 🚀 Opção 2: Script Simples (Windows/Linux/Mac)

Para rodar direto no servidor sem Docker.

### Linux/Mac:

```bash
chmod +x start.sh
./start.sh
```

### Windows:

```cmd
start.bat
```

O script:
1. Carrega variáveis de `.env.production`
2. Converte URLs HTTPS → HTTP automaticamente
3. Roda migrações do banco
4. Builda a aplicação
5. Inicia na porta 3000 (HTTP)

---

## 🚀 Opção 3: Manual (Passo a passo)

```bash
# 1. Instale dependências
npm ci

# 2. Configure variáveis (copie .env.production para .env)
cp .env.production .env
# Edite .env com seus valores

# 3. Gere Prisma Client
npx prisma generate

# 4. Rode migrações
npx prisma migrate deploy

# 5. Build para produção (standalone)
npm run build

# 6. Inicie servidor HTTP
npm run start
```

---

## 🔧 Configurações Importantes

### Next.js Standalone Output
O `next.config.js` está configurado com `output: 'standalone'` que:
- Cria servidor mínimo em `.next/standalone/`
- Copia apenas arquivos necessários
- Funciona em qualquer servidor Node.js

### NextAuth com HTTP
Configure no `.env`:
```env
NEXTAUTH_URL=http://seu-ip:3000
NEXT_PUBLIC_APP_URL=http://seu-ip:3000
```

**Não use HTTPS** - o NextAuth v5 funciona perfeitamente em HTTP para desenvolvimento/produção simples.

### Imagens
Para HTTP simples, a otimização de imagens é desabilitada via:
```env
DISABLE_IMAGE_OPTIMIZATION=true
```
Isso evita erros de imagem em deployments sem domínio configurado.

---

## 📱 Acesso Mobile/Cellular

### Na mesma rede (Wi-Fi):
1. Descubra o IP do servidor: `ipconfig` (Windows) ou `ifconfig` (Linux/Mac)
2. Acesse no celular: `http://IP-DO-SERVIDOR:3000`

### Internet (expor para fora):
Opções:
1. **Cloudflare Tunnel** (grátis, sem porta aberta):
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
   Gera URL tipo `https://abc123.trycloudflare.com`

2. **Ngrok** (grátis para testes):
   ```bash
   ngrok http 3000
   ```

3. **VPS + Domínio**: Configure DNS A record → IP do servidor

---

## 🗄️ Banco de Dados

### PostgreSQL Local (Docker)
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=marketplace \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### PostgreSQL Remoto (Supabase, Neon, Railway, etc.)
Apenas altere `DATABASE_URL` no `.env`:
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
```

---

## 🔐 Segurança (Produção)

Para produção real, considere:

1. **Gere secrets fortes**:
   ```bash
   # NEXTAUTH_SECRET (32+ chars)
   openssl rand -base64 32
   
   # JWT_SECRET
   openssl rand -base64 32
   
   # ENCRYPTION_KEY (exatamente 32 chars)
   openssl rand -hex 16
   ```

2. **Firewall**: Bloqueie portas 5432, 6379 (só localhost)

3. **Reverse Proxy** (Nginx/Traefik) para:
   - Compressão gzip
   - Rate limiting
   - Logs centralizados
   - **SSL/HTTPS** (quando quiser)

4. **Variáveis sensíveis**: Nunca commite `.env` no git

---

## 📦 Estrutura de Deploy Standalone

Após `npm run build`, a pasta `.next/standalone/` contém:

```
.next/standalone/
├── server.js          # Servidor Node.js mínimo
├── package.json       # Dependências de produção
├── .next/
│   ├── static/        # Assets estáticos
│   └── server/        # Server components
├── public/            # Arquivos públicos
├── prisma/            # Schema do banco
└── node_modules/      # Dependências (copie do builder)
```

Copie esta pasta para qualquer servidor com Node.js 20+ e rode:
```bash
node server.js
```

---

## ✅ Checklist de Deploy

- [ ] `.env.production` configurado com valores reais
- [ ] `DATABASE_URL` aponta para PostgreSQL acessível
- [ ] `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` são **HTTP**
- [ ] `NEXTAUTH_SECRET` gerado com 32+ caracteres
- [ ] Build passou sem erros: `npm run build`
- [ ] Migrações rodaram: `npx prisma migrate deploy`
- [ ] Servidor inicia: `npm run start`
- [ ] Acessível em `http://localhost:3000`
- [ ] Acessível do celular na mesma rede
- [ ] Login/cadastro funcionando
- [ ] Carrinho, checkout, pedidos funcionando

---

## 🆘 Troubleshooting

### "Database connection failed"
- Verifique se PostgreSQL está rodando
- Confira `DATABASE_URL` no `.env`
- Teste: `npx prisma db push`

### "NextAuth error: Invalid URL"
- `NEXTAUTH_URL` deve ser HTTP exato (sem barra final)
- Ex: `http://localhost:3000` ✓ | `http://localhost:3000/` ✗

### "Images not loading"
- Configure `DISABLE_IMAGE_OPTIMIZATION=true`
- Ou configure domínio em `next.config.js` → `images.remotePatterns`

### "Port 3000 already in use"
- Mude porta: `PORT=3001 npm run start`
- Ou pare processo: `lsof -ti:3000 | xargs kill -9`

### "Prisma Client not found"
- Rode `npx prisma generate` após instalar deps

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique logs: `docker-compose logs -f app` ou console do `npm run start`
2. Confira se todas as variáveis estão no `.env`
3. Teste conexão DB: `npx prisma db pull`

---

**Pronto!** Seu Marketplace agora roda como site convencional HTTP, acessível por link direto em qualquer dispositivo 🎉