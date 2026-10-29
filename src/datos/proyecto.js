// Fuente única de datos del sitio. Todo sale del «Informe ejecutivo: Parte 3, Implementación 1»
// (octubre de 2026). Lo único que no viene del informe es el bloque `simulador`, marcado como ficticio.

export const meta = {
  titulo: 'Red inteligente para la distribución de donaciones en Cali',
  subtitulo: 'Informe ejecutivo: contexto, perfil del proyecto y hoja de ruta técnica',
  proyecto: 'Proyecto transversal, parte 3: implementación 1',
  curso: 'Introducción a la Ingeniería de Datos e Inteligencia Artificial',
  docentes: ['Darío Recalde', 'Sandra Mosquera'],
  institucion: 'Universidad Autónoma de Occidente',
  unidad: 'Unidad Académica de Ciencias y Diseño en Ingeniería',
  ods: 'ODS 11: Ciudades y comunidades sostenibles',
  fecha: 'Octubre de 2026',
  coordenadas: { lat: '3°27′ N', lon: '76°32′ O' },
};

export const resumen = [
  'En Cali, las donaciones que se movilizan durante inundaciones, desplazamientos y otras crisis no siempre llegan a los sectores que más las necesitan, porque nadie cuenta con información centralizada que cruce lo que se dona con lo que realmente falta. El resultado es acumulación en unos sectores, desperdicio de alimentos perecederos y retrasos en la atención de población vulnerable.',
  'Este informe propone diseñar un prototipo de sistema de datos, construido con herramientas gratuitas (Excel y Google Sheets), que registre la oferta de donaciones, recoja las necesidades por comuna y aplique un algoritmo de puntaje para recomendar a qué sector enviar cada lote. El proyecto se ejecutará en 16 semanas, organizado en cinco etapas y 14 actividades con responsables y precedencias definidas, y contribuye a las metas 11.5 y 11.b del ODS 11.',
];

export const equipo = [
  { iniciales: 'SL', nombre: 'Sebastian Ledesma', rol: 'Investigación' },
  { iniciales: 'MN', nombre: 'Miguel Ángel Noreña', rol: 'Recolección de datos' },
  { iniciales: 'SN', nombre: 'Sebastian Nempeque', rol: 'Análisis de datos' },
  { iniciales: 'JL', nombre: 'Juan Esteban Luna', rol: 'Diseño del prototipo y presentación' },
];

// 1.1 Diagnóstico inicial
export const diagnostico = {
  contexto:
    'Durante emergencias en Cali, ciudadanos, empresas y fundaciones movilizan grandes volúmenes de alimentos, agua, productos de aseo y artículos de primera necesidad. Organizaciones como el Banco de Alimentos y la Cruz Roja coordinan buena parte de esta labor, pero el registro y la priorización dependen aún de procesos manuales: listas en papel, hojas de cálculo y mensajería instantánea.',
  metodo:
    'La indagación del equipo (revisión de fuentes secundarias, conversaciones con líderes comunitarios y voluntarios, observación de procesos y encuesta a sectores) permitió identificar cuatro patrones:',
  patrones: [
    {
      clave: 'fuente',
      titulo: 'No existe una fuente única de información',
      detalle: 'Cada organización registra sus datos sin cruzarlos con los de las demás.',
    },
    {
      clave: 'urgencia',
      titulo: 'La urgencia varía por tipo de producto',
      detalle: 'Agua y productos de aseo son las categorías con déficit reportado con más frecuencia.',
    },
    {
      clave: 'manual',
      titulo: 'Los procesos manuales generan errores y demoras',
      detalle: 'WhatsApp y listas en papel dificultan mantener la información al día.',
    },
    {
      clave: 'intuicion',
      titulo: 'La priorización es intuitiva, no basada en datos',
      detalle: 'Depende de la experiencia de los líderes, sin un criterio común y objetivo.',
    },
  ],
};

