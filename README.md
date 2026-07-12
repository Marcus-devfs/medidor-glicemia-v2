# GestaGlic — App v2

Frontend mobile-first para controle de glicemia em gestantes com diabetes gestacional.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PWA** — instalável no celular com `@ducanh2912/next-pwa`
- **Recharts** — gráficos de evolução
- **API existente** — `api-glicemia` (sem alterações)

## Como rodar

### 1. API (porta 3000)

```bash
cd ../api-glicemia
npm run dev
```

### 2. App v2 (porta 3001)

```bash
cd app_v2
npm install
npm run dev
```

Acesse: http://localhost:3001

### Variáveis de ambiente

Crie `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Para produção, aponte para a URL da API deployada.

## Funcionalidades

- Login e cadastro
- Registro rápido de medição (jejum, pós-café, almoço, jantar)
- Histórico com busca, edição, exclusão e exportação Excel
- Relatório com médias, gráfico e % dentro da meta gestacional
- Perfil com alteração de nome/senha
- **Notificações** — lembretes configuráveis por horário
- **PWA** — adicione à tela inicial do celular

## Instalar no celular (PWA)

1. Acesse o app pelo navegador (Chrome/Safari)
2. No Chrome: menu → "Instalar app" / "Adicionar à tela inicial"
3. No Safari: compartilhar → "Adicionar à Tela de Início"
4. Ative as notificações em **Perfil → Lembretes**

## Estrutura

```
app_v2/
├── src/
│   ├── app/           # Páginas (App Router)
│   ├── components/    # UI, layout, gráficos
│   ├── contexts/      # Auth
│   ├── lib/           # API, notificações, utilitários
│   └── types/         # TypeScript types
└── public/
    ├── manifest.webmanifest
    └── icons/
```

## Metas gestacionais

- Jejum: < 95 mg/dL
- 1h após refeição: < 179 mg/dL
- 2h após refeição: ≤ 152 mg/dL
