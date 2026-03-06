# Mapeamento ETL — SGA Hinova → Núcleo Top Brasil

**Base URL:** `https://api.hinova.com.br/api/sga/v2`
**Autenticação:** `POST /usuario/autenticar` → Bearer token (sessão)
**Data início mapeamento:** 2026-03-05

---

## Hierarquia de entidades (Cadastro)

```
Consultor
  └── Associado
        ├── Veículo → Serviço
        ├── Beneficiário → Benefício
        └── Boleto
```

---

## Status do mapeamento

| Entidade | Status | Endpoints executados |
|----------|--------|----------------------|
| Associado | ✅ Concluído | `POST /listar/associado`, `GET /associado/buscar/:codigo/codigo` |
| Veículo | ✅ Concluído | `GET /veiculo/buscar/:placa/placa` |
| Serviço (Produto) | ✅ Concluído | `GET /produto/buscar/:codigo`, `GET /listar/classificacao-produto/todos` |
| Beneficiário | ✅ Concluído / ⚠️ `codigo_parentesco` via banco | `POST /listar/beneficiario`, `GET /beneficiario/buscar/:codigo` |
| Benefício | ✅ Concluído | `GET /listar/beneficio-beneficiario/:codigo_beneficiario` |
| Boleto | ✅ Concluído | `POST /listar/boleto` |
| Consultor | ✅ Concluído | `GET /listar/voluntario/ativo` |

---

## ENTIDADE: Associado

**Volume:** 62.308 registros ativos
**Endpoints:**
- `POST /listar/associado` — listagem paginada (`codigo_situacao` obrigatório)
- `GET /associado/buscar/:cpfOuCodigo/:buscar_por` — registro completo (buscar_por: `codigo` ou `cpf`)

