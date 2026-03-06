# Plano de Ação — Processamento de Boletos

## Contexto

Simulação do processamento de boletos mensais com base nos dados do SGA (Hinova),
usando `valor_fixo` por veículo como valor de cobrança neste primeiro momento.

**Decisão de valor:** `valor_boleto = Σ veiculo.valor_fixo` (veículos ativos do associado)

---

## Dados disponíveis no SGA

| Campo (endpoint veículo)          | Uso no processamento                         |
|-----------------------------------|----------------------------------------------|
| `valor_fixo`                      | Valor da parcela mensal por veículo          |
| `dia_vencimento`                  | Dia do vencimento do boleto                  |
| `codigo_situacao`                 | Filtro: só veículos ativos                   |
| `forma_pagamento_protecao`        | Filtro: só associados que pagam por boleto   |
| `codigo_veiculo`                  | Chave de rastreabilidade                     |
| `nosso_numero` (endpoint boleto)  | Reconciliação bancária (boletos existentes)  |

---

## Fluxo de processamento (v1 — dev)

```
[SGA API]
    │
    ├─ GET /associados
    │       └─ Filtrar: forma_pagamento = boleto
    │
    └─ GET /veiculos?associado={id}
            └─ Filtrar: codigo_situacao = ativo
                    │
                    ▼
            Σ valor_fixo por associado
                    │
                    ▼
            Gerar registro interno
            [boletos_processados]
                    │
                    ▼
            ⏳ Integração bancária (fase futura)
```

---

## Modelo de dados — tabela `boletos_gerados`

```sql
CREATE TABLE boletos_gerados (
  id                  serial PRIMARY KEY,
  associado_id        int         NOT NULL,   -- FK → associados
  competencia         date        NOT NULL,   -- mês de referência (ex: 2026-02-01)
  data_vencimento     date        NOT NULL,   -- dia_vencimento + competencia
  valor               numeric(10,2) NOT NULL, -- Σ valor_fixo veículos ativos
  veiculos_ids        int[]       NOT NULL,   -- array dos codigo_veiculo incluídos
  status              text        NOT NULL    -- 'pendente' | 'enviado' | 'pago' | 'cancelado'
    CHECK (status IN ('pendente','enviado','pago','cancelado')),
  nosso_numero        text        NULL,       -- preenchido pela integração bancária
  linha_digitavel     text        NULL,       -- preenchido pela integração bancária
  data_processamento  timestamptz NOT NULL DEFAULT now(),
  origem              text        NOT NULL DEFAULT 'sistema',  -- 'sistema' | 'importacao_sga'
  observacao          text        NULL
);
```

---

## Plano de ação — passos

### Passo 1 — Importação e mapeamento do SGA
**Status:** ⬜ Pendente

- [ ] Definir stack de desenvolvimento (linguagem, framework, banco)
- [ ] Autenticar na API SGA e listar endpoints disponíveis
- [ ] Listar associados e identificar campo de filtro de forma de pagamento
- [ ] Confirmar os valores de `codigo_situacao` para veículo ativo
- [ ] Confirmar os valores de `forma_pagamento_protecao` para boleto

**Entregável:** script de extração que retorna: `associado_id`, `valor_total`, `dia_vencimento`

---

### Passo 2 — Cálculo e geração de registros
**Status:** ⬜ Pendente

- [ ] Implementar lógica de soma de `valor_fixo` por associado
- [ ] Calcular `data_vencimento` a partir de `dia_vencimento` + mês de competência
- [ ] Tratar edge cases:
  - Associado sem veículo ativo → **não gerar boleto**
  - `valor_fixo = 0` → **alertar, não gerar**
  - Múltiplos veículos com `dia_vencimento` diferente → **usar o menor (ou regra a definir)**
- [ ] Inserir registros em `boletos_gerados` com status `pendente`

**Entregável:** tabela populada com boletos do mês calculados

---

### Passo 3 — Validação cruzada com SGA
**Status:** ⬜ Pendente

- [ ] Importar boletos existentes do SGA (`importacao_sga`) para comparação
- [ ] Comparar valor calculado vs valor histórico SGA por associado
- [ ] Gerar relatório de divergências: quem está fora do esperado e por quê
- [ ] Identificar casos onde boleto SGA existe mas sistema não geraria (e vice-versa)

**Entregável:** relatório de divergências com taxa de aderência (meta: >95%)

---

### Passo 4 — Interface de conferência
**Status:** ⬜ Pendente

- [ ] Tela de listagem de boletos gerados (filtro por competência, status, associado)
- [ ] Tela de detalhe: composição do valor (quais veículos, qual valor_fixo de cada)
- [ ] Ação manual: cancelar / reprocessar boleto individual
- [ ] Indicadores: total gerado, valor total, % pagos, inadimplência

**Entregável:** tela funcional de gestão dos boletos gerados

---

### Passo 5 — Integração bancária ⚠ bloqueado
**Status:** ⬜ Bloqueado — depende de escolha do banco/provider

- [ ] Definir banco/provider (substituir HINOVA PAY)
- [ ] Implementar geração de `nosso_numero`
- [ ] Geração de código de barras e linha digitável
- [ ] Webhook de retorno bancário (pagamento, baixa)
- [ ] Reconciliação automática (atualizar status `pendente` → `pago`)

**Entregável:** ciclo completo de boleto bancário funcionando

---

## Limitações conhecidas (v1)

| Limitação                    | Impacto                             | Solução futura                  |
|------------------------------|-------------------------------------|---------------------------------|
| Valor = `valor_fixo` bruto   | Sem desconto, acréscimo, pro-rata   | Mapeamento do Plano             |
| Sem geração bancária real    | Boleto não é enviável ao associado  | Passo 5 — integração bancária   |
| Sem cobrança por Benefício   | Benefícios com cobrança separada ignorados | Mapeamento Benefício↔Plano |
| `dia_vencimento` por veículo | Pode variar entre veículos do mesmo associado | Regra de negócio a definir |

---

## Referências

- [campos-sga-v2.html](campos-sga-v2.html) — mapeamento de campos do SGA
- [arquitetura.md](arquitetura.md) — decisões arquiteturais (Consultor→Associado)
- [blueprint.html](blueprint.html) — mapa do ecossistema
- [roadmap.html](roadmap.html) — plano de execução 3 meses
