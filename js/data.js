/* ============================================================
   Sensia — Programa día a día
   Base científica y psicológica del contenido:
   - Desensibilización dopaminérgica por estímulos supranormales
     (pornografía de alta novedad) y su relación con el TDAH.
   - Sensate focus (Masters & Johnson) para reducir la ansiedad
     de desempeño y recuperar la sensación táctil.
   - "Spectatoring" (auto-observación durante el sexo) como causa
     de pérdida de erección y desconexión: se trata con mindfulness.
   - Urge surfing (Marlatt) para gestionar impulsos sin ceder.
   - Interocepción, respiración, sueño, ejercicio y luz para
     regular la dopamina basal.
   El contenido es educativo y de autoayuda; no sustituye a un
   profesional (sexólogo, terapeuta, médico).
   ============================================================ */

const PHASES = [
  {
    id: 1, name: 'Reinicio y conciencia', range: [1, 10], color: '#7c3aed',
    goal: 'Entender tus disparadores, bajar la sobreestimulación y empezar a observarte sin juicio.',
    intro: 'El cerebro con TDAH busca picos de dopamina. La pornografía y la masturbación compulsiva son "estímulos supranormales": entregan más recompensa que cualquier experiencia real, y con el tiempo tu sistema se desensibiliza. La primera fase no es de fuerza de voluntad, sino de observación: ver el patrón antes de cambiarlo.'
  },
  {
    id: 2, name: 'Recableado', range: [11, 28], color: '#6d28d9',
    goal: 'Reducir/eliminar la pornografía, resensibilizar y entrenar la atención al cuerpo.',
    intro: 'Sin el estímulo artificial, los receptores de dopamina empiezan a regularse al alza. Aquí construyes tolerancia a la calma y entrenas la interocepción: la capacidad de notar tu propio cuerpo. Es la base para volver a sentir.'
  },
  {
    id: 3, name: 'Reconexión sensorial', range: [29, 49], color: '#db2777',
    goal: 'Aplicar sensate focus (solo y con tu pareja) y salir del "modo espectador".',
    intro: 'El sensate focus, desarrollado por Masters y Johnson, elimina la presión de "rendir". Tocas y te dejas tocar sin meta sexual, poniendo toda la atención en la textura, la temperatura y la presión. Así se desactiva el spectatoring: esa voz que te observa y te hace perder la erección.'
  },
  {
    id: 4, name: 'Integración y maestría', range: [50, 90], color: '#e11d48',
    goal: 'Llevar la sensibilidad al encuentro íntimo completo y sostener el hábito.',
    intro: 'Ya no persigues la excitación: la recibes. En esta fase integras todo —respiración, presencia, comunicación— en la intimidad real, y construyes un plan de prevención de recaídas para que los avances se mantengan.'
  }
];

// Notas científicas breves que rotan cada día (psicoeducación).
const SCIENCE = [
  { t: 'Estímulos supranormales', d: 'La pornografía ofrece novedad infinita que ninguna pareja real puede igualar. El cerebro aprende a asociar excitación con pantalla, no con contacto. Reducirla devuelve sensibilidad al contacto real.' },
  { t: 'TDAH y dopamina', d: 'El TDAH implica una señalización de dopamina más baja en reposo; por eso buscas estímulos intensos. Saberlo quita culpa: no es debilidad moral, es neuroquímica que puedes reentrenar.' },
  { t: 'Downregulation', d: 'Ante exceso de dopamina, el cerebro reduce sus receptores D2 para protegerse. Resultado: menos placer con lo cotidiano. La abstinencia relativa permite que vuelvan a subir en semanas.' },
  { t: 'Spectatoring', d: 'Masters y Johnson llamaron así a observarte durante el sexo ("¿estaré duro?, ¿lo hago bien?"). Esa vigilancia activa el sistema de estrés y corta la erección. La atención al cuerpo la disuelve.' },
  { t: 'Ansiedad de desempeño', d: 'El miedo a fallar libera adrenalina, que contrae los vasos y dificulta la erección: se vuelve profecía autocumplida. Quitar la "meta" rompe el círculo.' },
  { t: 'Interocepción', d: 'Es la percepción de las señales internas del cuerpo. A más interocepción, más placer y más control. Se entrena con atención a la respiración y a las sensaciones.' },
  { t: 'Urge surfing', d: 'Los impulsos son como olas: suben, rompen y bajan en 15–30 minutos si no los alimentas. No luchas contra la ola: la surfeas observándola hasta que pasa.' },
  { t: 'Ventana de tolerancia', d: 'El placer profundo aparece cuando el sistema nervioso está regulado, ni hiperactivado (ansiedad) ni apagado (disociación). La respiración lenta te mantiene en esa ventana.' },
  { t: 'Novedad vs. profundidad', d: 'La dopamina responde a lo nuevo; la oxitocina y la serotonina, a lo seguro y profundo. La buena vida sexual en pareja se construye con el segundo sistema, que hay que reentrenar.' },
  { t: 'Sueño y dopamina', d: 'La falta de sueño reduce la disponibilidad de receptores D2 al día siguiente, aumentando la impulsividad. Dormir bien es literalmente un tratamiento para el control de impulsos.' },
  { t: 'Ejercicio', d: 'El ejercicio aeróbico sube dopamina y BDNF de forma sostenida y sana, y baja la ansiedad. 20–30 min mejoran el ánimo y reducen la urgencia de buscar picos artificiales.' },
  { t: 'Luz de la mañana', d: 'La luz solar temprana regula el sistema dopaminérgico y el ritmo circadiano. 10 minutos al despertar mejoran la motivación basal durante el día.' },
  { t: 'Respiración y erección', d: 'La erección depende del sistema parasimpático (calma). La respiración lenta con exhalación larga activa ese sistema; la prisa y la ansiedad lo bloquean.' },
  { t: 'Sensate focus', d: 'Terapia sexual clásica: contacto sin objetivo de orgasmo, atendiendo solo a la sensación. Reduce ansiedad, mejora comunicación y recupera el placer del tacto.' },
  { t: 'Neuroplasticidad', d: 'El cerebro se reorganiza con la repetición. Cada día que eliges presencia en vez de pantalla, fortaleces circuitos nuevos. Los cambios se consolidan en 6–12 semanas.' },
  { t: 'Vergüenza vs. cambio', d: 'La vergüenza paraliza y suele empujar a la recaída; la autocompasión sostiene el cambio. Trátate como tratarías a un amigo que intenta mejorar.' }
];