### Campos

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_associado` | integer | `129087` | **PK** |
| `nome` | varchar | `"070 AGROPECUÁRIA E COMÉRCIO LTDA"` | |
| `cpf` | varchar(18) | `"48991206000157"` | CPF (PF) ou CNPJ (PJ) |
| `tipo_pessoa` | enum | `"JURÍDICA"` | `FÍSICA` \| `JURÍDICA` |
| `sexo` | char(1) | `"M"` | `M` \| `F` |
| `data_nascimento` | datetime | `"1972-08-15T00:00:00-0300"` | timezone -0300 |
| `nome_mae` | varchar | `""` | apenas no `buscar` |
| `nome_pai` | varchar | `""` | apenas no `buscar` |
| `rg` | varchar | `"3164923"` | `rg_associado` no `listar` |
| `orgao_expedidor_rg` | varchar | `"SPTC"` | |
| `data_expedicao_rg` | datetime \| null | `null` | |
| `cnh` | varchar | `"01613420385"` | |
| `categoria_cnh` | varchar | `"AB"` | |
| `data_vencimento_habilitacao` | datetime | `"2029-04-16T00:00:00-0300"` | |
| `codigo_estado_civil` | integer | `"6"` | FK → estado_civil |
| `codigo_profissao` | integer | `"1"` | FK → profissao |
| `codigo_classificacao` | integer | `"1"` | FK → classificacao |
| `dia_vencimento` | char(2) | `"15"` | FK → vencimento |
| `codigo_situacao` | integer | `1` | FK → situacao |
| `codigo_regional` | integer | `229` | FK → Regional |
| `codigo_cooperativa` | integer | `"39"` | FK → Equipe de Vendas |
| `codigo_voluntario` | integer \| null | `null` | FK → Consultor |
| `codigo_associado_beneficiario` | integer | `"212919"` | código deste associado como beneficiário |
| `codigo_externo` | varchar | `""` | código em sistema externo |
| `spcSerasa` | enum | `"NÃO"` | `SIM` \| `NÃO` |
| `codigo_tipo_cobranca_recorrente` | integer | `"1"` | 1 = `BOLETO/CARNÊ` |
| `ddd` + `telefone` | varchar | `""` + `""` | telefone fixo splitado (no `listar`) |
| `telefone_fixo` | varchar | `"(31)0000-0000"` | formatado `(DD)NNNN-NNNN` (no `buscar`) |
| `ddd_celular` + `telefone_celular` | varchar | `"62"` + `"9940-94791"` | splitado no `listar` |
| `ddd_celular_aux` + `telefone_celular_aux` | varchar | `""` + `""` | |
| `ddd_comercial` + `telefone_comercial` | varchar | `""` + `""` | |
| `email` | varchar | `"agropecuaria070@gmail.com"` | |
| `email_auxiliar` | varchar | `""` | |
| `cep` | varchar(9) | `"74470-400"` | |
| `logradouro` | varchar | `"RODOVIA GO-070"` | |
| `numero` | varchar | `"S/N"` | |
| `complemento` | varchar | `"QD CH LT 38 KM 3"` | |
| `bairro` | varchar | `"CHÁCARA HELOU"` | |
| `cidade` | varchar | `"GOIÂNIA"` | |
| `estado` | char(2) | `"GO"` | UF |
| `data_cadastro` | date | `"2025-12-21T00:00:00-0300"` | `data_cadastro_associado` no `listar` |
| `data_contrato` | datetime | `"2025-12-16T00:00:00-0300"` | `data_contrato_associado` no `listar` |
| `hora_contrato` | time | `"21:35:20"` | separado no `listar`, embutido no `buscar` |
| `radio` / `radio2` | varchar | `""` | nº de rádio comunicador |
| `pontos` | decimal | `0` | |
| `filhos` | integer | `0` | |
| `opcoes_notificacao` | object | `{"email":"Y","sms":"Y","whatsapp":"Y"}` | |
| `campos_opcionais` | array | `["sem campo opcional cadastrado"]` | campos customizados do cliente |

### Tabelas auxiliares

| Tabela | Endpoint | Valores |
|--------|----------|---------|
| `estado_civil` | `GET /listar/estadocivil/todos` | 1=Solteiro, 2=Casado, 3=Viúvo, 4=Desquitado, 5=Divorciado, 6=Não Informado, 7=União Estável |
| `profissao` | `GET /listar/profissao/todos` | 82 registros (1=Não Especificado ativo; demais inativo*) |
| `classificacao` | `GET /listar/classificacao-associado/todos` | 1=Não Informado, 2=Não Enviar Lembrete |
| `vencimento` | `GET /listar/vencimento/todos` | dias ativos: 5, 7, 10, 15, 20, 25, 26, 30 |
| `midia` | `GET /midia/listar/todos` | 1=Não Informado, 2=Rádio, 3=TV, 4=Indicação, 7=Panfleto, 8=Outdoor, 9=Redes Sociais |
| `situacao` | bloqueada pela token atual | inferir do campo `descricao_situacao` no registro |

### Alertas ETL

- ⚠️ Telefones: **splitados** no `listar` (ddd + número) e **formatados** no `buscar` → normalizar para um padrão
- ⚠️ `codigo_associado_beneficiario`: relação circular — associado pode ser beneficiário de outro associado
- ⚠️ Typo no SGA: campo `situacao` da tabela `profissao` grava `"INAIVO"` em vez de `"INATIVO"`
- ⚠️ Endpoint `listar/situacao` bloqueado para este token — inferir `codigo_situacao` 1 = ATIVO pelos dados

---

## ENTIDADE: Veículo

**Endpoint:** `GET /veiculo/buscar/:placa/placa`
> Busca por placa funciona. Busca por `codigo_veiculo` direta retorna 404. Listagem por associado bloqueada para este token.
> Veículos também vêm **embutidos** no `GET /associado/buscar` (campos resumidos).

### Campos

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_veiculo` | integer | `"160283"` | **PK** |
| `placa` | varchar(8) | `"PQD7B10"` | formato Mercosul ou antigo |
| `chassi` | varchar(17) | `"9BG148TA0HC451966"` | |
| `renavam` | varchar(11) | `"01120473702"` | |
| `numero_motor` | varchar | `"163570792"` | |
| `ano_fabricacao` | integer | `2017` | |
| `ano_modelo` | integer | `2017` | |
| `km` | integer | `0` | |
| `quantidade_portas` | integer | `0` | |
| `quantidade_passageiros` | integer | `0` | |
| `cambio` | char(1) | `"A"` | `A`=Automático / `M`=Manual |
| `cilindrada` | integer | `0` | para motos |
| `codigo_tipo_veiculo` | integer | `"2"` | FK → tipo_veiculo (2=Picape) |
| `codigo_marca` | integer | `"72"` | FK → marca (denorm: `marca`) |
| `marca` | varchar | `"GM - CHEVROLET"` | denormalizado |
| `codigo_modelo` | integer | `"4373"` | FK → modelo (denorm: `modelo`) |
| `modelo` | varchar | `"S10 PICK-UP ADVANTAGE 2.5 FLEX 4X2 CD"` | denormalizado |
| `codigo_cor` | integer | `"2"` | FK → cor (2=Branca) |
| `codigo_combustivel` | integer | `"1"` | FK → combustivel (1=Flex) |
| `codigo_categoria` | integer | `"4"` | FK → categoria — denorm: `categoria` |
| `categoria` | varchar | `"NORMAL"` | denormalizado |
| `codigo_grupo_produto` | integer | `"6"` | FK → grupo_produto (**= plano de proteção**) |
| `codigo_fipe` | varchar | `"004474-1"` | código FIPE |
| `valor_fipe` | decimal | `102820` | valor FIPE atual |
| `valor_fipe_protegido` | decimal | `"102820.00"` | valor FIPE no momento da adesão |
| `porcentagem_fipe_protegido` | decimal | `0` | % FIPE protegido |
| `valor_fixo` | decimal | `369.32` | mensalidade fixa |
| `valor_adesao` | decimal | `0` | |
| `participacao` | decimal | `0` | valor de participação em sinistro |
| `codigo_cota` | varchar | `"3000"` | faixa de valor FIPE |
| `cota` | varchar | `"PICAPES CENTRO OESTE - R$ 100.000,01 à R$ 110.000,00"` | descrição da faixa |
| `codigo_depreciacao` | integer | `"1"` | FK → tabela de depreciação |
| `codigo_tabela_avaliacao` | varchar | `"0"` | |
| `codigo_tipo_envio_boleto` | integer | `"3"` | 3 = `ENVIO POR E-MAIL E WHATSAPP` |
| `forma_pagamento_protecao` | integer | `1` | |
| `boleto_fisico` | char(1) | `"N"` | `S` / `N` |
| `codigo_vencimeto` | integer | `"4"` | FK → vencimento (**typo no SGA**: `vencimeto`) |
| `dia_vencimento` | char(2) | `"15"` | |
| `mes_referente` | varchar | `"02/2026"` | `MM/YYYY` do último fechamento |
| `mes_final_carne` | integer | `0` | |
| `pontos` | decimal | `0` | |
| `codigo_situacao` | integer | `"1"` | FK → situacao |
| `descricao_situacao` | varchar | `"ATIVO"` | denormalizado |
| `data_cadastro` | datetime | `"2025-12-21T00:00:00-0300"` | |
| `hora_cadastro` | time | `"21:35:22"` | |
| `data_contrato` | datetime | `"2025-12-16T00:00:00-0300"` | |
| `data_reativacao` | datetime \| null | `null` | |
| `codigo_regional` | integer | `"229"` | FK → Regional |
| `codigo_cooperativa` | integer | `"39"` | FK → Equipe de Vendas |
| `codigo_associado` | integer | `"129087"` | FK → Associado |
| `codigo_voluntario` | integer | `"148"` | FK → Consultor |
| `nome_voluntario` | varchar | `"RODRIGO MELO SILVA"` | denormalizado |
| `cpf_voluntario` | varchar | `"03473617148"` | denormalizado |
| `usuario_cadastro` | varchar | `"CRM 2 CENTRO OESTE"` | login que cadastrou o veículo |
| `codigo_externo` | varchar \| null | `null` | |
| `codigo_veiculo_vinculado` | integer \| null | `null` | FK → outro veículo vinculado |
| `codigo_veiculo_indicador` | integer \| null | `null` | FK → veículo que indicou |
| `codigo_associado_indicador` | integer \| null | `null` | FK → associado que indicou |
| `campos_opcionais` | array | `["sem campo opcional cadastrado"]` | |
| *(dados do associado denormalizados)* | | — | nome, cpf, rg, telefones, email, endereço completo |

