const sys = (id, name, vendor) => ({ id, name, vendor, modules: [] });

export const defaultSectorsRegistry = [
  { id: "sec-associado",    name: "Associado" },
  { id: "sec-atend",        name: "Atendimento ao Associado" },
  { id: "sec-assist",       name: "Assistência 24h" },
  { id: "sec-consultores",  name: "Atendimento aos Consultores" },
  { id: "sec-comercial",    name: "Comercial" },
  { id: "sec-cadastro",     name: "Cadastro" },
  { id: "sec-posvendas",    name: "Pós-Vendas" },
  { id: "sec-cancelamento", name: "Cancelamento" },
  { id: "sec-boletos",      name: "Boletos" },
  { id: "sec-cob-int",      name: "Cobrança Interna" },
  { id: "sec-cob-ext",      name: "Cobrança Extrajudicial" },
  { id: "sec-juridico",     name: "Jurídico" },
  { id: "sec-eventos",      name: "Eventos" },
  { id: "sec-rastreadores", name: "Rastreadores" },
  { id: "sec-financeiro",   name: "Financeiro" },
  { id: "sec-cs",           name: "CS" },
  { id: "sec-rh",           name: "RH" },
  { id: "sec-compras",      name: "Compras" },
  { id: "sec-marketing",    name: "Marketing" },
  { id: "sec-ti",           name: "TI" },
];

export const initialData = {
  header: {
    version: "// Blueprint — v2.0",
    title: "Ecossistema de",
    titleHighlight: "Proteção Veicular",
    date: "Mar 2026",
    status: "● Em mapeamento",
  },
  footer: {
    note: "v2.0 — Organizado por sistema e módulo",
    nextStep: "→ próximo: roadmap e prioridades",
  },
  sectorsRegistry: defaultSectorsRegistry,
  layers: [
    {
      id: "l3",
      number: "CAMADA 3",
      title: "Experiência — Acesso externo por associados",
      desc: "Interfaces externas",
      type: "l3",
      systems: [
        sys("sys-app", "App Associado", "Próprio"),
      ],
    },
    {
      id: "l2",
      number: "CAMADA 2",
      title: "Operacional — Processos internos organizados por sistema",
      desc: "Ferramentas internas",
      type: "l2",
      systems: [
        sys("sys-ezchat",    "ezchat",    "ezchat"),
        sys("sys-sga",       "SGA",       "Hinova"),
        sys("sys-webassist", "WebAssist", "Infonet"),
        sys("sys-powercrm",  "Power CRM", "Hinova"),
        sys("sys-visto",     "Visto",     "Hinova"),
        sys("sys-siga",      "SIGA",      "Arco"),
        sys("sys-cilia",     "Cilia",     "Cilia"),
        sys("sys-sgr",       "SGR",       "Hinova"),
        sys("sys-logica",    "Lógica",    "Hinova"),
        sys("sys-mgf",       "MGF",       "Hinova"),
      ],
    },
    {
      id: "l1",
      number: "CAMADA 1",
      title: "Núcleo de Dados — Hub central de integração",
      desc: "Fonte única da verdade",
      type: "l1",
      isHub: true,
      hub: {
        hierarchy: [
          { id: "h1", label: "👤 Consultor",              indent: 0 },
          { id: "h2", label: "↳ 👥 Associado",            indent: 1 },
          { id: "h3", label: "↳ 🚗 Veículo",              indent: 2 },
          { id: "h4", label: "↳ ⚙️ Serviço",              indent: 3 },
          { id: "h5", label: "↳ 🧑‍🤝‍🧑 Beneficiário",        indent: 2 },
          { id: "h6", label: "↳ 🎁 Benefício",            indent: 3 },
          { id: "h7", label: "↳ 💰 Boleto",               indent: 2 },
          { id: "h8", label: "↳ 🏦 Bancos",               indent: 3 },
        ],
        name: "Data Hub Próprio",
        subtitle: "// a construir",
        features: [
          { id: "f1", label: "→ Base central do associado" },
          { id: "f2", label: "→ Integração entre sistemas" },
          { id: "f3", label: "→ Relatórios e indicadores" },
          { id: "f4", label: "→ API Gateway" },
          { id: "f5", label: "→ Autenticação e acessos" },
        ],
      },
    },
  ],
};

