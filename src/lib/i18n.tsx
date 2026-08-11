import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "es" | "pt" | "fr";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "pt", label: "Português", flag: "PT" },
  { code: "fr", label: "Français", flag: "FR" },
];

export interface LegendItem {
  term: string;
  desc: string;
}

export interface ManualSection {
  heading: string;
  body: string;
  bullets: string[];
}

interface Dict {
  nav: Record<string, string>;
  ui: Record<string, string>;
  legends: Record<string, LegendItem[]>;
  manual: {
    title: string;
    description: string;
    intro: string;
    sections: ManualSection[];
  };
}

const en: Dict = {
  nav: {
    executive: "Executive Panel",
    supply: "Supply & Raw Materials",
    production: "Production",
    quality: "Quality & Positive Release",
    distribution: "Distribution & Sales",
    administration: "Administration",
    targets: "Target Configuration",
    users: "Users & Roles",
    manual: "Platform Manual",
  },
  ui: {
    platform: "DEMO Operations Intelligence",
    search: "Search line, product, batch, raw material or period…",
    signOut: "Sign out",
    collapse: "Collapse menu",
    language: "Language",
    legend: "Legend",
    legendTitle: "What is being measured?",
    legendSubtitle: "Definition of every metric shown on this dashboard.",
  },
  legends: {
    executive: [
      { term: "Production compliance (%)", desc: "Units produced divided by the production target for the month, across all lines. Above 100% means the plant exceeded plan." },
      { term: "Stock coverage (days)", desc: "Average number of days that current raw-material stock sustains consumption at the standard daily rate." },
      { term: "Sales capacity covered (%)", desc: "Actual sales volume against the commercial target for the period, aggregated over all channels." },
      { term: "Positive release (%)", desc: "Share of quality inspections closed as Approved — the batch is released to the market." },
      { term: "Consolidated trend", desc: "Six-month evolution of the three core indexes (production, quality, sales) on a common percentage scale." },
      { term: "Alerts", desc: "Recent deviations classified as OK, Warning or Critical by operational domain." },
    ],
    supply: [
      { term: "Current stock", desc: "Physical quantity available in the silo or warehouse at the moment of the reading." },
      { term: "Minimum stock", desc: "Safety threshold defined by planning; below this level supply risk becomes material." },
      { term: "Coverage (days)", desc: "Current stock divided by the standard daily consumption of the material." },
      { term: "Coverage target", desc: "Number of days of stock the company wants to keep for that material." },
      { term: "Status", desc: "Critical below 85% of minimum stock, Warning below 115%, OK above that." },
      { term: "Stock evolution", desc: "Monthly history of the level of each input, used to detect structural downward trends." },
    ],
    production: [
      { term: "Efficiency (%)", desc: "Produced quantity against the target of the line — the pack-to-melt performance of the furnace and forming machines." },
      { term: "Target vs. actual", desc: "Comparison between planned volume and produced volume per line for the selected period." },
      { term: "Downtime (min)", desc: "Accumulated minutes of unplanned or planned stoppage attributed to a cause." },
      { term: "Pareto of causes", desc: "Causes ordered by impact with a cumulative curve; the first causes reaching 80% concentrate the improvement effort." },
      { term: "Batch", desc: "Production run identified by line and date, with its produced quantity, target and status." },
    ],
    quality: [
      { term: "Defect rate (%)", desc: "Percentage of inspected pieces that fail the criteria of the inspection point." },
      { term: "Positive release", desc: "Approved result: the batch complies with dimensional, visual and laboratory specifications and can be shipped." },
      { term: "Conditional", desc: "The batch requires re-inspection, sorting or an engineering waiver before release." },
      { term: "Rejected", desc: "The batch does not comply and is sent back to cullet." },
      { term: "Process variable", desc: "Controlled parameter (gob temperature, mold cooling, lehr temperature, blank pressure) correlated against defect rate." },
      { term: "Correlation chart", desc: "Each point is one inspection; the slope of the cloud shows how strongly the variable drives defects." },
    ],
    distribution: [
      { term: "Available stock", desc: "Finished goods ready to be committed to customer orders in the period." },
      { term: "Projected demand", desc: "Volume the commercial forecast expects for the channel in the period." },
      { term: "Coverage gap", desc: "Difference between available stock and projected demand; negative values signal a service risk." },
      { term: "Target attainment (%)", desc: "Actual sales divided by the commercial target of the channel or region." },
      { term: "Channel / region", desc: "Commercial segmentation used to allocate volume and measure performance." },
    ],
    targets: [
      { term: "Raw-material target", desc: "Minimum stock and days of coverage required for each input." },
      { term: "Line target", desc: "Monthly volume and efficiency expected from each production line." },
      { term: "Channel target", desc: "Commercial volume committed per distribution channel and period." },
    ],
    users: [
      { term: "Administrator", desc: "Full access, including target configuration and user management." },
      { term: "Production Supervisor", desc: "Access to the executive panel, supply and production." },
      { term: "Quality Analyst", desc: "Access to the executive panel, quality and production." },
      { term: "Executive", desc: "Read-only access to every operational dashboard." },
    ],
  },
  manual: {
    title: "Platform Manual",
    description: "Detailed guide of every module, dataset and indicator of the platform.",
    intro:
      "This platform consolidates the operation of a glass container plant into five analytical dashboards plus an administration area. All the data shown is a representative demonstration dataset covering six months and three production lines; it is not connected to MES, SCADA or ERP systems.",
    sections: [
      {
        heading: "1. Access and roles",
        body: "Authentication is simulated: any credential is accepted and the role selected at login determines which modules are visible.",
        bullets: [
          "Administrator — every dashboard plus Target Configuration and Users & Roles.",
          "Production Supervisor — Executive Panel, Supply and Production.",
          "Quality Analyst — Executive Panel, Quality and Production.",
          "Executive — read-only access to all operational dashboards.",
        ],
      },
      {
        heading: "2. Global navigation",
        body: "The fixed header holds the platform name, the global search box and the user menu with the language selector and sign out.",
        bullets: [
          "Global search filters the active dashboard by line, product, batch, raw material or period.",
          "The side menu is collapsible and keeps the current module highlighted.",
          "The language selector switches the interface between English, Spanish, Portuguese and French.",
        ],
      },
      {
        heading: "3. Executive Panel",
        body: "Executive summary of the operation. Four KPI cards, a consolidated six-month trend and the list of recent deviations.",
        bullets: [
          "Production compliance: produced units / production target.",
          "Stock coverage: average days of raw-material stock available.",
          "Sales capacity covered: actual sales / commercial target.",
          "Positive release: share of inspections approved.",
        ],
      },
      {
        heading: "4. Supply & Raw Materials",
        body: "Controls the availability of the batch-house inputs: vitrifiers, fluxes, stabilizers, cullet, refining agents, colorants and packaging.",
        bullets: [
          "The table shows current stock, minimum stock, coverage in days, supplier and warehouse.",
          "Status is derived from the ratio between current and minimum stock (Critical < 85%, Warning < 115%, OK above).",
          "The evolution chart reveals structural consumption trends beyond the daily reading.",
          "Filters by warehouse, category and supplier feed the export exactly as shown on screen.",
        ],
      },
      {
        heading: "5. Production",
        body: "Measures how the furnace and forming lines convert plan into packed product.",
        bullets: [
          "Efficiency per line: produced quantity against the target of the line.",
          "Downtime Pareto: causes ordered by impact, to focus maintenance and changeover work.",
          "Batch table: produced quantity, target and status of every run in the period.",
        ],
      },
      {
        heading: "6. Quality & Positive Release",
        body: "Supports the positive release decision: a batch only ships when it complies with the inspection criteria.",
        bullets: [
          "Approval / rejection trend over time, by inspection point.",
          "Correlation chart between a selectable process variable and the defect rate.",
          "Results: Approved (release), Conditional (re-inspection or waiver) and Rejected (returned to cullet).",
        ],
      },
      {
        heading: "7. Distribution & Sales",
        body: "Connects finished-goods availability with commercial commitment.",
        bullets: [
          "Available stock versus projected demand per channel and period.",
          "Target attainment indicator per channel and region.",
          "Negative gaps between stock and demand anticipate service failures.",
        ],
      },
      {
        heading: "8. Administration",
        body: "Only visible to the Administrator role.",
        bullets: [
          "Target Configuration: minimum stock and coverage per material, volume and efficiency per line, commercial volume per channel.",
          "Users & Roles: assignment of the role that governs module visibility.",
        ],
      },
      {
        heading: "9. Reporting and export",
        body: "Every dashboard exports the currently visible data — with the filters and search applied — to Excel or PDF.",
        bullets: [
          "Excel: one sheet per table shown on screen.",
          "PDF: landscape report with header, filter summary and formatted tables.",
        ],
      },
      {
        heading: "10. Data model",
        body: "The demonstration dataset is deterministic, so figures stay stable between sessions.",
        bullets: [
          "RawMaterial: id, name, category, current stock, minimum stock, coverage target, supplier, warehouse.",
          "ProductionLine: id, name, plant. ProductionBatch: id, line, date, produced quantity, target, efficiency, downtime.",
          "QualityInspection: id, batch, inspection point, process variable, value, defect rate, result, date.",
          "SalesTarget: id, period, channel, region, target, actual, available stock, projected demand.",
          "User: id, name, email, role, status.",
        ],
      },
    ],
  },
};