### Tabelas auxiliares do Veículo

| Tabela | Endpoint | Valores relevantes |
|--------|----------|--------------------|
| `cor` | `GET /listar/cor/todos` | 19 cores (1=Preto, 2=Branca, 6=Cinza, 9=Prata, 10=Não Especificado…) |
| `combustivel` | `GET /listar/combustivel/todos` | 1=Flex, 2=Gasolina, 3=Etanol, 4=Diesel, 10=Elétrico, 12=Híbrido… |
| `tipo_veiculo` | `GET /listar/tipo-veiculo/todos` | 1=Veículos Leves, 2=Picape, 3=Motocicleta, 4=Truck Top, 16=Premium… |
| `grupo_produto` | `GET /listar/grupo-produto/todos` | 24 grupos — planos Black/Gold/Platinum por regional e tipo |
| `categoria` | bloqueada | inferir do campo `categoria` no registro |

### Alertas ETL

- ⚠️ Typo no campo: `codigo_vencimeto` (falta o `n`)
- ⚠️ Dados do associado vêm **denormalizados** no veículo — ignorar na carga, usar FK
- ⚠️ `codigo_voluntario` presente no veículo E no associado — consultor pode ser diferente por veículo
- ⚠️ Endpoint de listagem por associado bloqueado → extração em massa exige buscar por placa ou via associado/buscar (veículos embutidos)