// Prácticas de atención/respiración que rotan.
const PRACTICES = [
  { t: 'Respiración 4-7-8', d: 'Inhala 4 s, retén 7 s, exhala 8 s. 4 ciclos. La exhalación larga activa el sistema de calma que necesita la erección.', min: 3 },
  { t: 'Escaneo corporal', d: 'Recorre tu cuerpo de los pies a la cabeza notando sensaciones sin cambiarlas. Entrena la interocepción, base del placer.', min: 8 },
  { t: 'Respiración en caja', d: 'Inhala 4, retén 4, exhala 4, retén 4. 5 minutos. Regula el sistema nervioso a la ventana de tolerancia.', min: 5 },
  { t: 'Atención a un objeto', d: 'Sostén algo (una fruta, una taza) y explora su textura, peso y temperatura 3 min. Reentrena al cerebro a disfrutar estímulos sutiles.', min: 3 },
  { t: 'Ducha consciente', d: 'En la ducha, lleva toda la atención a la temperatura y al tacto del agua. Práctica de placer no sexual y de presencia.', min: 5 },
  { t: 'Caminar y sentir', d: 'Camina 10 min atendiendo a las plantas de los pies y a la respiración. Ejercicio suave + anclaje al cuerpo.', min: 10 },
  { t: 'Autotoque no sexual', d: 'Con los ojos cerrados, acaricia lentamente tus brazos y manos atendiendo solo a la textura. Base del sensate focus contigo mismo.', min: 6 },
  { t: 'Exhalación larga', d: '10 respiraciones con exhalación al doble de la inhalación. Baja pulso y ansiedad de desempeño en minutos.', min: 4 }
];

// Prompts de journaling que rotan.
const JOURNAL = [
  '¿Qué situación, emoción o momento del día disparó más el impulso hoy?',
  '¿Qué sentí en el cuerpo justo antes de un impulso? ¿Dónde lo noté?',
  '¿Qué hice hoy que me acercó a la vida sexual que quiero?',
  'Describe un momento del día en que me sentí presente en mi cuerpo.',
  '¿Qué le diría a mi pareja sobre lo que estoy trabajando, si tuviera valor?',
  '¿Qué emoción estaba evitando cuando apareció el impulso (aburrimiento, estrés, soledad)?',
  '¿De qué me siento orgulloso hoy, por pequeño que sea?',
  '¿Cómo cambió mi energía y mi ánimo en los días con menos estimulación?',
  'Si hoy hubo una recaída, ¿qué la precedió y qué haré distinto mañana? (Sin culpa.)',
  '¿Qué tipo de placer no sexual disfruté hoy (comida, música, naturaleza, contacto)?',
  '¿Qué historia me cuento sobre mi sexualidad? ¿Es verdad o es miedo?',
  '¿Qué necesito darme a mí mismo esta semana para sostener el cambio?'
];