// 1.2 Problema central, causas y efectos
export const arbol = {
  problema:
    'Las donaciones en Cali no siempre llegan a los sectores que más las necesitan, debido a la falta de información centralizada sobre la oferta y la demanda de ayuda humanitaria.',
  problemaCorto: 'Falta de información centralizada entre oferta y demanda',
  causas: [
    'Falta de un canal centralizado para registrar donaciones disponibles',
    'Ausencia de información actualizada sobre necesidades por sector',
    'Poca comunicación entre organizaciones donantes y comunidades',
    'Procesos manuales (listas, WhatsApp) propensos a error',
  ],
  efectos: [
    'Acumulación de donaciones en algunos sectores',
    'Desperdicio de alimentos perecederos',
    'Desconfianza hacia las organizaciones donantes',
    'Retrasos en la atención a población vulnerable',
  ],
};

// 1.3 Factores que influyen en el problema
export const factores = [
  {
    clave: 'legal',
    dimension: 'Legal',
    descripcion:
      'La Ley 1523 de 2012 organiza la gestión del riesgo de desastres y la Ley 1581 de 2012 regula el tratamiento de datos personales; ambas condicionan el manejo de la ayuda y de la información recolectada.',
    normas: ['Ley 1523 de 2012', 'Ley 1581 de 2012'],
  },
  {
    clave: 'ambiental',
    dimension: 'Ambiental',
    descripcion:
      'Desperdicio de alimentos perecederos por mala distribución y huella de transporte de la logística de reparto.',
  },
  {
    clave: 'social',
    dimension: 'Social',
    descripcion:
      'Desconfianza institucional, desigualdad en el acceso a la ayuda y necesidad de coordinación entre comunidades y donantes.',
  },
  {
    clave: 'economico',
    dimension: 'Económico',
    descripcion:
      'Recursos limitados de las fundaciones, costos de transporte y almacenamiento, y bajo presupuesto para tecnología.',
  },
];

// 1.4 Pregunta reto de ingeniería
export const preguntaReto =
  '¿Cómo diseñar un prototipo de sistema de datos que registre y cruce la oferta de donaciones con las necesidades reales de los sectores de Cali, para recomendar una distribución más eficiente durante crisis humanitarias?';

// 1.5 Alineación con metas de impacto global
export const ods = {
  numero: 11,
  nombre: 'Ciudades y comunidades sostenibles',
  metas: [
    {
      codigo: '11.5',
      tipo: 'principal',
      texto:
        'Reducir el número de personas afectadas por desastres y las pérdidas asociadas, con especial atención a la población pobre y vulnerable.',
      aporte: 'El prototipo busca que la ayuda llegue primero y de forma más justa a quienes más la necesitan.',
    },
    {
      codigo: '11.b',
      tipo: 'principal',
      texto: 'Fortalecer la gestión integral del riesgo de desastres.',
      aporte: 'El sistema aporta datos y un criterio objetivo de priorización para la respuesta local.',
    },
    {
      codigo: '12.3',
      tipo: 'complementaria',
      ods: 'ODS 12',
      texto: 'Reducir la pérdida de alimentos.',
      aporte: 'Reasignar a tiempo los perecederos antes de su vencimiento.',
    },
  ],
};

// 1.6 Benchmarking
export const referentes = {
  soluciones: [
    {
      nombre: 'Elsah',
      hace: 'Apoya la logística institucional de agencias humanitarias.',
      falta: 'No cruza la oferta ciudadana con necesidades por sector.',
    },
    {
      nombre: 'Ayúdame Colombia',
      hace: 'Muestra en un mapa dónde hay necesidad.',
      falta: 'Funciona como reporte abierto, sin priorización basada en datos.',
    },
    {
      nombre: 'Donorbox y Givebutter',
      hace: 'Plataformas de recaudación que administran dinero.',
      falta: 'No gestionan donaciones en especie.',
    },
  ],
  brecha:
    'Ninguna combina, con herramientas gratuitas, el registro de donaciones por sector con un criterio objetivo de priorización según el déficit real.',
};

