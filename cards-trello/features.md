## Feature - Exportação de PDF do Histórico
Ajustar o botão de download na aba Histórico. O arquivo gerado deve ser um PDF limpo, com cabeçalho (Nome da paciente, ID da gestação) e uma tabela organizada por data e período (Jejum, Pós-café, Almoço, etc.) para a médica conseguir ler em menos de 10 segundos

## Dev/UX - Implementar Banner de Instalação (PWA Prompt)
Configurar o manifest.json e o Service Worker para capturar o evento beforeinstallprompt. Em vez de torcer para a usuária adivinhar como baixa, o próprio site deve mostrar um pop-up nativo ou um botão bonito no topo da tela: "Instalar o GestaGlic no seu celular (Grátis)".

## UI/UX - Criar Modal de Instrução Visual (iOS vs Android)
Como o iOS (Safari) bloqueia a instalação automática por código, criar um modal explicativo lindo que aparece apenas para usuários de iPhone: "Para usar como aplicativo: 1. Clique no botão de Compartilhar 2. Role para baixo e clique em 'Adicionar à Tela de Início'". Use prints/ícones idênticos aos do iPhone.

## Regra de Negócio - Contador de Downloads de PDF
Criar uma coluna simples no banco de dados para a tabela do usuário (ex: pdf_downloads_count: integer, default: 0) e uma flag is_premium: boolean, default: false. Cada vez que o botão de download for acionado com sucesso, incrementar o contador se is_premium for falso.

## UI/UX - Tela de Limite Atingido (Gatilho dos R$ 9,90)
Se o contador chegar a 2 e a usuária tentar baixar o PDF novamente, em vez de gerar o arquivo, abrir um modal explicativo e carinhoso:
Texto sugerido: "Você já utilizou seus 2 PDFs gratuitos! 🥳 Esperamos que eles tenham ajudado na sua consulta médica. Para continuar gerando relatórios ilimitados até o nascimento do seu bebê, faça um Pix único de apenas R$ 9,90 e apoie o desenvolvimento do GestaGlic."