// Hitos: tareas específicas que aparecen en días concretos.
const MILESTONES = {
  1:  { title: 'Define tu porqué', body: 'Escribe en una frase por qué haces esto. Vuelve a ella cuando flaquees. La motivación intrínseca (tu vínculo, tu placer) sostiene el cambio mejor que la culpa.' },
  3:  { title: 'Mapa de disparadores', body: 'Anota tus 3 situaciones de mayor riesgo (hora, lugar, estado de ánimo, dispositivo). No puedes cambiar lo que no ves.' },
  5:  { title: 'Fricción en el entorno', body: 'Añade obstáculos: saca el teléfono del dormitorio, usa un bloqueador de contenido, deja el móvil cargando fuera de tu alcance por la noche. El entorno vence a la fuerza de voluntad.' },
  7:  { title: 'Primera semana completa', body: 'Revisa tu semana. ¿Qué patrón ves? Celebra haber llegado hasta aquí: el sistema de recompensa ya está empezando a recalibrarse.' },
  11: { title: 'Compromiso de recableado', body: 'Empieza el periodo sin pornografía ni erótica. Objetivo mínimo: 14 días seguidos para notar el cambio en sensibilidad y ánimo.' },
  14: { title: 'Dos semanas de recableado', body: 'Muchos notan aquí más claridad mental, más energía y más deseo real hacia su pareja. Anota qué ha cambiado en ti.' },
  18: { title: 'Sensate focus solo · Nivel 1', body: 'Dedica 15 min a explorar tu cuerpo (no genital) con la única meta de notar sensación, sin buscar excitación ni orgasmo. Reeduca el placer.' },
  21: { title: 'Tres semanas', body: 'La abstinencia relativa de ~21 días suele coincidir con una subida notable de sensibilidad. Estás resensibilizando tu sistema.' },
  25: { title: 'Conversación con tu pareja', body: 'Comparte con tu pareja que estás trabajando en tu sensibilidad y presencia. Propón hacer ejercicios de contacto sin presión de rendimiento. La comunicación reduce la ansiedad a la mitad.' },
  29: { title: 'Sensate focus en pareja · Nivel 1', body: 'Contacto por turnos, sin zonas genitales ni pechos, sin meta sexual. Quien toca explora; quien recibe solo siente y respira. 15–20 min. Prohibido el coito hoy: eso quita la presión.' },
  36: { title: 'Sensate focus en pareja · Nivel 2', body: 'Incluye zonas genitales pero aún SIN objetivo de orgasmo ni penetración. Sigue siendo exploración sensorial. Si aparece erección, no la persigas: solo obsérvala.' },
  43: { title: 'Sensate focus · Nivel 3', body: 'Contacto mutuo simultáneo. Si surge deseo de más, adelante, pero la regla sigue siendo: atención a la sensación, no al desempeño. Respira cuando notes que "te observas".' },
  50: { title: 'Intimidad con presencia', body: 'Si hay penetración, empieza con foco en la sensación y la respiración compartida, sin prisa por el orgasmo. Pausa y respira cuando aparezca el espectador.' },
  60: { title: 'Dos meses', body: 'Revisa tu evolución en sensibilidad, erección y conexión. Ajusta lo que funcione. El nuevo cableado ya es más fuerte que el viejo.' },
  75: { title: 'Plan de prevención de recaídas', body: 'Escribe tus señales de alerta tempranas y tu plan de acción para cada una. Una recaída no borra el progreso; el plan te devuelve al camino rápido.' },
  90: { title: '90 días · Nueva línea base', body: 'Has reentrenado tu sistema de recompensa y tu atención. Define cómo mantendrás los hábitos clave de por vida y qué revisarás cada semana.' }
};

// Construye 90 días combinando fase + rotaciones + hitos.
function buildProgram() {
  const days = [];
  for (let n = 1; n <= 90; n++) {
    const phase = PHASES.find(p => n >= p.range[0] && n <= p.range[1]) || PHASES[3];
    const day = {
      n,
      phase: phase.id,
      phaseName: phase.name,
      color: phase.color,
      science: SCIENCE[(n - 1) % SCIENCE.length],
      practice: PRACTICES[(n - 1) % PRACTICES.length],
      journal: JOURNAL[(n - 1) % JOURNAL.length],
      milestone: MILESTONES[n] || null,
      tasks: buildTasks(n, phase)
    };
    days.push(day);
  }
  return days;
}

