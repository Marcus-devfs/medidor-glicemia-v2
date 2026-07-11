# Implementações dos Cards Trello

Documentação de cada feature implementada a partir de `features.md`.

---

## 1. Feature — Exportação de PDF do Histórico

**Status:** ✅ Implementado

### O que foi feito
- Substituída a exportação Excel (`.xlsx`) por PDF na aba **Histórico**.
- PDF gerado com cabeçalho rosa (marca GestaGlic), nome da paciente e ID da gestação (últimos 8 caracteres do `_id` do usuário).
- Tabela pivotada por **data** (linhas) e **período** (colunas: Jejum, Pós-Café, Pós-Almoço, Pós-Jantar) para leitura rápida pela médica.
- Rodapé com metas gestacionais de referência.

### Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/pdf.ts` | Geração do PDF com jsPDF + jspdf-autotable |
| `src/app/historico/page.tsx` | Botão de download aciona `exportPdf()` |

### Dependências adicionadas
- `jspdf`
- `jspdf-autotable`

---

## 2. Dev/UX — Banner de Instalação (PWA Prompt)

**Status:** ✅ Implementado

### O que foi feito
- Hook `usePwaInstall` captura o evento `beforeinstallprompt` e guarda o prompt deferido.
- Banner fixo no topo: *"Instalar o GestaGlic no seu celular (Grátis)"* com botão **Instalar** e opção de fechar (persiste dismiss em `localStorage`).
- PWA já configurado via `@ducanh2912/next-pwa` + `manifest.webmanifest` + service worker customizado em `worker/index.js`.
- Banner não aparece se o app já estiver instalado (`display-mode: standalone`) ou na tela de login.

### Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `src/components/pwa/usePwaInstall.ts` | Hook com lógica de instalação |
| `src/components/pwa/InstallBanner.tsx` | UI do banner |
| `src/components/pwa/PwaInstallProvider.tsx` | Provider global |
| `src/components/layout/AppShell.tsx` | Monta o provider |

---

## 3. UI/UX — Modal de Instrução Visual (iOS vs Android)

**Status:** ✅ Implementado

### O que foi feito
- Modal exibido automaticamente para usuárias de **iPhone/iPad** (Safari) após 2 segundos, pois o iOS não suporta `beforeinstallprompt`.
- Passo a passo visual com ícones do Safari: **Compartilhar** → **Adicionar à Tela de Início** → **Adicionar**.
- Dismiss persistido em `localStorage` (`gestaglic_ios_install_dismissed`).
- Não aparece se o app já estiver instalado como PWA.

### Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `src/components/pwa/IosInstallModal.tsx` | Modal com instruções visuais |
| `src/components/pwa/usePwaInstall.ts` | Detecção iOS + controle de exibição |

---

## 4. Regra de Negócio — Contador de Downloads de PDF

**Status:** ✅ Implementado

### O que foi feito
- Novos campos no modelo `User` (MongoDB):
  - `pdf_downloads_count` — `Number`, default `0`
  - `is_premium` — `Boolean`, default `false`
- Endpoint `POST /user/pdf-download/:id` (autenticado):
  - Se `is_premium === true` → permite download sem incrementar.
  - Se `pdf_downloads_count >= 2` → retorna `403` com `limit_reached: true`.
  - Caso contrário → incrementa contador e retorna sucesso.
- Frontend atualiza o usuário no contexto após download bem-sucedido.

### Arquivos (API)
| Arquivo | Descrição |
|---------|-----------|
| `api-glicemia/src/models/User.js` | Campos novos no schema |
| `api-glicemia/src/controllers/UserController.js` | Método `registerPdfDownload` |
| `api-glicemia/src/routes/index.js` | Rota `POST /user/pdf-download/:id` |

### Arquivos (App)
| Arquivo | Descrição |
|---------|-----------|
| `src/types/index.ts` | Tipos `pdf_downloads_count` e `is_premium` no `User` |
| `src/app/historico/page.tsx` | Chama API antes de gerar PDF |

---

## 5. UI/UX — Tela de Limite Atingido (Gatilho dos R$ 9,90)

**Status:** ✅ Implementado

### O que foi feito
- Modal carinhoso exibido quando a usuária tenta baixar o 3º PDF (contador ≥ 2 e `is_premium === false`).
- Texto conforme card do Trello, com chave Pix e instrução para enviar comprovante.
- PDF **não é gerado** quando o limite é atingido.

### Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `src/components/premium/PdfLimitModal.tsx` | Modal de paywall |
| `src/app/historico/page.tsx` | Abre modal em resposta ao `403 limit_reached` |

---

## Fluxo completo do download de PDF

```
Usuária clica em Download (Histórico)
        │
        ▼
POST /user/pdf-download/:id
        │
        ├─ is_premium? ──► Gera PDF (sem incrementar)
        │
        ├─ count >= 2? ──► Abre PdfLimitModal (sem PDF)
        │
        └─ count < 2 ──► Incrementa contador → Gera PDF → Toast sucesso
```

## Próximos passos sugeridos (não implementados)

- [ ] Endpoint admin para marcar usuária como `is_premium: true` após Pix
- [ ] Integração automática com gateway de pagamento (Mercado Pago / Stripe Pix)
- [ ] Remover dependências `xlsx` e `file-saver` (não mais usadas)
- [ ] Botão manual "Como instalar" no Perfil para reabrir modal iOS
