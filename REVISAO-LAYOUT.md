# Revisão de layout — Figma "nini" × código

> Etapa 2 do plano de aplicação do layout. Nada de código foi alterado.
> Figma: `figma.com/design/yo4LWnNrqxIR7KqWuvDyrD` · Data: 2026-10-03

## Como esta revisão foi feita (e o que ficou de fora)

- **Escopo:** todas as telas de usuário do arquivo (comprador, criação/edição de post, vendedor/prestador, equipe, chat, configurações, login). Ficaram de fora as páginas `Dont Check`, `Do not check`, `Page 14` (vazia) e `Dashboard` (painel admin 1440px).
- **Variantes:** quando o mesmo nome de tela aparece várias vezes, vale a de **ID maior** (regra definida pelo Hugo). Isso deu **73 telas mobile (440px)** e **87 telas desktop (1280px)**.
- **Limite do plano Starter do Figma:** o MCP e a API de imagens bloquearam (espera de ~4,6 dias). Os dados vieram pela API REST (JSON dos nós), que dá valores exatos de cor, fonte, tamanho e posição. Consegui o JSON de **120 de 160 frames**: todos os mobile e 47 dos desktop. **Faltam 40 frames desktop** (website "MacBook Air" 74–85 e a página `incoice website`).
- **Comparação com o código:** cada rota rodou localmente (Chrome headless, 440×956 e 1280×832) e foi comparada com as telas do Figma reconstruídas a partir do JSON.

## Decisões que preciso de você antes de implementar

| # | Decisão | Por quê importa | Minha recomendação |
|---|---|---|---|
| D1 | **Idioma e direção.** O Figma está em inglês, com cabeçalho LTR (seta "voltar" à esquerda), mas com conteúdo alinhado à direita. O app é persa e RTL. | Muda o espelhamento de todas as telas. | Manter persa e RTL e espelhar o Figma (seta à direita, ações à esquerda). Os textos do Figma servem só de referência visual. |
| D2 | **Fonte.** O Figma usa **Inter**; o app usa **Yekan Bakh** (persa). Inter não tem glifos persas. | Inter sozinha quebraria o texto persa. | Yekan Bakh para persa, Inter para números e latim, com os tamanhos e pesos do Figma. |
| D3 | **Modo escuro.** O Figma só desenha o tema claro; o app hoje abre no escuro e tem alternância de tema. | "Fiel ao Figma" pede tema claro. | Tema claro como padrão. Manter o escuro como inversão automática dos tokens P&B (preto ↔ branco), sem desenho próprio. |
| D4 | **Cor de destaque.** O código usa **azul** `#3b82f6` em botões, links e preços. O Figma não tem azul: é preto e branco, com vermelho/verde/amarelo só para status. | É a maior diferença visual do projeto. | Trocar o destaque para preto (`#000`) e tirar o azul de todo lugar. |
| D5 | **Os nomes dos frames no Figma não batem com o conteúdo.** Ex.: o maior "single page service" é uma tela de **Analytics**; o maior "single Product page" é **Order information**; o maior "map" é um **formulário de endereço**. | A regra "ID maior" escolhe a tela errada nesses casos. | Para estes 3 nomes, usar a variante de maior ID **que tenha o conteúdo certo** (listei os IDs na tabela abaixo). |
| D6 | **Telas sem rota no código** (reserva, status do pedido, carteira, avaliação, equipe, chamadas, configurações etc.). | São telas novas, não reestilização. Muitas dependem de API que ainda não existe. | Fazer primeiro a reestilização do que já existe. Telas novas entram como interface com dados de exemplo (`data/*.json`, como o projeto já faz). |
| D7 | **Desktop.** O Figma desktop é uma coluna central de ~400px (a tela mobile centralizada) e uma barra fina de ícones à direita. Só o mapa e a criação de post têm layout desktop próprio. | Hoje o desktop usa grade larga e sidebar que expande no hover. | Seguir o Figma: coluna central `max-w-[440px]` e a barra de ícones fixa. Mapa e criação de post com layout próprio. |

## Tokens: Figma × código (prioridade máxima — base de tudo)

Extraídos de 120 frames. O arquivo **não tem** estilos nem variáveis publicados; os valores abaixo são os que mais se repetem.

