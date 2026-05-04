# Site de Pedido de Namoro ❤️

Site romântico para pedido de namoro com sistema completo de gerenciamento de datas especiais e fotos.

## 🚀 Funcionalidades

- ✅ Pedido de namoro interativo
- ✅ Banner de aceitação animado
- ✅ Contador de tempo de namoro em tempo real
- ✅ Sistema de datas especiais com fotos
- ✅ Painel administrativo oculto
- ✅ Fallback para localStorage (funciona mesmo sem Firebase)
- ✅ Design responsivo e animações românticas

## 🔧 Configuração do Firebase

Se o site não está funcionando no GitHub Pages, verifique:

### 1. Regras de Segurança do Firestore

No Console do Firebase > Firestore Database > Regras, configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita pública (apenas para desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 2. Configuração do Projeto

Verifique se o arquivo `firebase.js` tem as credenciais corretas:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.firebasestorage.app",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 3. Publicação no GitHub Pages

1. Faça upload dos arquivos para um repositório GitHub
2. Vá em Settings > Pages
3. Selecione a branch `main` e pasta `/root`
4. O site estará disponível em `https://SEU_USERNAME.github.io/NOME_DO_REPO`

## 📱 Como Usar

### Para a Pessoa que Recebe o Pedido:
1. Acesse o site
2. Veja as fotos e a mensagem romântica
3. Clique em "Sim ❤️" para aceitar
4. Aproveite a celebração com confetes!

### Para o Administrador:
1. Clique no ícone ⚙️ no canto inferior direito
2. Use a senha: `admin123` (se configurada)
3. Adicione datas especiais e fotos
4. Gerencie o conteúdo do site

## 🔄 Sistema de Backup

O site tem um sistema inteligente de backup:
- **Primário**: Firebase Firestore (nuvem)
- **Fallback**: localStorage (navegador)

Se o Firebase não estiver disponível, o site continua funcionando normalmente com armazenamento local.

## 🐛 Solução de Problemas

### Site não carrega no GitHub Pages:
1. Verifique as regras do Firebase (veja acima)
2. Confirme se o projeto Firebase está ativo
3. Verifique o console do navegador para erros

### Dados não salvam:
1. O site usará localStorage automaticamente
2. Os dados ficam salvos no navegador
3. Funciona normalmente mesmo sem Firebase

### Fotos não aparecem:
1. Verifique o tamanho das imagens (máx 5MB)
2. Use formatos JPG, PNG ou WebP
3. Limpe o cache do navegador

## 📁 Estrutura de Arquivos

```
site_edido-main/
├── index.html          # Página principal
├── style.css           # Estilos e animações
├── script.js           # Lógica da aplicação
├── firebase.js         # Configuração do Firebase
└── README.md          # Este arquivo
```

## ❤️ Mensagem Especial

Este site foi criado com muito carinho para tornar seu pedido de namoro ainda mais especial. 
Cada detalhe foi pensado para criar um momento único e inesquecível!

---

**Desenvolvido com ❤️ para momentos especiais**
