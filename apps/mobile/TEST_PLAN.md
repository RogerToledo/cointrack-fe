# Plano de Testes — CoinTrack Mobile

## Pré-requisitos

- [ ] Backend rodando e acessível (`http://<IP>:8180/health` retorna OK)
- [ ] Expo Go instalado no dispositivo (Android ou iOS)
- [ ] Dev server rodando: `npx expo start --clear` em `apps/mobile/`
- [ ] Conta de teste com credenciais válidas
- [ ] Pelo menos 1 família, 1 cartão de crédito, e dados de exemplo cadastrados

---

## 1. Autenticação

### 1.1 Login
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 1 | Login com credenciais válidas | Digitar email e senha corretos → Entrar | Loading aparece, navega pro Dashboard |
| 2 | Login com senha errada | Digitar email correto e senha errada → Entrar | Mensagem de erro (credenciais inválidas) |
| 3 | Login com email inválido | Digitar "abc" no email → Entrar | Botão fica desabilitado (opaco) |
| 4 | Login com campos vazios | Deixar tudo vazio | Botão desabilitado |
| 5 | Sessão persistida | Fazer login, fechar app, reabrir | Vai direto pro Dashboard sem pedir login |
| 6 | Token expirado | Aguardar expiração ou limpar token manualmente | Redireciona pra tela de login |

### 1.2 Registro
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 7 | Navegar pra registro | Na tela de login → "Criar conta" | Tela de registro aparece |
| 8 | Registro com dados válidos | Preencher todos os campos → Enviar | Conta criada, navega pro Dashboard |
| 9 | Registro com email já existente | Usar email que já existe | Mensagem de erro da API |
| 10 | Validação de campos | Deixar campos obrigatórios vazios | Erros de validação nos campos |

### 1.3 Esqueci minha senha
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 11 | Navegar | Login → "Esqueci minha senha" | Tela de recuperação aparece |
| 12 | Enviar email válido | Digitar email → Enviar | Confirmação de envio |
| 13 | Email inválido | Digitar formato inválido | Mensagem de erro |

### 1.4 Logout
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 14 | Logout | Mais → Perfil → Sair | Volta pra tela de login, dados limpos |

---

## 2. Dashboard (Tab principal)

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 15 | Carregamento inicial | Após login, Dashboard carrega | Dados financeiros exibidos sem erro |
| 16 | Pull to refresh | Puxar pra baixo na tela | Indicador de refresh, dados atualizados |
| 17 | Navegação por mês | Usar setas de mês (anterior/próximo) | Dados do mês selecionado |
| 18 | Mês futuro bloqueado | Tentar avançar além do mês atual | Botão "próximo" desabilitado |
| 19 | Seletor de família | Se tiver +1 família, trocar no header | Dashboard atualiza com dados da família selecionada |
| 20 | Estado sem dados | Mês sem registros | Estado vazio (EmptyState) |
| 21 | Erro de rede | Desligar Wi-Fi → tentar carregar | Mensagem de erro com botão "Tentar novamente" |

---

## 3. Compras (Tab Compras)

### 3.1 Listagem
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 22 | Listar compras | Tab Compras | Lista de compras do mês exibida |
| 23 | Navegação por mês | Setas anterior/próximo | Compras do mês selecionado |
| 24 | Pull to refresh | Puxar pra baixo | Lista atualizada |
| 25 | Lista vazia | Mês sem compras | EmptyState |
| 26 | Swipe pra deletar | Arrastar item pra esquerda | Botão "Excluir" aparece |
| 27 | Confirmar exclusão | Swipe → Excluir → Confirmar | Item removido da lista |
| 28 | Cancelar exclusão | Swipe → Excluir → Cancelar | Item permanece |

### 3.2 Formulário de compra
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 29 | Abrir formulário | Botão "+" ou "Adicionar" | Formulário de nova compra |
| 30 | Criar compra válida | Preencher todos os campos → Salvar | Compra criada, volta pra lista |
| 31 | Campos obrigatórios vazios | Tentar salvar sem preencher | Erros de validação |
| 32 | Selecionar cartão de crédito | Abrir seletor de cartão | Lista de cartões, selecionar um |
| 33 | Selecionar tipo de compra | Abrir seletor | Lista de tipos, selecionar um |
| 34 | Parcelamento | Marcar "parcelado" → definir parcelas | Campos de parcela aparecem |

---

## 4. Despesas (Tab Despesas)

### 4.1 Listagem
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 35 | Listar despesas | Tab Despesas | Lista de despesas do mês |
| 36 | Navegação por mês | Setas | Despesas do mês selecionado |
| 37 | Pull to refresh | Puxar pra baixo | Lista atualizada |
| 38 | Swipe pra deletar | Arrastar → Excluir → Confirmar | Item removido |
| 39 | Lista vazia | Mês sem despesas | EmptyState |

### 4.2 Formulário de despesa
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 40 | Criar despesa | Preencher campos → Salvar | Despesa criada, volta pra lista |
| 41 | Validação | Salvar sem preencher | Erros nos campos |

---

## 5. Ganhos (Tab Ganhos)

### 5.1 Listagem
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 42 | Listar ganhos | Tab Ganhos | Lista de ganhos do mês |
| 43 | Navegação por mês | Setas | Ganhos do mês selecionado |
| 44 | Pull to refresh | Puxar pra baixo | Lista atualizada |
| 45 | Swipe pra deletar | Arrastar → Excluir → Confirmar | Item removido |
| 46 | Lista vazia | Mês sem ganhos | EmptyState |

