
## Feature — Blog/Dicas + Comunidade (11/07)

**Status:** ✅ Implementado

### Blog / Dicas (disfarçado na LP)

| Onde | O quê |
|------|--------|
| LP `gestaglic.com.br/dicas` | Lista e detalhe de artigos (SEO, conteúdo “natural”) |
| LP home | Seção “Dicas para o dia a dia” (3 artigos) |
| App home | Pílulas horizontais → abrem LP em nova aba |
| Admin `/conteudo` | CRUD: criar, editar, publicar/despublicar |

**API pública:** `GET /articles`, `GET /articles/:slug`  
**API admin:** `GET/POST/PATCH/DELETE /admin/articles`

**Seed inicial (3 artigos):**
```bash
cd api-glicemia && node scripts/seed-articles.js
```

**Env:**
- LP: `NEXT_PUBLIC_API_URL`
- App: `NEXT_PUBLIC_LP_URL=https://gestaglic.com.br`
- Admin: `NEXT_PUBLIC_LP_URL` (preview de links)

### Fórum / Comunidade

| Onde | O quê |
|------|--------|
| App `/comunidade` | Lista por categoria, criar post, comentários, apoiar, denunciar |
| Admin `/comunidade` | Ver posts, ocultar/reexibir, excluir, fila de denúncias |

**API (logada):** `/forum/posts`, comentários, support, report  
**API admin:** `/admin/forum/posts`, `/admin/forum/reports`

**Categorias:** Alimentação, Ansiedade, Sintomas, Vitórias

**Segurança:** aviso médico na listagem + checkbox ao criar post + botão denunciar
