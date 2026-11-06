# Marketplace Botelho - Deploy HTTP Direto

Pasta pronta para deploy como site convencional **sem HTTPS/SSL**.

## 🚀 Início Rápido

### Windows (Clique 2x):
```
start.bat
```

### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

### Docker (Recomendado produção):
```bash
docker-compose up -d
```

---

## 🔗 Links Diretos (após iniciar)

| Ambiente | URL |
|----------|-----|
| **Local** | http://localhost:3000 |
| **Rede (Celular/Outro PC)** | `http://SEU-IP:3000` |
| **Descobrir IP** | `ipconfig` (Windows) / `ifconfig` (Linux/Mac) |

---

## ⚙️ Configuração Obrigatória

1. **Renomeie** `.env.production` → `.env`
2. **Edite** `.env` com seus valores:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NEXTAUTH_URL=http://SEU-IP:3000
   NEXT_PUBLIC_APP_URL=http://SEU-IP:3000
   NEXTAUTH_SECRET=gere-com-openssl-rand-base64-32
   ```

---

## 📱 Acesso Mobile/Internet

### Mesma Wi-Fi:
1. Descubra IP do servidor: `ipconfig` → IPv4
2. No celular: `http://192.168.X.X:3000`

### Internet (Gratuito):
```bash
# Cloudflare Tunnel (sem porta aberta)
cloudflared tunnel --url http://localhost:3000

# Ngrok
ngrok http 3000
```

---

## 📁 Estrutura da Pasta

```
botelho/
├── server.js              # Servidor Next.js standalone
├── package.json           # Dependências produção
├── .next/
│   ├── static/           # Assets estáticos
│   └── server/           # Server components
├── public/               # Arquivos públicos
├── prisma/               # Schema do banco
├── node_modules/         # Dependências
├── start.bat             # Inicialização Windows
├── start.sh              # Inicialização Linux/Mac
├── docker-compose.yml    # Stack completa (App + DB + Redis)
├── Dockerfile            # Container otimizado
├── .env.production       # Template configuração
└── DEPLOY-HTTP.md        # Guia completo
```

---

## ✅ Checklist Deploy

- [ ] `.env` configurado com valores reais
- [ ] PostgreSQL acessível (local ou remoto)
- [ ] `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` são **HTTP**
- [ ] Porta 3000 liberada no firewall
- [ ] Rode `start.bat` / `start.sh` / `docker-compose up -d`
- [ ] Acesse `http://localhost:3000` → funciona
- [ ] Acesse do celular na mesma Wi-Fi → funciona

---

## 🆘 Problemas Comuns

| Erro | Solução |
|------|---------|
| "Database connection failed" | Verifique `DATABASE_URL` e se PostgreSQL roda |
| "NextAuth error" | `NEXTAUTH_URL` deve ser HTTP exato (sem / final) |
| Porta 3000 ocupada | `taskkill /F /IM node.exe` ou mude PORT no `.env` |
| Imagens não carregam | `DISABLE_IMAGE_OPTIMIZATION=true` no `.env` |

---

**Pronto!** Compartilhe o link `http://SEU-IP:3000` e qualquer pessoa acessa do celular, tablet ou desktop 🎉