---

## ENTIDADE: Serviço (= Produto no SGA)

**Endpoints:**
- `GET /produto/buscar/:codigo_produto` — registro individual
- `GET /listar/classificacao-produto/todos` — categorias de produto

> No SGA, o que o Núcleo chama de "Serviço" é o **Produto** — add-ons e cobranças avulsas vinculadas a um veículo ou associado.

### Campos

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_produto` | integer | `"6"` | **PK** |
| `descricao` | varchar | `"CARRO RESERVA (30 DIAS)"` | nome do produto |
| `descricao_boleto` | varchar | `"CARRO RESERVA (30 DIAS)"` | texto que aparece no boleto |
| `codigo_classificacaoproduto` | integer | `"22"` | FK → classificacao_produto (22=CARRO RESERVA) |
| `codigo_fornecedor` | integer | `"1"` | FK → Fornecedor |
| `nome_fornecedor` | varchar | `"TOP PREV"` | denormalizado |
| `situacao` | varchar | `"INATIVO"` | `ATIVO` / `INATIVO` |

### Classificações de Produto (ativas)

| Código | Descrição |
|--------|-----------|
| 4 | PRODUTO ADICIONAL VEICULO |
| 10 | PRODUTO ADICIONAL ASSOCIADO |
| 21 | ASSISTÊNCIA 24HRS |
| 22 | CARRO RESERVA |
| 23 | VIDROS |
| 24 | RASTREADOR |
| 25 | PROTEÇÃO TERCEIROS |
| 41 | EVENTOS |

### Alertas ETL

- ℹ️ Produto pode ser vinculado a **Veículo** (class 4) ou **Associado** (class 10) diretamente
- ⚠️ Endpoint de listagem de produtos por veículo/associado não encontrado — vínculo provavelmente via **Boleto** (cada produto gera uma linha no boleto)
- ⚠️ `grupo_produto` do veículo é o **plano de proteção** (Black/Gold/Platinum), diferente de `produto` que são add-ons avulsos

---

## ENTIDADE: Beneficiário

**Endpoints:**
- `POST /listar/beneficiario` — listagem paginada (`codigo_situacao` obrigatório)
- `GET /beneficiario/buscar/:codigo_beneficiario` — registro completo

**Volume:** 71.542 registros ativos

> Nota: o `codigo_beneficiario` é gerado automaticamente pelo SGA, diferente do `codigo_associado`.
> O associado sempre tem um `codigo_beneficiario` associado a ele mesmo (parentesco "O PRÓPRIO").

### Campos

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_beneficiario` | integer | `"212919"` | **PK** |
| `codigo_associado` | integer | `"129087"` | FK → Associado (de quem é beneficiário) |
| `nome` | varchar | `"070 AGROPECUÁRIA E COMÉRCIO LTDA"` | |
| `cpf` | varchar(14) | `"48991206000157"` | |
| `cpf_associado` | varchar | `"48991206000157"` | denormalizado |
| `sexo` | char(1) | `"M"` | `M` / `F` |
| `data_nascimento_beneficiario` | date | `"1972-08-15"` | formato `YYYY-MM-DD` |
| `rg_beneficiario` | varchar | `"3164923"` | |
| `orgao_expedidor_rg` | varchar | `"SPTC"` | |
| `data_expedicao_rg_beneficiario` | date | `"0000-00-00"` | string `"0000-00-00"` quando não informado |
| `cnh` | varchar | `"01613420385"` | |
| `categoria_cnh` | varchar | `"AB"` | |
| `nome_mae` | varchar | `""` | |
| `nome_pai` | varchar | `""` | |
| `logradouro` | varchar | `"RODOVIA GO-070"` | |
| `numero` | varchar | `"S/N"` | |
| `complemento` | varchar | `"QD CH LT 38 KM 3"` | |
| `bairro` | varchar | `"CHÁCARA HELOU"` | |
| `cidade` | varchar | `"GOIÂNIA"` | |
| `estado` | char(2) | `"GO"` | |
| `cep` | varchar(9) | `"74470-400"` | |
| `ddd` | integer | `0` | fixo (integer, diferente do Associado que é string) |
| `telefone` | varchar | `""` | |
| `ddd_celular` | integer | `62` | |
| `telefone_celular` | varchar | `"9940-94791"` | |
| `ddd_celular_aux` | integer | `0` | |
| `telefone_celular_aux` | varchar | `""` | |
| `ddd_comercial` | integer | `0` | |
| `telefone_comercial` | varchar | `""` | |
| `email` | varchar | `"agropecuaria070@gmail.com"` | |
| `email_auxiliar` | varchar | `""` | |
| `valor_fixo` | decimal | `0` | mensalidade (se tiver cobrança separada) |
| `valor_adesao` | decimal | `0` | |
| `participacao` | decimal | `0` | |
| `pontos` | decimal | `0` | |
| `codigo_voluntario` | integer \| null | `null` | FK → Consultor |
| `radio` / `radio2` | varchar | `""` | |
| `data_cadastro_beneficiario` | date | `"2025-12-21"` | |
| `data_contrato_beneficiario` | date | `"2025-12-21"` | |
| `hora_contrato_beneficiario` | time | `"21:35:20"` | |
| `codigo_situacao` | integer | `"1"` | FK → situacao |
| `descricao_situacao` | varchar | `"ATIVO"` | |
| `campos_opcionais` | array | `["sem campo opcional cadastrado"]` | |