// 2.1 Selección de la solución
export const seleccion = {
  introduccion:
    'A partir del árbol del problema, el equipo generó alternativas y escogió las tres mejores. Para decidir el podio se discutieron criterios técnicos (viabilidad con herramientas gratuitas, complejidad frente a la experiencia del equipo y tiempo disponible) y sociales (impacto sobre la equidad en la entrega, contribución a la confianza y utilidad para líderes comunitarios).',
  ideas: [
    { id: 1, nombre: 'Base de donaciones', nombreLargo: 'Base de datos centralizada de donaciones' },
    { id: 2, nombre: 'Registro de necesidades', nombreLargo: 'Registro de necesidades por sector' },
    { id: 3, nombre: 'Algoritmo de cruce', nombreLargo: 'Algoritmo de cruce oferta-demanda' },
  ],
  criterios: [
    { criterio: 'Impacto directo sobre el problema central', tipo: 'Social', puntajes: [3, 3, 5] },
    { criterio: 'Aporte a la equidad y la confianza', tipo: 'Social', puntajes: [3, 4, 5] },
    { criterio: 'Viabilidad con herramientas gratuitas', tipo: 'Técnico', puntajes: [5, 4, 4] },
    { criterio: 'Cumplimiento en un semestre', tipo: 'Técnico', puntajes: [5, 4, 3] },
    { criterio: 'Respuesta a la pregunta de ingeniería', tipo: 'Técnico', puntajes: [3, 3, 5] },
  ],
  totales: [19, 18, 22],
  maximo: 25,
  nota: 'Valoración propuesta del equipo en escala de 1 (bajo) a 5 (alto). Fuente: elaboración propia.',
  podio: [
    { puesto: '1.er', idea: 3, justificacion: 'Convierte los datos en decisiones; ataca la acumulación y el desperdicio.' },
    { puesto: '2.º', idea: 1, justificacion: 'Alimenta el algoritmo con la oferta (tipo, cantidad, vencimiento y ubicación).' },
    { puesto: '3.er', idea: 2, justificacion: 'Alimenta el algoritmo con la demanda real de cada comuna (formulario o WhatsApp).' },
  ],
  integracion:
    'Como el algoritmo necesita las otras dos ideas como fuente de datos, el prototipo integrará las tres, con la idea 3 como núcleo del sistema.',
};

// 2.2 Ficha del proyecto
export const ficha = {
  problema:
    'Las donaciones no llegan a los sectores que más las necesitan por falta de información centralizada entre oferta y demanda.',
  objetivoGeneral:
    'Diseñar un prototipo de sistema de datos que registre y cruce la oferta de donaciones con las necesidades de los sectores de Cali, para recomendar una distribución más eficiente en crisis humanitarias.',
  metas: [
    { cifra: 12, unidad: 'semana', texto: 'Prototipo funcional en Excel/Google Sheets en la semana 12.' },
    { cifra: 5, unidad: 'comunas', texto: 'Cobertura de al menos 5 comunas de Cali.' },
    { cifra: 40, unidad: 'registros', texto: 'Al menos 40 registros de prueba (oferta y demanda).' },
    { cifra: 3, unidad: 'usuarios', texto: 'Validación con al menos 3 usuarios (líderes comunitarios o voluntarios).' },
  ],
  metaPuntaje: 'Un puntaje de priorización calculado automáticamente para cada sector y tipo de donación.',
  ubicacion:
    'Cali, Valle del Cauca: comunas vulnerables afectadas por inundaciones, desplazamiento o crisis social. El desarrollo se hace de forma remota y en la Universidad Autónoma de Occidente.',
  metodologia:
    'Design Thinking (empatizar, definir e idear ya realizados; ahora prototipar y probar), con gestión por cinco etapas y entregables.',
  fasesDesignThinking: [
    { fase: 'Empatizar', estado: 'hecho' },
    { fase: 'Definir', estado: 'hecho' },
    { fase: 'Idear', estado: 'hecho' },
    { fase: 'Prototipar', estado: 'actual' },
    { fase: 'Probar', estado: 'actual' },
  ],
  cronograma: '16 semanas (un semestre académico).',
  beneficiarios: {
    directos: 'Habitantes de comunas vulnerables y líderes comunitarios como María Camila, nuestro perfil de usuario.',
    indirectos: 'Fundaciones, Banco de Alimentos, Cruz Roja y donantes.',
  },
  presupuesto: 'Aproximadamente COP 308.000 en efectivo, más el aporte en horas del equipo.',
};