| Token | Figma | Código hoje (`app/globals.css`) | Ação |
|---|---|---|---|
| Fundo | `#ffffff` | `--color-bg-primary #ffffff` (claro) / `#0a0a0a` (escuro, padrão atual) | manter + D3 |
| Texto principal | `#000000` | `#0f172a` | trocar para `#000` |
| Texto secundário | `#868686`, `#9e9e9e`, `#b5b5b5`, `#bdbdbd` (vários cinzas próximos) | `#64748b` / `#94a3b8` (azulados) | consolidar em 2: `#868686` e `#bdbdbd` |
| Superfície / placeholder | `#d9d9d9`, `#eaeaea`, `#f5f5f5`, `#eff3f4` | `#f1f5f9`, `#e2e8f0` | trocar por `#f5f5f5` / `#eaeaea` / `#d9d9d9` |
| Destaque / botão primário | `#000000` | `#3b82f6` (azul) | trocar (D4) |
| Bordas | `#000000` 1–2px nos campos e cards; `#cecece` 0,5px nos divisores | `#e2e8f0` 1px | novos tokens `border-strong` (#000) e `border-hairline` (#cecece) |
| Erro / alerta / badge | `#ff0000` | `red-500` | token `danger #ff0000` |
| Sucesso / online | `#12da00`, `#00cc07` | `green-500` | token `success #12da00` |
| Nota (estrela) / "Unpaid" | `#ffcc00`, `#ffe100` + texto `#ffa600` | `yellow-*` | token `warning #ffcc00` |
| Fonte | Inter (2235 textos), Roboto (379, só no teclado de exemplo) | Yekan Bakh + Geist | D2 |
| Escala de tipos | 10 · 12 · 14 · 16 · 18 · 22 · 24 · 40 (pesos 400/500/600) | tamanhos variados | criar escala com esses passos |
| Título de página | 24/400 | 18–20/600 | trocar |
| Raios | 10 (mais usado), 12 (campos), 8, 20 (botão grande), pílula 25–61 | `rounded-lg`/`xl`/`2xl` | tokens `radius-sm 8`, `md 10`, `lg 12`, `xl 20`, `full` |
| Sombra | quase não usa; `0 4 19 #22222212` em cards flutuantes | sombras em vários cards | remover a maioria |
| Margem lateral mobile | 16px (conteúdo com 408px de largura) | 12–20px variando | padronizar 16px |

## Componentes base (prioridade alta — reaproveitados por quase todas as telas)

| Componente Figma | Medidas do Figma | Existe no código? | Ação |
|---|---|---|---|
| **Cabeçalho de página** | seta "voltar" 40×40 a 16px da borda, título Inter 24/400, menu "⋮" 24px no outro lado; sem fundo nem borda | Cada página tem o seu (repetido) | **criar `PageHeader`** e usar em todas |
| **Bottom nav (mobile)** | 56px, fundo branco, borda superior 1px preta, 5 ícones só com contorno (sem rótulo): início, carrinho (badge vermelho 10px), +, busca, avatar 25px com anel de status | `MobileBottomNav`: 70px, com rótulos, ícone de mensagens no lugar de "início" | **reestilizar**; mensagens sai da barra (o chat é aberto pelo perfil/post) |
| **Barra lateral (desktop)** | barra fina de ícones à direita, com contorno | `Sidebar` expande no hover | reestilizar (D7) |
| **Campo de texto** | 408×56, raio 12, borda 2px preta, rótulo acima à direita 16/500 | estilos soltos por página | **criar `TextField`** |
| **Botão primário** | preto, texto branco; grande 408×75 raio 20 / médio pílula 342×48 | `.btn-primary` azul | reestilizar `.btn-primary` |
| **Botão secundário** | contorno preto 1–2px, fundo branco (ex.: "Cancel") | `.btn-secondary` cinza | reestilizar |
| **Abas em pílula** | pílula preta ativa 134×35 raio 25, inativa só texto 14/400 | abas sublinhadas (carrinho, perfil) | **criar `SegmentedTabs`** |
| **Bottom sheet** | fundo `#1d1d1d`/preto, puxador 54px branco, ações em pílula branca | `Modal` / drawer de filtro (claro) | **criar `BottomSheet`** preto |
| **Calendário / horário** | dentro do bottom sheet preto, abas "Time / Calendar", dia selecionado em círculo branco | `PersianCalendar` (claro) | reestilizar `PersianCalendar` (mantendo o calendário jalali) |
| **Chip / tag** | pílula; ativo preto com texto branco, inativo contorno preto, desabilitado cinza claro | chips variados | **criar `Chip`** |
| **Card de produto (grade)** | grade de 3 colunas sem espaço, imagem quadrada, nome 2 linhas centralizado, preço 12/600, badge "%" vermelho | `PostCard` (1 coluna, card com bordas) | reestilizar `PostCard` + grade de 3 colunas |
| **Card de pedido / carrinho** | 408×131, raio 10, borda 1px preta, imagem 100×100 raio 8 à direita, status em pílula amarela | lista simples | **criar `OrderCard`** |
| **Lista chave-valor** ("Feature") | linhas com divisor `#cecece` 0,5px, chave à direita, valor à esquerda, 14/400 | tabela de detalhes no post | **criar `SpecList`** |
| **Avatar com status** | anel 2px verde `#00cc07` / vermelho / cinza | `AvatarWithStatus` | reestilizar cores |
| **Badge de notificação** | círculo vermelho 9–10px, número branco 5–6px | existe | ajustar tamanho e cor |

## Telas: Figma × código, por prioridade

Legenda: 🟢 existe e é só reestilizar · 🟡 existe parcialmente · 🔴 não existe ainda

### P1 — Fluxo principal de compra e contratação (o que mais aparece para o usuário)

| Tela Figma (ID usado) | Rota no código | Situação | Principais diferenças |
|---|---|---|---|
| Login `925:1327` + Verification Code `815:2109` | `/login`, `/verify` | 🟢 | Figma: título "Login" branco sobre faixa preta, mapa 3D de fundo, campo com bandeira e +98, botão preto grande, "Sign in with Google", sheet preto de permissão de localização. Código: card escuro centralizado com botão azul. OTP no Figma: 4 caixas 64px, raio 10, borda branca sobre fundo de imagem. |
| search page `4502:7126` | `/search` | 🟡 | Figma: campo com contorno + atalho de cidade ("Teh"), lista de sugestões alinhada à direita, sugestão ativa em pílula preta; variante com lista de cidades e rádio. Código: campo cinza arredondado e resultados em grade. |
| result page `4464:6839` | `/search` (resultados) e `/explor` | 🟡 | Figma: grade de 3 colunas com imagens encostadas, nome + preço embaixo, bottom nav. Código: 1–2 colunas com cards grandes e cabeçalho de vendedor. |
| map `2341:5991` (variante conferida que mostra o mapa; ver D5) | `/full-map` | 🟢 | Figma: busca preta em pílula, pin do usuário com anel, rótulos pretos ("home", "workplace"), botões "Registration"/"Manual" e 2 botões redondos de localização; cards pretos (já feito no painel lateral). Código: mapa escuro com preços em balões brancos. |
| single page service `702:2796` (variante conferida; ver D5) | `/post/[id]` e `PostModal` | 🟢 | Figma: vendedor no topo à direita, imagem cheia com paginação em pílula, título 18/600, legenda, "Feature" em lista chave-valor, chips "Places / Type of service / current situation / Part replacement", preço grande 40/400 + pílula "meet". Código: fundo escuro, preço azul, sem chips. |
| página de produto — referência: edit post `1684:4377` (ver D5) | `/post/[id]` (produto) | 🟢 | Nenhuma variante "single Product page" conferida mostra o produto (as que vi são "Order information"). O edit post mostra o post de produto: contadores (nota, salvos, comentários, envios, curtidas), título, legenda, especificações e preço com "meet". |
| cart `4515:1620` | `/cart` | 🟢 | Figma: abas em pílula "Order history / Sales", cards de pedido com status "Unpaid" amarelo. Código: lista com +/− e total com botão azul. |
| Reservation page and description `4464:7395` | — | 🔴 | resumo do serviço + "send to myself" + bottom sheet preto de data/hora. |
| invioce customer `4508:8453` + Sale information `4490:5947` | `/checkout` | 🟡 | Figma: cabeçalho preto com valor grande (40px) "/hour", resumo do prestador, "Specifications" em lista, data/hora/local com ícones, "Buyer details". Código: formulário longo de endereço em cards escuros. |
| send (endereço) — "map" `4490:5780` | `/checkout` (endereço) | 🟡 | Figma: campos city/province/address/number/unit/postal code + sheet preto de seleção de província/cidade. |
| Payment `3510:5266` | `/checkout` (pagamento) | 🟡 | Figma: cartão preto de saldo (wallet) empilhado, lista de bancos com rádio, total, "Confirm Pay" preto. Código: botões de forma de pagamento. |
| user order status `3255:7481` | — | 🔴 | linha do tempo vertical (recebido → a caminho → entregue), "Tracking", "Confirm Delivery". |
| rate & comments `3008:4939` | comentários do `PostModal` | 🔴 | sheet preto com avatar, 5 estrelas, campo de comentário com microfone/câmera, Cancel/Done. |

### P2 — Social, perfil e mensagens

| Tela Figma | Rota | Situação | Principais diferenças |
|---|---|---|---|
| User Page `1061:2848` / customer `3080:8160` / seller `3510:5428` | `/profile`, `/[username]` | 🟢 | Figma: contadores (Post / Favorits / Customers) à esquerda, foto grande quadrada com anel de status à direita, bio, abas de categoria sublinhadas, grade de 3 colunas. Código: avatar redondo, destaques, botões. |
| user Status `816:2234` | `AvatarWithStatus` + menu do perfil | 🟡 | 3 botões grandes (offline preto / busy vermelho / online verde). |
| chat list `826:1794` | `/messages` (lista) | 🟢 | título "Chat", busca com contorno, itens com avatar à direita, hora à esquerda, badge preto de não lidas. |
| chat `4547:6339` | `/messages` (conversa) | 🟢 | balões pretos (enviados) e cinza-claros (recebidos), mensagem de voz, barra de digitação preta com emoji/anexo/câmera + botão redondo de microfone. Código: balões azuis. |
| Voice Call `1346:4670` / Video Call `2624:5901` | — | 🔴 | telas de chamada (fundo de imagem, botões redondos, vermelho para encerrar). |
| Profile setting `979:1376` | `/profile/edit` | 🟢 | avatar circular com botão de câmera preto, campos de 408px com contorno preto. |
| Setting `815:1994` + subtelas (Locations, Wallet, Saved, Notifications, Trending, Insights, scheduled content, Blocked, Language, Device permissions, Accessibility, Mode) | — | 🔴 | lista "General" com ícones; cada item abre uma subtela. |
| Wallet `4506:7561` | — | 🔴 | cartão preto de saldo, 5 ações (TopUp, Transfer, Request, Withdraw, Payment), transações com valor verde/vermelho. |
| Notification (`Customer 4508:8147`) | — | 🔴 | busca + lista com badge vermelho. |

### P3 — Criar e editar post

| Tela Figma | Rota | Situação | Principais diferenças |
|---|---|---|---|
| post type `2936:3778` | `/create-post` | 🔴 (como passo) | lista de tipos com busca. |
| Upload photo & Video `4648:7436` | `/create-post` | 🟡 | galeria em grade + seletor Photo/Video/File em pílula preta. |
| cat-title-caption `4648:7967` | `/create-post` | 🟡 | "Create post" + "Next", grade de mídia, Category, Title, Caption com editor rico (Heading, B, I, link, listas), alt text, linhas de opção com seta (Category, Scheduled posts, Tag & Keyword, endereço, information). |
| category / Add Category `4648:7610`, `4648:8244` | `/create-post` | 🟡 | lista em linhas com contorno, selecionada em preto. |
| Tag & Keyword `4648:7580` | `/create-post` | 🟡 | lista com seleção múltipla em preto. |
| Information / Feature `4648:8993`, `1466:4057`, `1466:4086` | `/create-post` | 🔴 | atributos chave-valor ("Search for an existing attribute or create a new one"). |
| Limited-Time Discount / unit / Scheduled posts | `/create-post` | 🔴 | sheets pretos de data, unidade de medida e agendamento. |
| edit post `1684:4377` | — | 🔴 | prévia do post com "Alt text" e edição. |
| **Desktop** MacBook Air 6/15/16/87/88 | `/create-post` | 🟡 | 2–3 colunas: prévia/agendamento, imagem principal + outras, categoria; título, legenda, painel "information" com abas (Inventory, Shipping, Linked Products, Attributes, Variations, Advanced, Tax Status). |

**Problema estrutural:** o Figma divide a criação de post em **passos** (tipo → mídia → dados → opções). O código faz tudo em uma página só, com 1222 linhas. Recomendo passos em um único componente com estado, sem criar rotas novas.

### P4 — Lado do prestador/vendedor e equipe

| Tela Figma | Rota | Situação |
|---|---|---|
| specialist `4506:7403` (cronômetro de trabalho, "Price per hour") | — | 🔴 |
| repairman page `4506:7431` (pedido recebido, Accept/Reject) | — | 🔴 |
| Sale information `4490:5947` | `/dashboard` (parcial) | 🟡 |
| Analytics (website "single page service" `4648:7863`) | `/dashboard` | 🟡 — gráficos em roxo `#9787ff`/amarelo; o código usa Recharts |
| Taxi Service `3255:7208`, Motorbike courier `3255:7391` | — | 🔴 |
| create Team: team list, add team, People, Address, search & add member, add member, member notification, More Options, Building painter | — | 🔴 (fluxo inteiro novo) |
| Shop `1051:2767` (perfil de loja) | `/[username]` | 🟢 |

### Componentes soltos (não são telas)

`motion & event` (estados de upload, carregando, toggle, slider de faixa), `ColorPicker`, `iPhone 16 Pro Max - 3/5/6`, `Group …`. Servem de referência para estados e controles.

## Problemas de UX e consistência no Figma (decida antes de implementar)

1. **Estados que faltam:** quase nenhuma tela tem estado vazio, de erro ou de carregamento desenhado. As exceções são "No posts have been published yet" no perfil, "Uploading..." em motion & event e o esqueleto cinza do chat. Hover e foco também não existem. *Sugestão:* esqueletos cinza `#eaeaea` no padrão do chat, erro em vermelho `#ff0000` abaixo do campo, foco com borda 2px preta mais grossa (3px).
2. **Muitos cinzas parecidos para texto** (`#868686`, `#8d8d8d`, `#9c9c9c`, `#9e9e9e`, `#b2b2b2`, `#b5b5b5`, `#bdbdbd`, `#c3c3c3`). *Sugestão:* reduzir para 2 tons.
3. **Tamanhos de fonte minúsculos:** 4px, 5px, 6px e 7px aparecem bastante (em badges, especificações e datas). Abaixo de 10–11px fica ilegível no celular e falha em acessibilidade. *Sugestão:* piso de 10px (badges) e 12px (textos).
4. **Tamanhos fracionados** (18,57px, 15,92px, 8,73px de raio): frames redimensionados no Figma. *Sugestão:* arredondar para a escala (18, 16, 8).
5. **Botão primário com 3 formatos diferentes:** retângulo 408×75 raio 20 (login), pílula 342×48 (permissões) e retângulo preto "Confirm Pay"/"Confirm Delivery". *Sugestão:* 2 tamanhos — grande (56px, raio 12, largura total) e pílula (48px).
6. **Idioma misturado:** inglês na interface e persa em alguns cards (loja). Ver D1.
7. **Sem responsividade intermediária:** só existem 440px e 1280px; tablet (768–1024) não foi desenhado. *Sugestão:* coluna central até 1024px e barra lateral a partir de 1024px.
8. **Áreas de toque pequenas:** ícones da bottom nav têm 16–20px de desenho. A área clicável precisa ter pelo menos 44×44 (Lei de Fitts). O desenho pode ficar igual.
9. **Nomes de frames repetidos e enganosos** (D5) e erros de digitação ("invioce", "Rateing", "Favorits", "Recived", "Traking", "Languege", "Accessibillity"). No código, uso os termos certos.
10. **Bottom nav sem "mensagens":** o Figma tira o atalho de chat da barra. Confirme se o chat fica acessível só pelo perfil/post, ou se ele entra no lugar de outro ícone.

## Problemas encontrados no código atual (independentes do Figma)

- ~~Estouro horizontal no mobile~~ — **corrigido nesta revisão:** era um artefato da captura (o Chrome headless tem largura mínima maior que 440px). Medido com emulação de dispositivo, nenhuma rota passa de 440px.
- **Tema escuro como padrão:** ver D3.
- Arquivos `app/(main)/explor/Copy #1 of page.tsx` e `Copy #2 of page.tsx` fora do git: parecem cópias de trabalho. Não vou mexer neles sem você dizer.

## Ordem de implementação proposta (Etapa 3)

1. **Tokens** em `app/globals.css` (cores, raios, escala de tipos, fonte) + tema claro como padrão.
2. **Componentes base:** `PageHeader`, `MobileBottomNav`, `Sidebar`, `TextField`, botões, `SegmentedTabs`, `Chip`, `BottomSheet`, `PersianCalendar`, `PostCard`, `OrderCard`, `SpecList`, `AvatarWithStatus`.
3. **P1:** login/verify → busca/resultados → mapa → post (serviço/produto) → carrinho → checkout (fatura, endereço, pagamento) → novas: reserva, status do pedido, avaliação.
4. **P2:** perfil/loja → mensagens (lista + conversa) → editar perfil → configurações e carteira (novas).
5. **P3:** criação de post em passos → editar post.
6. **P4:** telas do prestador e equipe (novas, com dados de exemplo).

Um commit por bloco, na branch `feat/layout-figma`. Antes de cada commit, confiro a tela no navegador (440px e 1280px) contra o Figma.
