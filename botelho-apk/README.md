# 📱 Botelho Marketplace - Pasta de Instalação

## 📁 Conteúdo da Pasta

```
botelho-apk/
├── index.html              # Página de instalação (hospede no GitHub Pages/Netlify/Vercel)
├── build-apk.ps1           # Script Windows para build APK
├── build-apk.sh            # Script Linux/Mac para build APK
├── README.md               # Documentação completa
└── qr-codes/               # QR codes gerados (opcional)
```

---

## 🚀 Como Usar

### **1. Página de Instalação (index.html)**
Hospede este arquivo para ter uma página profissional de instalação:

**Opções gratuitas:**
- **GitHub Pages:** Settings → Pages → Deploy from branch → main → /botelho-apk
- **Netlify:** Arraste a pasta `botelho-apk` para netlify.com/drop
- **Vercel:** `vercel --prod botelho-apk`
- **Firebase Hosting:** `firebase deploy --only hosting`

**Após hospedar, edite o `index.html` e substitua:**
- `SEU-APP.vercel.app` → sua URL real do Vercel
- `SEU-USUARIO` → seu usuário GitHub
- `SEU_USUARIO` → seu usuário GitHub

---

### **2. Build do APK (build-apk.ps1 / build-apk.sh)**
```powershell
# Windows:
.\build-apk.ps1

# Linux/Mac:
chmod +x build-apk.sh
./build-apk.sh
```

**Pré-requisitos:**
- Android Studio instalado
- JDK 17+
- Node.js 18+

---

### **3. QR Codes**
A página `index.html` gera QR codes automaticamente via API. Para QR codes offline:

```bash
# Gere QR codes locais:
npm i -g qrcode-terminal
qrcode-terminal "https://seu-app.vercel.app"
```

Ou use: https://www.qr-code-generator.com/

---

## 📋 Checklist de Entrega

- [ ] `index.html` hospedado (GitHub Pages/Netlify/Vercel)
- [ ] URLs atualizadas no `index.html`
- [ ] APK buildado e enviado para GitHub Releases
- [ ] QR codes testados no celular
- [ ] Link compartilhado com usuários

---

## 🔗 Links de Exemplo (Substitua pelos Seus)

| Tipo | Link |
|------|------|
| **PWA (Recomendado)** | `https://seu-app.vercel.app` |
| **APK Release** | `https://github.com/seu-usuario/marketplace/releases/latest` |
| **GitHub Pages** | `https://seu-usuario.github.io/marketplace/botelho-apk/` |
| **Netlify** | `https://marketplace-botelho.netlify.app` |

---

## 📱 Instruções para Usuários Finais

### **Android (PWA - Mais Fácil)**
1. Abra o link no Chrome
2. Menu (⋮) → "Adicionar à tela inicial" / "Instalar app"
3. Pronto! Funciona como app nativo

### **Android (APK)**
1. Baixe o APK do GitHub Releases
2. Abra o arquivo → Instalar
3. Se bloquear: Configurações → Segurança → "Fontes desconhecidas" → Permita

### **iOS (PWA)**
1. Abra no Safari
2. Compartilhar (□↑) → "Adicionar à Tela de Início"
3. Funciona como app nativo

---

**Pronto para distribuir!** 🚀