// 2.3 Funcionamiento del núcleo del sistema
export const formula = {
  descripcion:
    'Cada donación y cada necesidad reciben un puntaje según urgencia, cercanía, déficit y fecha de vencimiento. El sistema empareja los puntajes más compatibles y sugiere a qué sector enviar cada lote. La versión inicial usará reglas simples en hojas de cálculo, sin inteligencia artificial compleja.',
  nota: 'Los pesos son valores iniciales de partida y se calibrarán con datos de prueba en la actividad A10. Cada variable se normaliza en una escala de 0 a 1.',
  variables: [
    { clave: 'urgencia', nombre: 'Urgencia', peso: 0.35, ayuda: 'Qué tan grave es la necesidad reportada en el sector.' },
    { clave: 'deficit', nombre: 'Déficit', peso: 0.3, ayuda: 'Cuánto le falta al sector de ese tipo de producto.' },
    { clave: 'cercania', nombre: 'Cercanía', peso: 0.2, ayuda: 'Qué tan cerca está el sector del punto donde está el lote.' },
    { clave: 'vencimiento', nombre: 'Vencimiento', peso: 0.15, ayuda: 'Qué tan pronto vence el lote y si el sector puede usarlo a tiempo.' },
  ],
};

// Datos FICTICIOS para el simulador del sitio. No vienen del informe ni son mediciones reales:
// solo muestran cómo se comporta la regla de puntaje. Escala 0 a 1.
export const simulador = {
  ficticio: true,
  aviso:
    'Datos de prueba ficticios. Sirven para mostrar cómo funciona la regla; no son mediciones reales de las comunas.',
  comunas: [
    { id: 'c13', nombre: 'Comuna 13', urgencia: 0.8, cercania: 0.55 },
    { id: 'c15', nombre: 'Comuna 15', urgencia: 0.9, cercania: 0.4 },
    { id: 'c18', nombre: 'Comuna 18', urgencia: 0.65, cercania: 0.7 },
    { id: 'c20', nombre: 'Comuna 20', urgencia: 0.7, cercania: 0.85 },
    { id: 'c21', nombre: 'Comuna 21', urgencia: 0.95, cercania: 0.25 },
  ],
  lotes: [
    {
      id: 'agua',
      nombre: 'Agua potable',
      detalle: '400 litros, sin vencimiento cercano',
      deficit: { c13: 0.6, c15: 0.85, c18: 0.4, c20: 0.75, c21: 0.9 },
      vencimiento: { c13: 0.1, c15: 0.1, c18: 0.1, c20: 0.1, c21: 0.1 },
    },
    {
      id: 'aseo',
      nombre: 'Kits de aseo',
      detalle: '150 unidades, sin vencimiento cercano',
      deficit: { c13: 0.8, c15: 0.5, c18: 0.7, c20: 0.35, c21: 0.65 },
      vencimiento: { c13: 0.1, c15: 0.1, c18: 0.1, c20: 0.1, c21: 0.1 },
    },
    {
      id: 'perecederos',
      nombre: 'Alimentos perecederos',
      detalle: 'Vencen en 4 días',
      deficit: { c13: 0.55, c15: 0.7, c18: 0.8, c20: 0.6, c21: 0.75 },
      vencimiento: { c13: 0.7, c15: 0.55, c18: 0.8, c20: 0.95, c21: 0.35 },
    },
  ],
};

