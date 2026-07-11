# Implementação — Painel Admin (11/07)

**Status:** ✅ Implementado

## Projeto: `admin-gestaglic`

Domínio: **admin.gestaglic.com.br**

### Telas

| Rota | Conteúdo |
|------|----------|
| `/login` | Login admin (mesma API, e-mail autorizado) |
| `/` | Dashboard com métricas |
| `/usuarios` | Lista de usuárias |
| `/usuarios/[id]` | **Detalhe:** medições, pagamentos, logs, ativar premium |
| `/assinaturas` | Pix gerados vs pagos |
| `/notificacoes` | Push e lembretes ativos |

### API — novos endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/me` | Valida acesso admin |
| GET | `/admin/dashboard` | Métricas consolidadas |
| GET | `/admin/users` | Lista usuárias |
| GET | `/admin/users/:id` | Detalhe completo da usuária |
| PATCH | `/admin/users/:id/premium` | Ativar/desativar premium |
| GET | `/admin/payments` | Lista Pix |

### Modelos

- `User.is_admin` — flag de administrador
- `PixPayment` — rastreio Pix (generated quando atinge limite PDF, paid ao marcar premium)
- `AccessLog` — logs de login, sessão, download PDF e cadastro

### Autenticação admin

- `ADMIN_EMAILS` no `.env` da API (lista separada por vírgula)
- OU `is_admin: true` no MongoDB

### Deploy

1. API com `ADMIN_EMAILS` e redeploy
2. Admin panel na Vercel → `admin.gestaglic.com.br`
3. CNAME no Registro.br apontando para Vercel