> ⚠️ **`codigo_parentesco` ausente** na resposta da API — parentesco não é retornado pelo endpoint atual.

### Tabelas auxiliares

| Tabela | Endpoint | Valores |
|--------|----------|---------|
| `parentesco` | `GET /listar/parentesco/todos` | 1=Mãe, 2=Pai, 3=Filho(a), 4=Avô(ó), 5=Cônjuge, 6=Nenhum, 7=O Próprio |

### Alertas ETL

- ⚠️ `ddd` vem como **integer** no Beneficiário e como **string** no Associado — normalizar para varchar
- ⚠️ `data_expedicao_rg_beneficiario` = `"0000-00-00"` (string) quando não informado — tratar como null
- ⚠️ `codigo_parentesco` **não retorna** em nenhum endpoint de beneficiário — requer acesso direto ao banco para ETL
- ⚠️ `listar/beneficiario` **ignora o filtro `codigo_associado`** — retorna todos os 71k registros paginados sem filtragem; extração full-scan necessária
- ⚠️ Situações conhecidas: 1=ATIVO, 4=INADIMPLENTE

---

## ENTIDADE: Benefício

**Endpoint:** `GET /listar/beneficio-beneficiario/:codigo_beneficiario`

> Benefício é uma entidade **separada de Produto** — hipótese anterior estava incorreta.
> Cada Beneficiário tem um array de Benefícios (clube de vantagens: seguros, convênios, etc).

### Campos retornados pelo endpoint