// Calcula el puntaje de un lote para cada comuna con los pesos dados (se normalizan para que sumen 1).
export function calcularPuntajes(lote, pesos = pesosIniciales()) {
  const suma = Object.values(pesos).reduce((a, b) => a + b, 0) || 1;
  const p = Object.fromEntries(Object.entries(pesos).map(([k, v]) => [k, v / suma]));
  return simulador.comunas
    .map((c) => {
      const valores = {
        urgencia: c.urgencia,
        deficit: lote.deficit[c.id],
        cercania: c.cercania,
        vencimiento: lote.vencimiento[c.id],
      };
      const aportes = Object.fromEntries(Object.keys(valores).map((k) => [k, valores[k] * p[k]]));
      const puntaje = Object.values(aportes).reduce((a, b) => a + b, 0);
      return { ...c, valores, aportes, puntaje };
    })
    .sort((a, b) => b.puntaje - a.puntaje);
}

export function pesosIniciales() {
  return Object.fromEntries(formula.variables.map((v) => [v.clave, v.peso]));
}

// 2.4 Presupuesto estimado
export const presupuesto = {
  rubros: [
    { rubro: 'Software', detalle: 'Excel, Google Sheets y Google Forms (herramientas gratuitas)', valor: 0 },
    { rubro: 'Transporte y visitas', detalle: 'Desplazamientos para reunirse con fundaciones y líderes', valor: 120000 },
    { rubro: 'Materiales e impresión', detalle: 'Encuestas, manual de uso y presentación', valor: 60000 },
    { rubro: 'Conectividad', detalle: 'Datos móviles para comunicación y trabajo de campo', valor: 100000 },
    { rubro: 'Imprevistos (10 %)', detalle: 'Reserva sobre los rubros anteriores', valor: 28000 },
  ],
  total: 308000,
  especie: {
    integrantes: 4,
    semanas: 16,
    horasSemana: 6,
    horas: 384,
    texto: '4 integrantes × 16 semanas × 6 h/semana ≈ 384 horas de trabajo',
  },
  nota: 'Valores estimados por el equipo, sujetos a ajuste. Fuente: elaboración propia.',
};

// 2.5 Restricciones y alcance
export const alcance = {
  restricciones: [
    { titulo: 'Tiempo', texto: 'El prototipo debe desarrollarse dentro de un semestre académico.' },
    { titulo: 'Equipo y herramientas', texto: 'Cuatro estudiantes de primer semestre, con recursos exclusivamente gratuitos.' },
    {
      titulo: 'Datos',
      texto:
        'No hay acceso a datos reales masivos; la calidad depende de la disposición de fundaciones y comunidades a compartirlos, y su tratamiento debe respetar la Ley 1581 de 2012.',
    },
  ],
  fueraDeAlcance: [
    'Integración con los sistemas reales de las fundaciones',
    'Procesamiento de datos masivos',
    'Aplicación móvil o web en producción',
  ],
};

// 3. Gestión y hoja de ruta técnica
export const objetivoGeneralRuta =
  'Diseñar un prototipo de sistema de datos que centralice la información de oferta y demanda de ayuda humanitaria en Cali, cruzando las donaciones disponibles con las necesidades de cada sector, para que las donaciones lleguen a quienes más las necesitan.';

// 3.1 Matriz de alineación
export const objetivosEspecificos = [
  {
    codigo: 'OE1',
    objetivo: 'Definir las variables y el modelo de datos de oferta y demanda, junto con la regla de puntaje.',
    resultado: 'Documento de requerimientos, modelo de datos y fórmula de puntaje',
    actividades: ['A1', 'A2', 'A3', 'A4'],
    responsables: ['SL', 'SN'],
  },
  {
    codigo: 'OE2',
    objetivo: 'Registrar las donaciones disponibles por tipo, cantidad, vencimiento y ubicación.',
    resultado: 'Hoja de registro de donaciones',
    actividades: ['A5'],
    responsables: ['JL'],
  },
  {
    codigo: 'OE3',
    objetivo: 'Recoger las necesidades reportadas por comuna y su nivel de urgencia.',
    resultado: 'Formulario y hoja de necesidades, con datos de prueba',
    actividades: ['A6', 'A7'],
    responsables: ['JL', 'MN'],
  },
  {
    codigo: 'OE4',
    objetivo: 'Programar un algoritmo que cruce oferta y demanda y recomiende la distribución.',
    resultado: 'Módulo de cruce con ranking de prioridad calibrado',
    actividades: ['A8', 'A10'],
    responsables: ['SN'],
  },
  {
    codigo: 'OE5',
    objetivo: 'Visualizar los sectores con mayor déficit mediante gráficos accesibles.',
    resultado: 'Panel de gráficos de déficit',
    actividades: ['A9'],
    responsables: ['JL'],
  },
  {
    codigo: 'OE6',
    objetivo: 'Validar el prototipo con usuarios y documentar su uso.',
    resultado: 'Informe de validación, manual de uso y sustentación',
    actividades: ['A11', 'A12', 'A13', 'A14'],
    responsables: ['Todos'],
  },
];

