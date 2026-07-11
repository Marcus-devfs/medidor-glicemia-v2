# Implementações dos Cards Trello

Documentação de cada feature implementada a partir de `features.md`.

---

## 1. Feature — Exportação de PDF do Relatório

**Status:** ✅ Implementado (atualizado)

### O que foi feito
- Exportação PDF movida para a aba **Relatório** (`/relatorio`) — local correto para levar à médica.
- Layout profissional com **logo GestaGlic**, cabeçalho rosa, dados da paciente e ID da gestação.
- Cards de resumo: média jejum, média pós-refeição, % dentro da meta, total de medições.
- Tabela pivotada por **data × período** com valores coloridos (verde/amarelo/vermelho).
- Seção "Resumo por Período" com médias e status.
- Rodapé com metas gestacionais e crédito GestaGlic.
- Botão removido do Histórico (foco em busca/edição).

### Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/pdf.ts` | `generateReportPdf()` — layout profissional |
| `src/hooks/usePdfExport.ts` | Hook reutilizável (API + limite + toast) |
| `src/app/relatorio/page.tsx` | Card CTA + botão "Baixar relatório PDF" |

---

## 2. Dev/UX — Banner de Instalação (PWA Prompt)

**Status:** ✅ Movido para LP

- Removido do app (`app.gestaglic.com.br`) — o app é ferramenta logada, não marketing.
- Banner + modal de instalação agora ficam na **landing page** (`gestaglic.com.br`).
- LP orienta instalar o app em `app.gestaglic.com.br` (Android Chrome + iOS Safari).

### Arquivos (LP)
| Arquivo | Descrição |
|---------|-----------|
| `lp-gestaglic/src/components/InstallPromptBanner.tsx` | Banner mobile no topo |
| `lp-gestaglic/src/components/InstallModal.tsx` | Modal iOS + Android |

---

## 3. UI/UX — Modal de Instrução Visual (iOS vs Android)

**Status:** ✅ Na LP

- Modal unificado com passos visuais para **iPhone (Safari)** e **Android (Chrome)**.
- Detecta plataforma automaticamente; em desktop mostra ambos.
- Link direto para `app.gestaglic.com.br/login`.

---

## 4. Regra de Negócio — Contador de Downloads de PDF

**Status:** ✅ Implementado (sem alteração)

- Campos `pdf_downloads_count` e `is_premium` no User.
- Endpoint `POST /user/pdf-download/:id`.

---

## 5. UI/UX — Tela de Limite Atingido (R$ 9,90)

**Status:** ✅ Implementado (sem alteração)

- Modal na tela de Relatório ao tentar o 3º download.

---

## Arquitetura de domínios

| Domínio | Projeto | Função |
|---------|---------|--------|
| **gestaglic.com.br** | `lp-gestaglic` | Landing page, marketing, instalar app |
| **app.gestaglic.com.br** | `app_v2` | App logado (medições, relatório, PDF) |
| API | `api-glicemia` | Backend |

---

## Setup da LP

```bash
cd lp-gestaglic
cp -r ../app_v2/public/icons public/
npm install
npm run dev   # localhost:3002
```

Deploy separado: gestaglic.com.br → LP, app.gestaglic.com.br → app_v2.

---

## 6. Recuperação de senha (Esqueci minha senha)

**Status:** ✅ Implementado

### E-mail: Resend (não SendGrid)

- Provedor: [Resend](https://resend.com) — 3.000 e-mails/mês grátis
- Configuração: `api-glicemia/docs/email-resend-setup.md`

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/user/forgot-password` | Envia link por e-mail |
| POST | `/user/reset-password` | Define nova senha |

### Páginas app

- `/recuperar-senha` — solicitar link
- `/redefinir-senha?token=...` — nova senha (link expira em 1h)

### Variáveis de ambiente

```env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@gestaglic.com.br
APP_URL=https://app.gestaglic.com.br
```