O endpoint retorna dados do Beneficiário + array `beneficios`:

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_beneficiario` | integer | `"103287"` | FK → Beneficiário |
| `nome` | varchar | `"RAMON FIGUEIREDO DE OLIVEIRA SILVA"` | denormalizado |
| `cpf` | varchar | `"09743888667"` | denormalizado |
| `sexo` | char(1) | `"M"` | |
| `telefone` | varchar | `"(0)"` | |
| `celular` | varchar | `"(31)99164-0603"` | |
| `logradouro` | varchar | `"RUA ADELINA MARIA DE OLIVEIRA"` | |
| `numero` | varchar | `"86"` | |
| `bairro` | varchar | `"DIAMANTE (BARREIRO)"` | |
| `cidade` | varchar | `"BELO HORIZONTE"` | |
| `estado` | char(2) | `"MG"` | |
| `data_contrato` | datetime | `"2022-04-27T00:00:00-0300"` | |
| `situacao` | varchar | `"ATIVO"` | situação do beneficiário |
| `situacao_associado` | varchar | `"ATIVO"` | situação do associado pai |

#### Array `beneficios[]`

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_beneficio` | integer | `"2"` | **PK** |
| `descricao` | varchar | `"BENEFICIO HINOVA MAIS"` | nome do benefício |
| `situacao` | varchar | `"ATIVO"` | `ATIVO` \| `INATIVO` |

### Benefícios encontrados no associado de teste

| codigo_beneficio | descricao | situacao |
|-----------------|-----------|----------|
| 2 | BENEFICIO HINOVA MAIS | ATIVO |
| 7 | DESCONTO PAGUE MENOS | INATIVO |
| 8 | LECUPON | ATIVO |
| 5 | ODONTO FAMILIAR | INATIVO |
| 15 | TOP VIDA INDIVIDUAL | ATIVO |

### Alertas ETL

- ℹ️ Benefício é **independente de Produto** — são entidades distintas no SGA
- ⚠️ Não há endpoint de catálogo de benefícios disponíveis (`/listar/beneficio/*` retorna 404)
- ℹ️ Para ETL: percorrer todos os Beneficiários e chamar `GET /listar/beneficio-beneficiario/:codigo` para cada um

---

## ENTIDADE: Boleto

**Endpoint:** `POST /listar/boleto` com body `{"codigo_associado": "..."}`

