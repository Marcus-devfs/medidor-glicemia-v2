## Dev - Painel Administrativo Simples (/admin)
Criar uma rota protegida por autenticação (pode ser apenas o seu e-mail hardcoded com uma flag is_admin: true no banco) para você acompanhar a saúde do negócio.

**Métricas para exibir na tela:** 
- Usuários: Total de grávidas cadastradas e novos cadastros nos últimos 7 dias.
- Métricas de Infra: Total de documentos/registros salvos no MongoDB (para monitorar o limite de 512MB do plano gratuito M0) e link rápido para o Analytics da Vercel.
- Financeiro: Quantidade de Pix de R$ 9,90 gerados vs. pagos.

-- Novas ---

## Feature - Feed de Dicas e Notícias (Blog Interno)
Um feed na tela inicial do app com pílulas de conteúdo confiável. Para não dar trabalho de programar um gerenciador de conteúdo (CMS) do zero agora, podemos usar o próprio MongoDB para ler artigos cadastrados por nós ou integrar com um CMS gratuito (como Strapi ou Notion API) no futuro.

Ideias de Conteúdo Inicial:
- "Substitutos do açúcar que são seguros na gestação."
- "Como medir a glicemia corretamente para evitar erros."
- "Receita de doce fake para o desejo da tarde."

## Feature - Fórum/Comunidade da Grávida Doce
Criar um espaço de fórum simples dentro do app (ex: app.gestaglic.com.br/comunidade).
Mecânica Simplificada:

Qualquer usuária logada pode criar um post (Título + Texto + Categoria, ex: Alimentação, Ansiedade, Sintomas, Vitórias).

Outras usuárias podem responder em formato de comentários.
- Botão de "Coração" ou "Apoiar" no post.
- Nota de Segurança/Moderação: Adicionar no checklist a necessidade de termos de uso claros e um botão simples de "Denunciar post", já que comunidade de saúde exige cuidado com desinformação médica.