// 3.2 Metodología y etapas
export const metodologiaEtapas =
  'El trabajo sigue la lógica de Design Thinking. Las fases de empatizar, definir e idear ya se completaron en los avances anteriores; la ejecución se concentra en prototipar y probar, organizada en cinco etapas secuenciales, cada una cerrada con un entregable.';

export const etapas = [
  {
    codigo: 'E1',
    nombre: 'Planeación y requerimientos',
    nombreCorto: 'Planeación',
    semanas: [1, 3],
    descripcion: 'Se consolida el diagnóstico, se definen las variables y se gestiona el acceso a datos con las organizaciones.',
    actividades: ['A1', 'A2', 'A3'],
    entregable: 'Documento de requerimientos y variables',
  },
  {
    codigo: 'E2',
    nombre: 'Diseño de datos y algoritmo',
    nombreCorto: 'Diseño',
    semanas: [4, 5],
    descripcion: 'Se define el modelo de datos y la regla de puntaje.',
    actividades: ['A4'],
    entregable: 'Modelo de datos y fórmula de puntaje',
  },
  {
    codigo: 'E3',
    nombre: 'Construcción del prototipo',
    nombreCorto: 'Construcción',
    semanas: [6, 12],
    descripcion:
      'Se construyen las hojas de donaciones y necesidades, el algoritmo, el panel de gráficos y se calibran los pesos.',
    actividades: ['A5', 'A6', 'A7', 'A8', 'A9', 'A10'],
    entregable: 'Prototipo funcional en Excel/Sheets',
  },
  {
    codigo: 'E4',
    nombre: 'Pruebas y validación',
    nombreCorto: 'Pruebas',
    semanas: [13, 14],
    descripcion: 'Se prueba con usuarios reales, se ajusta y se verifica el cumplimiento de la Ley 1581 y la accesibilidad.',
    actividades: ['A11', 'A12'],
    entregable: 'Informe de validación',
  },
  {
    codigo: 'E5',
    nombre: 'Cierre y sustentación',
    nombreCorto: 'Cierre',
    semanas: [14, 16],
    descripcion: 'Se entrega la documentación final, el manual y la sustentación.',
    actividades: ['A13', 'A14'],
    entregable: 'Informe final, manual y presentación',
  },
];