const es: Dict = {
  nav: {
    executive: "Panel Ejecutivo",
    supply: "Abastecimiento y Materia Prima",
    production: "Producción",
    quality: "Calidad y Liberación Positiva",
    distribution: "Distribución y Ventas",
    administration: "Administración",
    targets: "Configuración de Metas",
    users: "Usuarios y Roles",
    manual: "Manual de la Plataforma",
  },
  ui: {
    platform: "DEMO Operations Intelligence",
    search: "Buscar línea, producto, lote, materia prima o período…",
    signOut: "Cerrar sesión",
    collapse: "Colapsar menú",
    language: "Idioma",
    legend: "Leyenda",
    legendTitle: "¿Qué se está midiendo?",
    legendSubtitle: "Definición de cada métrica mostrada en este dashboard.",
  },
  legends: {
    executive: [
      { term: "Cumplimiento de producción (%)", desc: "Unidades producidas sobre la meta de producción del mes, en todas las líneas. Por encima de 100% la planta superó el plan." },
      { term: "Cobertura de stock (días)", desc: "Días promedio que el stock actual de materia prima sostiene el consumo al ritmo diario estándar." },
      { term: "Capacidad de venta cubierta (%)", desc: "Venta real contra la meta comercial del período, agregada en todos los canales." },
      { term: "Liberación positiva (%)", desc: "Porcentaje de inspecciones cerradas como Aprobadas — el lote se libera al mercado." },
      { term: "Tendencia consolidada", desc: "Evolución de seis meses de los tres índices centrales (producción, calidad, ventas) en una escala porcentual común." },
      { term: "Alertas", desc: "Desviaciones recientes clasificadas como OK, Alerta o Crítico por dominio operativo." },
    ],
    supply: [
      { term: "Stock actual", desc: "Cantidad física disponible en silo o almacén al momento de la lectura." },
      { term: "Stock mínimo", desc: "Umbral de seguridad definido por planeación; por debajo el riesgo de desabasto es material." },
      { term: "Cobertura (días)", desc: "Stock actual dividido por el consumo diario estándar del material." },
      { term: "Meta de cobertura", desc: "Días de stock que la compañía desea mantener para ese material." },
      { term: "Estado", desc: "Crítico bajo 85% del stock mínimo, Alerta bajo 115%, OK por encima." },
      { term: "Evolución de stock", desc: "Histórico mensual del nivel de cada insumo, para detectar tendencias estructurales a la baja." },
    ],
    production: [
      { term: "Eficiencia (%)", desc: "Cantidad producida contra la meta de la línea — el rendimiento de horno y máquinas formadoras." },
      { term: "Meta vs. real", desc: "Comparación entre volumen planeado y volumen producido por línea en el período." },
      { term: "Tiempo muerto (min)", desc: "Minutos acumulados de paro planeado o no planeado atribuidos a una causa." },
      { term: "Pareto de causas", desc: "Causas ordenadas por impacto con curva acumulada; las primeras hasta 80% concentran el esfuerzo de mejora." },
      { term: "Lote", desc: "Corrida de producción identificada por línea y fecha, con cantidad producida, meta y estado." },
    ],
    quality: [
      { term: "Tasa de defecto (%)", desc: "Porcentaje de piezas inspeccionadas que no cumplen el criterio del punto de inspección." },
      { term: "Liberación positiva", desc: "Resultado aprobado: el lote cumple especificación dimensional, visual y de laboratorio y puede despacharse." },
      { term: "Condicional", desc: "El lote requiere reinspección, selección o concesión de ingeniería antes de liberarse." },
      { term: "Rechazado", desc: "El lote no cumple y se devuelve a casco (cullet)." },
      { term: "Variable de proceso", desc: "Parámetro controlado (temperatura de gota, enfriamiento de molde, temperatura de archa, presión de soplo) correlacionado contra la tasa de defecto." },
      { term: "Gráfico de correlación", desc: "Cada punto es una inspección; la pendiente de la nube muestra qué tanto la variable impulsa los defectos." },
    ],
    distribution: [
      { term: "Stock disponible", desc: "Producto terminado listo para comprometerse a pedidos de clientes en el período." },
      { term: "Demanda proyectada", desc: "Volumen que el pronóstico comercial espera para el canal en el período." },
      { term: "Brecha de cobertura", desc: "Diferencia entre stock disponible y demanda proyectada; valores negativos indican riesgo de servicio." },
      { term: "Cumplimiento de meta (%)", desc: "Venta real dividida por la meta comercial del canal o región." },
      { term: "Canal / región", desc: "Segmentación comercial usada para asignar volumen y medir desempeño." },
    ],
    targets: [
      { term: "Meta de materia prima", desc: "Stock mínimo y días de cobertura requeridos para cada insumo." },
      { term: "Meta de línea", desc: "Volumen mensual y eficiencia esperados de cada línea de producción." },
      { term: "Meta de canal", desc: "Volumen comercial comprometido por canal de distribución y período." },
    ],
    users: [
      { term: "Administrador", desc: "Acceso total, incluida configuración de metas y gestión de usuarios." },
      { term: "Supervisor de Producción", desc: "Acceso a panel ejecutivo, abastecimiento y producción." },
      { term: "Analista de Calidad", desc: "Acceso a panel ejecutivo, calidad y producción." },
      { term: "Ejecutivo", desc: "Acceso de solo lectura a todos los dashboards operativos." },
    ],
  },
  manual: {
    title: "Manual de la Plataforma",
    description: "Guía detallada de cada módulo, dato e indicador de la plataforma.",
    intro:
      "Esta plataforma consolida la operación de una planta de envases de vidrio en cinco dashboards analíticos más un área de administración. Todos los datos mostrados son un conjunto de demostración representativo de seis meses y tres líneas de producción; no hay conexión con sistemas MES, SCADA o ERP.",
    sections: [
      {
        heading: "1. Acceso y roles",
        body: "La autenticación es simulada: cualquier credencial es aceptada y el rol elegido al ingresar determina qué módulos son visibles.",
        bullets: [
          "Administrador — todos los dashboards más Configuración de Metas y Usuarios y Roles.",
          "Supervisor de Producción — Panel Ejecutivo, Abastecimiento y Producción.",
          "Analista de Calidad — Panel Ejecutivo, Calidad y Producción.",
          "Ejecutivo — acceso de solo lectura a todos los dashboards operativos.",
        ],
      },
      {
        heading: "2. Navegación global",
        body: "El header fijo contiene el nombre de la plataforma, el buscador global y el menú de usuario con el selector de idioma y el cierre de sesión.",
        bullets: [
          "El buscador global filtra el dashboard activo por línea, producto, lote, materia prima o período.",
          "El menú lateral es colapsable y resalta el módulo actual.",
          "El selector de idioma cambia la interfaz entre inglés, español, portugués y francés.",
        ],
      },
      {
        heading: "3. Panel Ejecutivo",
        body: "Resumen ejecutivo de la operación. Cuatro tarjetas KPI, una tendencia consolidada de seis meses y la lista de desviaciones recientes.",
        bullets: [
          "Cumplimiento de producción: unidades producidas / meta de producción.",
          "Cobertura de stock: días promedio de materia prima disponible.",
          "Capacidad de venta cubierta: venta real / meta comercial.",
          "Liberación positiva: porcentaje de inspecciones aprobadas.",
        ],
      },
      {
        heading: "4. Abastecimiento y Materia Prima",
        body: "Controla la disponibilidad de los insumos de la casa de mezclas: vitrificantes, fundentes, estabilizantes, casco, afinantes, colorantes y empaque.",
        bullets: [
          "La tabla muestra stock actual, stock mínimo, cobertura en días, proveedor y almacén.",
          "El estado se deriva de la relación entre stock actual y mínimo (Crítico < 85%, Alerta < 115%, OK por encima).",
          "El gráfico de evolución revela tendencias estructurales de consumo más allá de la lectura diaria.",
          "Los filtros por almacén, categoría y proveedor alimentan la exportación tal como se ve en pantalla.",
        ],
      },
      {
        heading: "5. Producción",
        body: "Mide cómo el horno y las líneas de formado convierten el plan en producto empacado.",
        bullets: [
          "Eficiencia por línea: cantidad producida contra la meta de la línea.",
          "Pareto de tiempos muertos: causas ordenadas por impacto, para enfocar mantenimiento y cambios de molde.",
          "Tabla de lotes: cantidad producida, meta y estado de cada corrida del período.",
        ],
      },
      {
        heading: "6. Calidad y Liberación Positiva",
        body: "Soporta la decisión de liberación positiva: un lote solo se despacha cuando cumple los criterios de inspección.",
        bullets: [
          "Tendencia de aprobación / rechazo en el tiempo, por punto de inspección.",
          "Gráfico de correlación entre una variable de proceso seleccionable y la tasa de defecto.",
          "Resultados: Aprobado (liberación), Condicional (reinspección o concesión) y Rechazado (retorno a casco).",
        ],
      },
      {
        heading: "7. Distribución y Ventas",
        body: "Conecta la disponibilidad de producto terminado con el compromiso comercial.",
        bullets: [
          "Stock disponible frente a demanda proyectada por canal y período.",
          "Indicador de cumplimiento de meta por canal y región.",
          "Las brechas negativas entre stock y demanda anticipan fallas de servicio.",
        ],
      },
      {
        heading: "8. Administración",
        body: "Visible únicamente para el rol Administrador.",
        bullets: [
          "Configuración de Metas: stock mínimo y cobertura por material, volumen y eficiencia por línea, volumen comercial por canal.",
          "Usuarios y Roles: asignación del rol que gobierna la visibilidad de módulos.",
        ],
      },
      {
        heading: "9. Reportes y exportación",
        body: "Cada dashboard exporta los datos visibles — con filtros y búsqueda aplicados — a Excel o PDF.",
        bullets: [
          "Excel: una hoja por cada tabla mostrada en pantalla.",
          "PDF: reporte horizontal con encabezado, resumen de filtros y tablas formateadas.",
        ],
      },
      {
        heading: "10. Modelo de datos",
        body: "El conjunto de demostración es determinístico, por lo que las cifras se mantienen estables entre sesiones.",
        bullets: [
          "RawMaterial: id, nombre, categoría, stock actual, stock mínimo, meta de cobertura, proveedor, almacén.",
          "ProductionLine: id, nombre, planta. ProductionBatch: id, línea, fecha, cantidad producida, meta, eficiencia, tiempo muerto.",
          "QualityInspection: id, lote, punto de inspección, variable de proceso, valor, tasa de defecto, resultado, fecha.",
          "SalesTarget: id, período, canal, región, meta, venta real, stock disponible, demanda proyectada.",
          "User: id, nombre, email, rol, estado.",
        ],
      },
    ],
  },
};