### Campos

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_boleto` | integer | `"1962677"` | **PK** |
| `nosso_numero` | integer | `3338881` | número do banco |
| `codigo_associado` | integer | `"129087"` | FK → Associado |
| `codigo_situacao_boleto` | integer | `"1"` | 1=BAIXADO, 2=ABERTO, 999=EXCLUIDO |
| `descricao_situacao_boleto` | varchar | `"BAIXADO"` | denormalizado |
| `pago` | char(1) | `"Y"` | `Y` / `N` |
| `mes_referente` | varchar | `"01/2026"` | `MM/YYYY` |
| `referente` | varchar | `"Referente a: Mensalidade 01/2026"` | descrição textual |
| `data_emissao` | date | `"2026-01-24"` | |
| `data_vencimento_original` | date | `"2026-02-18"` | |
| `data_vencimento` | date | `"2026-02-18"` | pode ser prorrogada |
| `valor_boleto` | decimal (string) | `"369.32"` | ⚠️ vem como string |
| `data_pagamento` | date \| null | `"2026-02-18"` | |
| `valor_pagamento` | decimal | `369.32` | |
| `data_credito_banco` | date \| null | `"2026-02-18"` | |
| `tarifa_cobranca_banco` | decimal \| null | `0` | |
| `parcela_paga` | integer | `0` | |
| `qtde_parcela` | integer | `0` | |
| `codigo_tipo_boleto` | integer | `"5"` | 5=FECHAMENTO |
| `descricao_tipo_boleto` | varchar | `"FECHAMENTO"` | |
| `descricao_tipo_cobranca_recorrente` | varchar | `"BOLETO / CARNÊ"` | `codigo_*` não retorna |
| `codigo_mgfformapagamento` | integer | `"1"` | FK → MGF forma pagamento |
| `codigo_forma_pagamento` | integer \| null | `"2"` | FK |
| `descricao_forma_pagamento` | varchar \| null | `"BOLETO"` | |
| `descricao_tipo_baixa_boleto` | varchar \| null | `"BAIXA AUTOMATICA DE TITULO"` | |
| `codigo_conta` | integer | `"32"` | FK → conta bancária |
| `codigo_banco` | integer | `"756"` | FK → banco (756=BANCOOB, 2000=HINOVA PAY) |
| `nome_banco` | varchar | `"BANCO COOPERATIVO DO BRASIL S.A. - BANCOOB"` | denormalizado |
| `agencia` | varchar | `"3089"` | |
| `conta` | varchar | `"53287"` | |
| `codigo_regional` | integer | `"229"` | FK → Regional |
| `nome_regional_boleto` | varchar | `"ASSOCIACAO DE AUXILIO MUTUO TOP BRASIL CENTRO OESTE"` | denormalizado |
| `veiculo` | array(integer) | `["160283"]` | lista de `codigo_veiculo` cobertos |
| `beneficiario` | array(integer) | `[""]` | lista de `codigo_beneficiario` cobertos |
| *(dados do associado denormalizados)* | | — | nome, cpf, situacao, regional |

### Alertas ETL

- ⚠️ `valor_boleto` vem como **string decimal** — converter para numeric
- ⚠️ `veiculo` e `beneficiario` são **arrays** — relação N:N boleto↔veículo e boleto↔beneficiário
- ⚠️ Situação 999=EXCLUIDO (fora do padrão numérico sequencial)
- ⚠️ Dois bancos emissores identificados: BANCOOB (756) e HINOVA PAY (2000) — verificar se há mais
- ⚠️ Linha digitável / código de barras **não retorna** neste endpoint — verificar endpoint específico de emissão

---

## ENTIDADE: Consultor (= Voluntário no SGA)

**Endpoint:** `GET /listar/voluntario/ativo` — retorna todos sem paginação
**Volume:** 2.422 registros ativos

### Campos

| Campo SGA | Tipo | Exemplo | Obs |
|-----------|------|---------|-----|
| `codigo_voluntario` | integer | `"1"` | **PK** |
| `nome` | varchar | `"TOP BRASIL"` | |
| `cpf` | varchar(18) | `"21408664000164"` | CPF ou CNPJ |
| `data_nascimento` | datetime \| null | `null` | |
| `data_cadastro` | datetime | `"2021-06-24T00:00:00-0300"` | |
| `email` | varchar | `"giovani.laurentys@topprev.com.br"` | |
| `telefone` | varchar | `"(31)3395-3191"` | formatado `(DD)NNNN-NNNNN` |
| `telefone_comercial` | varchar | `"(31)"` | |
| `celular` | varchar | `"()"` | |
| `cep` | varchar(9) | `"32241-180"` | |
| `logradouro` | varchar | `""` | |
| `numero` | varchar | `"49"` | |
| `complemento` | varchar | `""` | |
| `bairro` | varchar | `""` | |
| `cidade` | varchar | `""` | |
| `estado` | char(2) | `""` | |
| `situacao` | varchar | `"ATIVO"` | `ATIVO` / `INATIVO` |
| `codigo_classificacao` | integer | `"1"` | FK → classificacao_voluntario (1=Não Informado) |
| `formato_pagamento` | varchar | `"R$"` | `R$` ou `%` — tipo de comissão |
| `valor_pagamento` | decimal | `0` | valor ou % de comissão |
| `formato_pagamento_residual` | varchar | `"R$"` | `R$` ou `%` |
| `valor_pagamento_residual` | decimal | `0` | |
| `obs` | varchar | `""` | observações livres |
| `cooperativas` | array | `[{"codigo_cooperativa":"1","nome_cooperativa":"TOP BRASIL","email_cooperativa":"top@topbrasil.com.br"}]` | → Equipe de Vendas no Núcleo; usar `cooperativas[0]` |

### Particularidade — cooperativas no SGA vs Núcleo

No SGA, o Voluntário retorna um array `cooperativas[]` com as equipes às quais está vinculado.

**Mapeamento de nomenclatura:**

| SGA | Núcleo |
|-----|--------|
| `cooperativa` | Equipe de Vendas |
| `regional` | Regional (usado para Tabela de Preço) |

No SGA o campo é N:N, mas no Núcleo um Consultor pertence a **apenas uma Equipe de Vendas**.

**Decisão:** relação 1:N — `consultor.equipe_vendas_id` (FK direta, sem junction table).
Na carga ETL, usar a primeira cooperativa do array como Equipe de Vendas do Consultor.

---

## Notas gerais da API

- Todas as datas retornam com timezone `-0300`
- Campos `codigo_*` retornam como `string` no `listar` e como `integer` no `buscar` — normalizar para integer
- Paginação: `quantidade_por_pagina` + `pagina` no body do POST
- Token expira — renovar via `POST /usuario/autenticar` quando necessário
