# Estratégia de notificações — GestaGlic

Objetivo: ser útil na rotina da gestante, **sem spam**.

## Princípios

1. **Opt-in explícito** — só push depois que a usuária ativa (home ou Perfil).
2. **Contexto, não marketing** — cada push deve ajudar na medição ou na consulta.
3. **Cap por dia** — no máximo 1 push por slot (jejum, café, almoço, jantar).
4. **Inteligência** — não enviar se ela **já mediu** aquele período hoje (já implementado no cron).
5. **Horário silencioso** — respeitar janela 07h–21h (ajustar no scheduler se necessário).

## Tipos de notificação

### Já existem (manter)

| Tipo | Quando | Máx/dia |
|------|--------|---------|
| Lembrete de medição | Horário configurado no Perfil | 4 (1 por slot) |

### Fase 2 — úteis e raras (sugerido)

| Tipo | Quando | Máx/semana | Notas |
|------|--------|------------|-------|
| Consulta pré-natal | 2 dias antes, se tem ≥3 medições na semana | 1 | CTA: gerar PDF |
| Parabéns streak | 7 dias seguidos com medições | 1 | Tom leve, sem cobrança |
| Nova dica | Artigo publicado no blog | 1 | Só se push de conteúdo ativado |
| Comunidade | Resposta no post dela | 1 | Opt-in separado no futuro |

### Evitar (spam)

- Cobrança premium repetida
- “Volte ao app” genérico
- Mais de 1 push no mesmo slot
- Push à noite (após 21h)

## Implementação técnica (roadmap)

- `notificationPreferences` no User: `{ mealReminders, prenatalReport, tips, community }`
- Cron `/push/reminders` — lembretes de medição (atual)
- Cron semanal — relatório pré-natal (só quem tem dados)
- Admin: enviar dica em massa com limite 1/semana

## UX no app

- **Home:** card com toggle + benefícios (implementado)
- **Perfil:** horários + toggle
- Futuro: seção “O que você quer receber” com checkboxes