const pt: Dict = {
  nav: {
    executive: "Painel Executivo",
    supply: "Suprimentos e Matéria-Prima",
    production: "Produção",
    quality: "Qualidade e Liberação Positiva",
    distribution: "Distribuição e Vendas",
    administration: "Administração",
    targets: "Configuração de Metas",
    users: "Usuários e Perfis",
    manual: "Manual da Plataforma",
  },
  ui: {
    platform: "DEMO Operations Intelligence",
    search: "Buscar linha, produto, lote, matéria-prima ou período…",
    signOut: "Sair",
    collapse: "Recolher menu",
    language: "Idioma",
    legend: "Legenda",
    legendTitle: "O que está sendo medido?",
    legendSubtitle: "Definição de cada métrica exibida neste dashboard.",
  },
  legends: {
    executive: [
      { term: "Cumprimento de produção (%)", desc: "Unidades produzidas sobre a meta de produção do mês, em todas as linhas. Acima de 100% a planta superou o plano." },
      { term: "Cobertura de estoque (dias)", desc: "Dias médios que o estoque atual de matéria-prima sustenta o consumo no ritmo diário padrão." },
      { term: "Capacidade de venda coberta (%)", desc: "Venda real contra a meta comercial do período, agregada em todos os canais." },
      { term: "Liberação positiva (%)", desc: "Percentual de inspeções encerradas como Aprovadas — o lote é liberado ao mercado." },
      { term: "Tendência consolidada", desc: "Evolução de seis meses dos três índices centrais (produção, qualidade, vendas) em escala percentual comum." },
      { term: "Alertas", desc: "Desvios recentes classificados como OK, Alerta ou Crítico por domínio operacional." },
    ],
    supply: [
      { term: "Estoque atual", desc: "Quantidade física disponível no silo ou armazém no momento da leitura." },
      { term: "Estoque mínimo", desc: "Limite de segurança definido pelo planejamento; abaixo dele o risco de desabastecimento é material." },
      { term: "Cobertura (dias)", desc: "Estoque atual dividido pelo consumo diário padrão do material." },
      { term: "Meta de cobertura", desc: "Dias de estoque que a empresa deseja manter para o material." },
      { term: "Status", desc: "Crítico abaixo de 85% do estoque mínimo, Alerta abaixo de 115%, OK acima." },
      { term: "Evolução de estoque", desc: "Histórico mensal do nível de cada insumo, para detectar tendências estruturais de queda." },
    ],
    production: [
      { term: "Eficiência (%)", desc: "Quantidade produzida contra a meta da linha — o rendimento do forno e das máquinas de moldagem." },
      { term: "Meta vs. real", desc: "Comparação entre volume planejado e volume produzido por linha no período." },
      { term: "Tempo parado (min)", desc: "Minutos acumulados de parada planejada ou não planejada atribuídos a uma causa." },
      { term: "Pareto de causas", desc: "Causas ordenadas por impacto com curva acumulada; as primeiras até 80% concentram o esforço de melhoria." },
      { term: "Lote", desc: "Corrida de produção identificada por linha e data, com quantidade produzida, meta e status." },
    ],
    quality: [
      { term: "Taxa de defeito (%)", desc: "Percentual de peças inspecionadas que não atendem ao critério do ponto de inspeção." },
      { term: "Liberação positiva", desc: "Resultado aprovado: o lote atende à especificação dimensional, visual e laboratorial e pode ser expedido." },
      { term: "Condicional", desc: "O lote exige reinspeção, seleção ou concessão de engenharia antes da liberação." },
      { term: "Rejeitado", desc: "O lote não atende e retorna para caco (cullet)." },
      { term: "Variável de processo", desc: "Parâmetro controlado (temperatura da gota, resfriamento do molde, temperatura do túnel de recozimento, pressão de sopro) correlacionado à taxa de defeito." },
      { term: "Gráfico de correlação", desc: "Cada ponto é uma inspeção; a inclinação da nuvem mostra o quanto a variável impulsiona os defeitos." },
    ],
    distribution: [
      { term: "Estoque disponível", desc: "Produto acabado pronto para ser comprometido com pedidos no período." },
      { term: "Demanda projetada", desc: "Volume que a previsão comercial espera para o canal no período." },
      { term: "Lacuna de cobertura", desc: "Diferença entre estoque disponível e demanda projetada; valores negativos indicam risco de atendimento." },
      { term: "Atingimento de meta (%)", desc: "Venda real dividida pela meta comercial do canal ou região." },
      { term: "Canal / região", desc: "Segmentação comercial usada para alocar volume e medir desempenho." },
    ],
    targets: [
      { term: "Meta de matéria-prima", desc: "Estoque mínimo e dias de cobertura exigidos para cada insumo." },
      { term: "Meta de linha", desc: "Volume mensal e eficiência esperados de cada linha de produção." },
      { term: "Meta de canal", desc: "Volume comercial comprometido por canal de distribuição e período." },
    ],
    users: [
      { term: "Administrador", desc: "Acesso total, incluindo configuração de metas e gestão de usuários." },
      { term: "Supervisor de Produção", desc: "Acesso ao painel executivo, suprimentos e produção." },
      { term: "Analista de Qualidade", desc: "Acesso ao painel executivo, qualidade e produção." },
      { term: "Executivo", desc: "Acesso somente leitura a todos os dashboards operacionais." },
    ],
  },
  manual: {
    title: "Manual da Plataforma",
    description: "Guia detalhado de cada módulo, dado e indicador da plataforma.",
    intro:
      "Esta plataforma consolida a operação de uma fábrica de embalagens de vidro em cinco dashboards analíticos mais uma área de administração. Todos os dados exibidos são um conjunto de demonstração representativo de seis meses e três linhas de produção; não há conexão com sistemas MES, SCADA ou ERP.",
    sections: [
      {
        heading: "1. Acesso e perfis",
        body: "A autenticação é simulada: qualquer credencial é aceita e o perfil escolhido no login determina quais módulos ficam visíveis.",
        bullets: [
          "Administrador — todos os dashboards mais Configuração de Metas e Usuários e Perfis.",
          "Supervisor de Produção — Painel Executivo, Suprimentos e Produção.",
          "Analista de Qualidade — Painel Executivo, Qualidade e Produção.",
          "Executivo — acesso somente leitura a todos os dashboards operacionais.",
        ],
      },
      {
        heading: "2. Navegação global",
        body: "O header fixo contém o nome da plataforma, a busca global e o menu de usuário com o seletor de idioma e a saída.",
        bullets: [
          "A busca global filtra o dashboard ativo por linha, produto, lote, matéria-prima ou período.",
          "O menu lateral é recolhível e destaca o módulo atual.",
          "O seletor de idioma alterna a interface entre inglês, espanhol, português e francês.",
        ],
      },
      {
        heading: "3. Painel Executivo",
        body: "Resumo executivo da operação. Quatro cartões de KPI, uma tendência consolidada de seis meses e a lista de desvios recentes.",
        bullets: [
          "Cumprimento de produção: unidades produzidas / meta de produção.",
          "Cobertura de estoque: dias médios de matéria-prima disponível.",
          "Capacidade de venda coberta: venda real / meta comercial.",
          "Liberação positiva: percentual de inspeções aprovadas.",
        ],
      },
      {
        heading: "4. Suprimentos e Matéria-Prima",
        body: "Controla a disponibilidade dos insumos da casa de mistura: vitrificantes, fundentes, estabilizantes, caco, afinantes, corantes e embalagem.",
        bullets: [
          "A tabela mostra estoque atual, estoque mínimo, cobertura em dias, fornecedor e armazém.",
          "O status deriva da relação entre estoque atual e mínimo (Crítico < 85%, Alerta < 115%, OK acima).",
          "O gráfico de evolução revela tendências estruturais de consumo além da leitura diária.",
          "Os filtros por armazém, categoria e fornecedor alimentam a exportação como exibido na tela.",
        ],
      },
      {
        heading: "5. Produção",
        body: "Mede como o forno e as linhas de moldagem convertem o plano em produto embalado.",
        bullets: [
          "Eficiência por linha: quantidade produzida contra a meta da linha.",
          "Pareto de tempos parados: causas ordenadas por impacto, para focar manutenção e trocas de molde.",
          "Tabela de lotes: quantidade produzida, meta e status de cada corrida do período.",
        ],
      },
      {
        heading: "6. Qualidade e Liberação Positiva",
        body: "Sustenta a decisão de liberação positiva: um lote só é expedido quando atende aos critérios de inspeção.",
        bullets: [
          "Tendência de aprovação / rejeição ao longo do tempo, por ponto de inspeção.",
          "Gráfico de correlação entre uma variável de processo selecionável e a taxa de defeito.",
          "Resultados: Aprovado (liberação), Condicional (reinspeção ou concessão) e Rejeitado (retorno a caco).",
        ],
      },
      {
        heading: "7. Distribuição e Vendas",
        body: "Conecta a disponibilidade de produto acabado ao compromisso comercial.",
        bullets: [
          "Estoque disponível frente à demanda projetada por canal e período.",
          "Indicador de atingimento de meta por canal e região.",
          "Lacunas negativas entre estoque e demanda antecipam falhas de atendimento.",
        ],
      },
      {
        heading: "8. Administração",
        body: "Visível apenas para o perfil Administrador.",
        bullets: [
          "Configuração de Metas: estoque mínimo e cobertura por material, volume e eficiência por linha, volume comercial por canal.",
          "Usuários e Perfis: atribuição do perfil que governa a visibilidade dos módulos.",
        ],
      },
      {
        heading: "9. Relatórios e exportação",
        body: "Cada dashboard exporta os dados visíveis — com filtros e busca aplicados — para Excel ou PDF.",
        bullets: [
          "Excel: uma aba para cada tabela exibida na tela.",
          "PDF: relatório em paisagem com cabeçalho, resumo de filtros e tabelas formatadas.",
        ],
      },
      {
        heading: "10. Modelo de dados",
        body: "O conjunto de demonstração é determinístico, portanto os números permanecem estáveis entre sessões.",
        bullets: [
          "RawMaterial: id, nome, categoria, estoque atual, estoque mínimo, meta de cobertura, fornecedor, armazém.",
          "ProductionLine: id, nome, planta. ProductionBatch: id, linha, data, quantidade produzida, meta, eficiência, tempo parado.",
          "QualityInspection: id, lote, ponto de inspeção, variável de processo, valor, taxa de defeito, resultado, data.",
          "SalesTarget: id, período, canal, região, meta, venda real, estoque disponível, demanda projetada.",
          "User: id, nome, email, perfil, status.",
        ],
      },
    ],
  },
};