function buildTasks(n, phase) {
  // Hábitos base diarios comunes a todo el programa.
  const base = [
    'Registrar el check-in de hoy (impulsos, ánimo, energía)',
    `Práctica de atención del día (${PRACTICES[(n - 1) % PRACTICES.length].min} min)`,
  ];
  // Hábitos de soporte de dopamina (rotan para no aburrir).
  const support = [
    '10 min de luz natural al despertar',
    '20–30 min de ejercicio o caminata',
    'Sin pantallas 60 min antes de dormir',
    'Dormir a una hora fija (7–8 h)',
    'Un momento de placer no sexual consciente (música, comida, naturaleza)'
  ];
  const tasks = base.slice();
  tasks.push(support[(n - 1) % support.length]);
  tasks.push(support[n % support.length]);

  // Tareas específicas por fase.
  if (phase.id === 1) tasks.push('Observar los impulsos sin actuar (urge surfing si aparece)');
  if (phase.id === 2) tasks.push('Mantener el día sin pornografía/erótica');
  if (phase.id === 3) tasks.push('Reservar 15 min para el ejercicio sensorial de hoy');
  if (phase.id === 4) tasks.push('Aplicar respiración y presencia en cualquier momento íntimo');

  // Journaling siempre al final.
  tasks.push('Escribir la reflexión del día (journal)');
  return tasks;
}

const PROGRAM = buildProgram();

// Contenido de la biblioteca educativa.
const LIBRARY = [
  {
    title: '¿Por qué a veces no siento nada y pierdo la erección?',
    body: 'Suele ser una combinación de dos cosas. Primero, la desensibilización: si tu cerebro se acostumbró a la intensidad extrema de la pornografía, el contacto real le sabe "poco" y no dispara la misma respuesta. Segundo, el spectatoring: en cuanto empiezas a vigilarte ("¿estoy duro?, ¿lo hago bien?"), tu mente sale del cuerpo y activa el sistema de estrés, que corta la erección. La solución no es esforzarte más, sino todo lo contrario: bajar la exigencia, resensibilizar con menos estímulo artificial y entrenar la atención al cuerpo con respiración. Este programa trabaja las dos cosas.'
  },
  {
    title: 'TDAH, dopamina y por qué esto te pasa a ti',
    body: 'El TDAH se asocia a una regulación de dopamina distinta: en reposo hay menos señal, así que el cerebro busca estímulos fuertes y novedosos para sentirse bien. La pornografía es el estímulo perfecto para ese cerebro: novedad infinita, recompensa inmediata, cero esfuerzo. Por eso engancha más y desensibiliza más rápido. Entender esto es clave: no es falta de carácter, es un cerebro que aprendió un atajo. Y lo que se aprende, se puede reaprender.'
  },
  {
    title: 'La ciencia del "reinicio"',
    body: 'Cuando hay exceso crónico de dopamina, el cerebro reduce sus receptores para protegerse (downregulation). Eso deja todo lo cotidiano —incluida tu pareja— sabiendo a poco. Al reducir el estímulo supranormal, los receptores vuelven a subir en el orden de semanas. La gente suele reportar, entre la segunda y cuarta semana, más energía, mejor ánimo, más claridad y más deseo real. No es magia: es tu química recuperando sensibilidad.'
  },
  {
    title: 'Sensate focus: la herramienta central',
    body: 'Creado por Masters y Johnson, es el tratamiento con más evidencia para la ansiedad de desempeño y la desconexión. Consiste en tocar y ser tocado por turnos, prohibiendo explícitamente el orgasmo y (al inicio) el coito, poniendo toda la atención en la sensación: textura, temperatura, presión. Al quitar la meta, desaparece la presión que causa el problema, y el cuerpo vuelve a responder solo. Se avanza por niveles: primero sin genitales, luego con ellos pero sin objetivo, y por último hacia la intimidad plena.'
  },
  {
    title: 'Urge surfing: cómo pasar un impulso fuerte',
    body: 'Un impulso no es una orden, es una ola. Sube, alcanza un pico y baja, normalmente en 15–30 minutos, si no lo alimentas. En vez de luchar (lo que lo intensifica) o ceder, lo observas: ¿dónde lo siento en el cuerpo?, ¿cómo cambia?, ¿sube o baja? Respiras y lo dejas pasar como quien mira una ola desde la orilla. Cada ola que surfeas debilita el hábito. El botón "Tengo un impulso" de esta app te guía paso a paso.'
  },
  {
    title: 'Hablar con tu pareja sin miedo',
    body: 'El silencio alimenta la ansiedad. No tienes que confesar nada como una falta; puedes enmarcarlo como un proyecto de mejora: "Quiero estar más presente y sentir más contigo, y estoy trabajando en ello. ¿Te animas a hacer unos ejercicios de contacto sin presión conmigo?". Compartirlo reduce tu ansiedad de desempeño, convierte a tu pareja en aliada y suele acercar la relación. La vulnerabilidad bien comunicada es atractiva.'
  },
  {
    title: 'Cuando hay una recaída',
    body: 'Las recaídas son parte del proceso, no su fin. Lo que determina el resultado no es caer, sino qué haces después. La vergüenza empuja a "ya que fallé, sigo"; la autocompasión te devuelve al camino. Registra qué la precedió (cansancio, soledad, aburrimiento, una app), aprende el patrón y ajusta el entorno. Un día no borra semanas de recableado.'
  }
];