### 5.2 Formulário de ganho
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 47 | Criar ganho | Preencher campos → Salvar | Ganho criado, volta pra lista |
| 48 | Validação | Salvar sem preencher | Erros nos campos |

---

## 6. Mais (Tab Mais)

### 6.1 Menu
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 49 | Abrir menu | Tab Mais | Lista de opções (Cartão, Tipo de Compra, etc.) |
| 50 | Navegação | Tocar em cada item | Navega pra tela correspondente |

### 6.2 Cartão de Crédito
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 51 | Listar cartões | Mais → Cartão de Crédito | Lista de cartões cadastrados |
| 52 | Criar cartão | Botão adicionar → Preencher → Salvar | Cartão criado |
| 53 | Swipe deletar | Arrastar → Excluir → Confirmar | Cartão removido |

### 6.3 Tipo de Compra
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 54 | Listar tipos | Mais → Tipo de Compra | Lista de tipos |
| 55 | Criar tipo | Adicionar → Preencher → Salvar | Tipo criado |
| 56 | Deletar tipo | Swipe → Excluir | Tipo removido |

### 6.4 Tipo de Pagamento
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 57 | Listar tipos | Mais → Tipo de Pagamento | Lista de tipos de pagamento |
| 58 | Criar tipo | Adicionar → Salvar | Tipo criado |
| 59 | Deletar tipo | Swipe → Excluir | Tipo removido |

### 6.5 Família
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 60 | Ver família | Mais → Família | Dados da família |

### 6.6 Pessoa
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 61 | Listar pessoas | Mais → Pessoa | Lista de pessoas |
| 62 | Criar pessoa | Adicionar → Salvar | Pessoa criada |
| 63 | Deletar pessoa | Swipe → Excluir | Pessoa removida |

### 6.7 Fatura
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 64 | Ver fatura | Mais → Fatura | Tela de fatura com seletor de cartão |
| 65 | Trocar cartão | Selecionar outro cartão | Fatura atualiza com dados do cartão |
| 66 | Navegação por mês | Setas | Fatura do mês selecionado |
| 67 | Fatura vazia | Mês/cartão sem compras | EmptyState ou total R$0 |

### 6.8 Perfil
| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 68 | Ver perfil | Mais → Perfil | Nome e email do usuário |
| 69 | Logout | Botão Sair | Volta pra login |

---

## 7. Componentes e interações globais

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 70 | MonthNavigator | Tocar setas em qualquer lista | Mês muda, dados recarregam |
| 71 | SwipeableRow (gestos) | Arrastar item em qualquer lista | Ação de delete aparece suavemente |
| 72 | ConfirmDialog | Tentar deletar qualquer item | Modal de confirmação com "Cancelar" e "Excluir" |
| 73 | Toast notifications | Após criar/deletar item | Toast aparece brevemente confirmando ação |
| 74 | Pull to refresh | Puxar pra baixo em qualquer lista | Indicador de refresh + dados atualizados |
| 75 | FamilySelector | Header → trocar família | Dados de todas telas atualizam |
| 76 | Loading states | Navegar pra tela com dados lentos | Spinner/skeleton enquanto carrega |
| 77 | Error states | Falha de rede em qualquer tela | Mensagem de erro + "Tentar novamente" |
| 78 | Empty states | Tela sem dados | Mensagem amigável de lista vazia |

---

## 8. Navegação

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 79 | Tab bar | Tocar em cada tab | Navega corretamente, ícone fica ativo |
| 80 | Back navigation | Entrar em sub-tela → voltar | Volta pra tela anterior |
| 81 | Deep navigation | Mais → Cartão → Formulário → Voltar → Voltar | Pilha de navegação funciona |
| 82 | Auth guard | Deslogar → tentar acessar tab | Não consegue, fica no login |

---

## 9. UX e Visual

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 83 | Safe areas | Verificar topo e fundo da tela | Conteúdo não fica atrás de status bar ou nav bar |
| 84 | Teclado | Abrir teclado em formulários | Tela sobe, campos não ficam escondidos |
| 85 | Orientação portrait | Girar dispositivo | App fica em portrait (se configurado) |
| 86 | Tema claro/escuro | Mudar tema do sistema | App segue preferência (`userInterfaceStyle: automatic`) |
| 87 | Valores em BRL | Verificar valores monetários | Formatados como R$ 1.234,56 |

---

## 10. Resiliência

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| 88 | Perda de conexão | Desligar Wi-Fi durante uso | Erro amigável, não crasha |
| 89 | Reconexão | Religar Wi-Fi → pull to refresh | Dados carregam normalmente |
| 90 | Double tap | Tocar 2x rápido em botão de salvar | Não cria duplicado |
| 91 | Voltar durante loading | Iniciar request → apertar voltar | Não crasha, cancela graciosamente |
| 92 | App em background | Minimizar → voltar depois de minutos | App retoma sem crash |

---

## Legenda de status

- ✅ Passou
- ❌ Falhou (detalhar no campo de observação)
- ⏭️ Não testável (justificar)
- 🔄 Pendente

---

## Observações

| # do teste | Status | Observação |
|------------|--------|------------|
| | | |