const fr: Dict = {
  nav: {
    executive: "Panneau Exécutif",
    supply: "Approvisionnement et Matières Premières",
    production: "Production",
    quality: "Qualité et Libération Positive",
    distribution: "Distribution et Ventes",
    administration: "Administration",
    targets: "Configuration des Objectifs",
    users: "Utilisateurs et Rôles",
    manual: "Manuel de la Plateforme",
  },
  ui: {
    platform: "DEMO Operations Intelligence",
    search: "Rechercher ligne, produit, lot, matière première ou période…",
    signOut: "Se déconnecter",
    collapse: "Réduire le menu",
    language: "Langue",
    legend: "Légende",
    legendTitle: "Que mesure-t-on ?",
    legendSubtitle: "Définition de chaque indicateur affiché sur ce tableau de bord.",
  },
  legends: {
    executive: [
      { term: "Taux de réalisation production (%)", desc: "Unités produites rapportées à l'objectif de production du mois, toutes lignes confondues. Au-dessus de 100%, l'usine dépasse le plan." },
      { term: "Couverture de stock (jours)", desc: "Nombre moyen de jours pendant lesquels le stock actuel de matières premières soutient la consommation au rythme journalier standard." },
      { term: "Capacité de vente couverte (%)", desc: "Ventes réelles par rapport à l'objectif commercial de la période, tous canaux confondus." },
      { term: "Libération positive (%)", desc: "Part des inspections closes comme Approuvées — le lot est libéré au marché." },
      { term: "Tendance consolidée", desc: "Évolution sur six mois des trois indices clés (production, qualité, ventes) sur une échelle en pourcentage commune." },
      { term: "Alertes", desc: "Écarts récents classés OK, Alerte ou Critique par domaine opérationnel." },
    ],
    supply: [
      { term: "Stock actuel", desc: "Quantité physique disponible en silo ou en entrepôt au moment du relevé." },
      { term: "Stock minimum", desc: "Seuil de sécurité défini par la planification ; en dessous, le risque d'approvisionnement devient significatif." },
      { term: "Couverture (jours)", desc: "Stock actuel divisé par la consommation journalière standard de la matière." },
      { term: "Objectif de couverture", desc: "Nombre de jours de stock que l'entreprise souhaite conserver pour cette matière." },
      { term: "Statut", desc: "Critique sous 85% du stock minimum, Alerte sous 115%, OK au-delà." },
      { term: "Évolution du stock", desc: "Historique mensuel du niveau de chaque intrant, pour détecter des tendances structurelles à la baisse." },
    ],
    production: [
      { term: "Efficacité (%)", desc: "Quantité produite par rapport à l'objectif de la ligne — le rendement du four et des machines de formage." },
      { term: "Objectif vs. réel", desc: "Comparaison entre volume planifié et volume produit par ligne sur la période." },
      { term: "Temps d'arrêt (min)", desc: "Minutes cumulées d'arrêt planifié ou non planifié attribuées à une cause." },
      { term: "Pareto des causes", desc: "Causes classées par impact avec courbe cumulée ; les premières atteignant 80% concentrent l'effort d'amélioration." },
      { term: "Lot", desc: "Campagne de production identifiée par ligne et date, avec quantité produite, objectif et statut." },
    ],
    quality: [
      { term: "Taux de défaut (%)", desc: "Pourcentage de pièces inspectées ne respectant pas le critère du point d'inspection." },
      { term: "Libération positive", desc: "Résultat approuvé : le lot respecte les spécifications dimensionnelles, visuelles et de laboratoire et peut être expédié." },
      { term: "Conditionnel", desc: "Le lot exige une nouvelle inspection, un tri ou une dérogation d'ingénierie avant libération." },
      { term: "Rejeté", desc: "Le lot est non conforme et retourne au calcin." },
      { term: "Variable de procédé", desc: "Paramètre contrôlé (température de paraison, refroidissement du moule, température d'arche, pression de soufflage) corrélé au taux de défaut." },
      { term: "Graphique de corrélation", desc: "Chaque point est une inspection ; la pente du nuage montre l'influence de la variable sur les défauts." },
    ],
    distribution: [
      { term: "Stock disponible", desc: "Produits finis prêts à être engagés sur des commandes clients dans la période." },
      { term: "Demande prévisionnelle", desc: "Volume attendu par la prévision commerciale pour le canal sur la période." },
      { term: "Écart de couverture", desc: "Différence entre stock disponible et demande prévisionnelle ; les valeurs négatives signalent un risque de service." },
      { term: "Atteinte de l'objectif (%)", desc: "Ventes réelles divisées par l'objectif commercial du canal ou de la région." },
      { term: "Canal / région", desc: "Segmentation commerciale utilisée pour allouer le volume et mesurer la performance." },
    ],
    targets: [
      { term: "Objectif matière première", desc: "Stock minimum et jours de couverture requis pour chaque intrant." },
      { term: "Objectif de ligne", desc: "Volume mensuel et efficacité attendus de chaque ligne de production." },
      { term: "Objectif de canal", desc: "Volume commercial engagé par canal de distribution et par période." },
    ],
    users: [
      { term: "Administrateur", desc: "Accès complet, y compris la configuration des objectifs et la gestion des utilisateurs." },
      { term: "Superviseur de Production", desc: "Accès au panneau exécutif, à l'approvisionnement et à la production." },
      { term: "Analyste Qualité", desc: "Accès au panneau exécutif, à la qualité et à la production." },
      { term: "Exécutif", desc: "Accès en lecture seule à tous les tableaux de bord opérationnels." },
    ],
  },
  manual: {
    title: "Manuel de la Plateforme",
    description: "Guide détaillé de chaque module, donnée et indicateur de la plateforme.",
    intro:
      "Cette plateforme consolide l'exploitation d'une usine d'emballages en verre en cinq tableaux de bord analytiques ainsi qu'un espace d'administration. Toutes les données affichées constituent un jeu de démonstration représentatif de six mois et trois lignes de production ; aucune connexion à des systèmes MES, SCADA ou ERP.",
    sections: [
      {
        heading: "1. Accès et rôles",
        body: "L'authentification est simulée : toute identification est acceptée et le rôle choisi à la connexion détermine les modules visibles.",
        bullets: [
          "Administrateur — tous les tableaux de bord plus Configuration des Objectifs et Utilisateurs et Rôles.",
          "Superviseur de Production — Panneau Exécutif, Approvisionnement et Production.",
          "Analyste Qualité — Panneau Exécutif, Qualité et Production.",
          "Exécutif — accès en lecture seule à tous les tableaux de bord opérationnels.",
        ],
      },
      {
        heading: "2. Navigation globale",
        body: "L'en-tête fixe contient le nom de la plateforme, la recherche globale et le menu utilisateur avec le sélecteur de langue et la déconnexion.",
        bullets: [
          "La recherche globale filtre le tableau de bord actif par ligne, produit, lot, matière première ou période.",
          "Le menu latéral est réductible et met en évidence le module courant.",
          "Le sélecteur de langue bascule l'interface entre anglais, espagnol, portugais et français.",
        ],
      },
      {
        heading: "3. Panneau Exécutif",
        body: "Synthèse exécutive de l'exploitation. Quatre cartes KPI, une tendance consolidée sur six mois et la liste des écarts récents.",
        bullets: [
          "Réalisation production : unités produites / objectif de production.",
          "Couverture de stock : jours moyens de matières premières disponibles.",
          "Capacité de vente couverte : ventes réelles / objectif commercial.",
          "Libération positive : part des inspections approuvées.",
        ],
      },
      {
        heading: "4. Approvisionnement et Matières Premières",
        body: "Contrôle la disponibilité des intrants du parc à matières : vitrifiants, fondants, stabilisants, calcin, affinants, colorants et emballage.",
        bullets: [
          "Le tableau montre stock actuel, stock minimum, couverture en jours, fournisseur et entrepôt.",
          "Le statut découle du rapport entre stock actuel et minimum (Critique < 85%, Alerte < 115%, OK au-delà).",
          "Le graphique d'évolution révèle des tendances structurelles de consommation au-delà du relevé quotidien.",
          "Les filtres par entrepôt, catégorie et fournisseur alimentent l'export tel qu'affiché à l'écran.",
        ],
      },
      {
        heading: "5. Production",
        body: "Mesure la façon dont le four et les lignes de formage convertissent le plan en produit emballé.",
        bullets: [
          "Efficacité par ligne : quantité produite par rapport à l'objectif de la ligne.",
          "Pareto des temps d'arrêt : causes classées par impact, pour cibler maintenance et changements de moule.",
          "Tableau des lots : quantité produite, objectif et statut de chaque campagne de la période.",
        ],
      },
      {
        heading: "6. Qualité et Libération Positive",
        body: "Soutient la décision de libération positive : un lot n'est expédié que s'il respecte les critères d'inspection.",
        bullets: [
          "Tendance d'approbation / rejet dans le temps, par point d'inspection.",
          "Graphique de corrélation entre une variable de procédé sélectionnable et le taux de défaut.",
          "Résultats : Approuvé (libération), Conditionnel (nouvelle inspection ou dérogation) et Rejeté (retour au calcin).",
        ],
      },
      {
        heading: "7. Distribution et Ventes",
        body: "Relie la disponibilité des produits finis à l'engagement commercial.",
        bullets: [
          "Stock disponible face à la demande prévisionnelle par canal et période.",
          "Indicateur d'atteinte de l'objectif par canal et région.",
          "Les écarts négatifs entre stock et demande anticipent les défauts de service.",
        ],
      },
      {
        heading: "8. Administration",
        body: "Visible uniquement pour le rôle Administrateur.",
        bullets: [
          "Configuration des Objectifs : stock minimum et couverture par matière, volume et efficacité par ligne, volume commercial par canal.",
          "Utilisateurs et Rôles : attribution du rôle qui gouverne la visibilité des modules.",
        ],
      },
      {
        heading: "9. Rapports et export",
        body: "Chaque tableau de bord exporte les données visibles — filtres et recherche appliqués — vers Excel ou PDF.",
        bullets: [
          "Excel : une feuille par tableau affiché à l'écran.",
          "PDF : rapport paysage avec en-tête, résumé des filtres et tableaux formatés.",
        ],
      },
      {
        heading: "10. Modèle de données",
        body: "Le jeu de démonstration est déterministe : les chiffres restent stables d'une session à l'autre.",
        bullets: [
          "RawMaterial : id, nom, catégorie, stock actuel, stock minimum, objectif de couverture, fournisseur, entrepôt.",
          "ProductionLine : id, nom, usine. ProductionBatch : id, ligne, date, quantité produite, objectif, efficacité, temps d'arrêt.",
          "QualityInspection : id, lot, point d'inspection, variable de procédé, valeur, taux de défaut, résultat, date.",
          "SalesTarget : id, période, canal, région, objectif, ventes réelles, stock disponible, demande prévisionnelle.",
          "User : id, nom, email, rôle, statut.",
        ],
      },
    ],
  },
};

const DICTS: Record<Lang, Dict> = { en, es, pt, fr };

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  d: Dict;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);
const LANG_KEY = "demo.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY) as Lang | null;
      if (stored && DICTS[stored]) setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const d = DICTS[lang];
    const t = (path: string) => {
      const [group, key] = path.split(".");
      const section = (d as unknown as Record<string, Record<string, string>>)[group ?? ""];
      return section?.[key ?? ""] ?? path;
    };
    return { lang, setLang, d, t };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