// 3.3 Cronograma (Gantt). `semanas` = [primera, última], leídas del sombreado del informe.
export const actividades = [
  { id: 'A1', nombre: 'Consolidar diagnóstico y requerimientos', corto: 'Consolidar diagnóstico y requerimientos', responsables: ['SL'], precede: [], semanas: [1, 2], etapa: 'E1' },
  { id: 'A2', nombre: 'Definir variables de oferta y demanda', corto: 'Definir variables de oferta y demanda', responsables: ['SN'], precede: ['A1'], semanas: [2, 3], etapa: 'E1' },
  { id: 'A3', nombre: 'Contactar fundaciones y líderes; acordar acceso a datos', corto: 'Contactar fundaciones y líderes', responsables: ['MN'], precede: [], semanas: [1, 3], etapa: 'E1' },
  { id: 'A4', nombre: 'Diseñar modelo de datos y regla de puntaje', corto: 'Diseñar modelo de datos y regla de puntaje', responsables: ['SN', 'JL'], precede: ['A2', 'A3'], semanas: [4, 5], etapa: 'E2' },
  { id: 'A5', nombre: 'Construir hoja de registro de donaciones', corto: 'Hoja de donaciones', responsables: ['JL'], precede: ['A4'], semanas: [6, 7], etapa: 'E3' },
  { id: 'A6', nombre: 'Construir registro de necesidades por sector (Forms + hoja)', corto: 'Registro de necesidades (Forms + hoja)', responsables: ['JL', 'MN'], precede: ['A4'], semanas: [6, 8], etapa: 'E3' },
  { id: 'A7', nombre: 'Recolectar datos de prueba por comuna', corto: 'Recolección de datos de prueba', responsables: ['MN'], precede: ['A3', 'A4'], semanas: [6, 9], etapa: 'E3' },
  { id: 'A8', nombre: 'Programar algoritmo de cruce oferta-demanda', corto: 'Algoritmo de cruce', responsables: ['SN'], precede: ['A5', 'A6'], semanas: [8, 10], etapa: 'E3' },
  { id: 'A9', nombre: 'Elaborar panel de gráficos de déficit', corto: 'Panel de gráficos de déficit', responsables: ['JL'], precede: ['A8'], semanas: [11, 12], etapa: 'E3' },
  { id: 'A10', nombre: 'Calibrar pesos del algoritmo con datos de prueba', corto: 'Calibración del algoritmo', responsables: ['SN', 'MN'], precede: ['A7', 'A8'], semanas: [11, 12], etapa: 'E3' },
  { id: 'A11', nombre: 'Realizar pruebas con usuarios y ajustes', corto: 'Pruebas con usuarios y ajustes', responsables: ['Todos'], precede: ['A9', 'A10'], semanas: [13, 14], etapa: 'E4' },
  { id: 'A12', nombre: 'Verificar cumplimiento Ley 1581 y accesibilidad', corto: 'Verificar Ley 1581 y accesibilidad', responsables: ['SL'], precede: ['A9'], semanas: [13, 14], etapa: 'E4' },
  { id: 'A13', nombre: 'Elaborar documentación final y manual de uso', corto: 'Documentación final y manual', responsables: ['SL', 'JL'], precede: ['A11'], semanas: [14, 15], etapa: 'E5' },
  { id: 'A14', nombre: 'Preparar y realizar la sustentación', corto: 'Preparar y realizar sustentación', responsables: ['Todos'], precede: ['A12', 'A13'], semanas: [15, 16], etapa: 'E5' },
];

export const totalSemanas = 16;

// Actividades de una persona (las marcadas «Todos» cuentan para cada integrante).
export function actividadesDe(iniciales) {
  return actividades.filter((a) => a.responsables.includes(iniciales) || a.responsables.includes('Todos'));
}

// 4. Referencias (formato APA del informe)
export const referencias = [
  {
    texto:
      'Congreso de la República de Colombia. (2012a). Ley 1523 de 2012, por la cual se adopta la política nacional de gestión del riesgo de desastres y se establece el Sistema Nacional de Gestión del Riesgo de Desastres. Función Pública.',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=47141',
  },
  {
    texto:
      'Congreso de la República de Colombia. (2012b). Ley 1581 de 2012, por la cual se dictan disposiciones generales para la protección de datos personales.',
  },
  { texto: 'Cruz Roja Colombiana, Seccional Valle del Cauca. (s. f.). Sitio web oficial.', url: 'https://cruzrojavalle.org.co/' },
  {
    texto: 'Fundación Arquidiocesana Banco de Alimentos Cali. (s. f.). ¿Quiénes somos?',
    url: 'https://www.bancodealimentoscali.org/quienes-somos/',
  },
  {
    texto: 'Organización de las Naciones Unidas. (s. f.). Objetivos de desarrollo sostenible.',
    url: 'https://www.un.org/sustainabledevelopment/es/objetivos-de-desarrollo-sostenible/',
  },
];
