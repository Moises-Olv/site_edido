# 🔧 Como Corrigir o Firebase para GitHub Pages

Se o site funcionava antes com Firebase e agora não funciona, siga estes passos:

## 🚨 Verificar no Console Firebase

### 1. Acesse o Console Firebase
- Vá para: https://console.firebase.google.com/
- Faça login com sua conta
- Selecione o projeto: `sitepedido-79bb0`

### 2. Verifique se o Projeto está Ativo
- No menu lateral, clique em "Visão geral"
- Verifique se o projeto está "Publicado" e não "Suspenso"
- Se estiver suspenso, clique em "Gerenciar" > "Ressuscitar projeto"

### 3. Configure as Regras do Firestore ⚠️ **IMPORTANTE**
- No menu lateral, vá em "Firestore Database"
- Clique na aba "Regras"
- **APAGUE** as regras atuais e cole estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita pública (para GitHub Pages)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

- Clique em "Publicar"

### 4. Verifique o Firestore Database
- Certifique-se que Firestore Database está "Criado" e não "Em modo de teste"
- Se necessário, crie o banco de dados:
  - Clique em "Criar banco de dados"
  - Escolha "Iniciar em modo de teste" (depois vamos mudar as regras)
  - Escolha um local (ex: `us-central1`)
  - Clique em "Habilitar"

### 5. Verifique a Cobrança
- Vá em "Configurações do projeto" > "Uso e cobrança"
- Verifique se o plano está "Blaze" (pago) ou "Spark" (gratuito)
- Se estiver "Spark", pode ser necessário atualizar para "Blaze" para usar Firestore em produção

## 🌐 Configurar GitHub Pages

### 1. Adicionar Domínio Autorizado
- No Console Firebase, vá em "Authentication"
- Clique na aba "Configuração"
- Em "Domínios autorizados", adicione:
  - `SEU_USERNAME.github.io`
  - `SEU_USERNAME.github.io/NOME_DO_REPO`

### 2. Verificar se o Site está Online
- Faça deploy do site no GitHub Pages
- Abra o site: `https://SEU_USERNAME.github.io/NOME_DO_REPO`
- Abra o console do navegador (F12)
- Procure por mensagens de erro

## 🔍 Testes de Diagnóstico

O site agora mostrará exatamente qual é o problema:

### ✅ Se funcionar:
```
🔍 Iniciando diagnóstico do Firebase...
📍 Testando conexão com Firebase...
📍 Projeto ID: sitepedido-79bb0
📍 Documento: amorVaultX92/linhaTempoAnna2026
✅ Dados carregados do Firebase com sucesso!
```

### ❌ Se der erro de permissão:
```
🚫 PROBLEMA: Regras de segurança do Firestore negando acesso
🔧 SOLUÇÃO: Alterar regras no Console Firebase > Firestore > Regras
```

### ❌ Se der erro de projeto:
```
🚫 PROBLEMA: Projeto Firebase desativado ou quota excedida
🔧 SOLUÇÃO: Verificar se o projeto está ativo no Console Firebase
```

## 🚀 Solução Rápida (se nada funcionar)

Se o Firebase continuar com problemas, use a versão localStorage:

1. Renomeie `script-simple.js` para `script.js`
2. Remova `type="module"` do HTML
3. O site funcionará 100% sem Firebase

## 📞 Ajuda Adicional

Se precisar de ajuda:
1. Abra o site e aperte F12
2. Tire print do console com os erros
3. Me envie o print para identificar o problema exato

---

**Lembre-se**: Se funcionava antes, o problema é apenas configuração! 🎯