export function migrateData(data) {
  if (!data) return initialData;

  let result = { ...data };

  // ── Legacy: very old format with {name, vendor} inline systems and no systemsRegistry
  if (!result.systemsRegistry && result.layers?.some(l => l.sectors?.some(s => s.systems?.some(e => e.name)))) {
    // Already fully inline but inside sectors — handled below in the sectors→systems step
  }

  // ── Legacy: has systemsRegistry (FK-based) → resolve names inline, then remove registry
  if (result.systemsRegistry) {
    const sysReg = result.systemsRegistry;

    // Handle old sectors format first (steps inherited from v1 migration)
    // Step 1: build systemsRegistry from very old embedded format
    result.layers = result.layers?.map((layer) => ({
      ...layer,
      sectors: layer.sectors?.map((sector) => {
        if (sector.systemIds !== undefined) {
          return {
            ...sector,
            systems: (sector.systemIds || []).map((id) => ({ id, devStatus: sector.devStatus ?? null })),
            systemIds: undefined,
            devStatus: undefined,
          };
        }
        return sector;
      }),
    }));

    // Step 2: ensure functionIds on all sector system entries
    result.layers = result.layers?.map((layer) => ({
      ...layer,
      sectors: layer.sectors?.map((sector) => ({
        ...sector,
        systems: (sector.systems || []).map((s) =>
          s.functionIds !== undefined ? s : { ...s, functionIds: [] }
        ),
      })),
    }));

    // Step 3: rename functions → modules in registry
    result.systemsRegistry = sysReg.map((s) =>
      s.modules !== undefined ? s : { ...s, modules: s.functions || [], functions: undefined }
    );

    // Step 4: build sectorsRegistry from old sectors
    if (!result.sectorsRegistry) {
      const seen = new Map();
      result.layers?.forEach((layer) => {
        layer.sectors?.forEach((sector) => {
          if (!seen.has(sector.id)) seen.set(sector.id, { id: sector.id, name: sector.name });
        });
      });
      result.sectorsRegistry = seen.size > 0 ? Array.from(seen.values()) : defaultSectorsRegistry;
    }

    // Step 5: convert sectors → systems in layers
    result.layers = result.layers?.map((layer) => {
      if (layer.isHub || !layer.sectors) return layer;
      const order = [];
      const seen = new Set();
      layer.sectors.forEach((sector) => {
        (sector.systems || []).forEach((e) => {
          if (!seen.has(e.id)) { seen.add(e.id); order.push(e.id); }
        });
      });
      const { sectors, ...rest } = layer;
      return { ...rest, systems: order.map((id) => ({ id, modules: [] })) };
    });

    // Step 6: resolve FK names → inline
    const reg = result.systemsRegistry;
    result.layers = result.layers?.map((layer) => {
      if (!layer.systems) return layer;
      return {
        ...layer,
        systems: layer.systems.map((sysEntry) => {
          if (sysEntry.name !== undefined) return sysEntry;
          const regEntry = reg.find((r) => r.id === sysEntry.id);
          return {
            ...sysEntry,
            name: regEntry?.name || sysEntry.id,
            vendor: regEntry?.vendor || "",
            modules: (sysEntry.modules || []).map((mod) => {
              if (mod.name !== undefined) return mod;
              const modDef = (regEntry?.modules || []).find((m) => m.id === mod.moduleId);
              return { ...mod, name: modDef?.name || "" };
            }),
          };
        }),
      };
    });

    // Remove old registry
    const { systemsRegistry, ...rest } = result;
    result = rest;
  }

  // ── Ensure sectorsRegistry
  if (!result.sectorsRegistry) {
    result.sectorsRegistry = defaultSectorsRegistry;
  }

  // ── Ensure modules array on all layer system entries
  result.layers = result.layers?.map((layer) => ({
    ...layer,
    systems: layer.systems?.map((s) => ({
      ...s,
      name: s.name ?? "",
      vendor: s.vendor ?? "",
      modules: (s.modules || []).map((m) => ({
        ...m,
        name: m.name ?? "",
        sectorIds: m.sectorIds ?? [],
        devStatus: m.devStatus ?? null,
      })),
    })),
  }));

  return result;
}
