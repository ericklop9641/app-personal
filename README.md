# Sensia

Web app (PWA) para un plan **día a día de 90 días** enfocado en recuperar
sensibilidad, presencia y una mejor vida sexual. Pensada para usarse en el
iPhone como una app instalada en la pantalla de inicio, funciona sin conexión
y **guarda todos los datos solo en tu dispositivo** (localStorage). No hay
servidor ni cuenta: privacidad total.

## Qué hace

- **Hoy** — el plan del día: hito, tareas, nota científica, práctica de atención
  y reflexión, con un anillo de progreso y racha limpia.
- **Check-in diario** — registras pornografía/erótica, masturbación compulsiva,
  intensidad de impulsos, ánimo, energía y conexión con tu pareja.
- **Progreso** — racha, calendario, días limpios y tendencias (ánimo, energía,
  conexión, impulsos) para ver el efecto de la recalibración.
- **Impulso** — botón de emergencia con *urge surfing* y respiración guiada 4-7-8
  animada para pasar un antojo sin ceder.
- **Aprender** — biblioteca de psicoeducación.
- **Diario** — entradas privadas con prompts.

## Base científica

El contenido se apoya en:

- **Desensibilización dopaminérgica** por estímulos supranormales (pornografía de
  alta novedad) y su interacción con el **TDAH** (dopamina basal más baja →
  búsqueda de estímulos intensos).
- **Sensate focus** (Masters & Johnson) para reducir la ansiedad de desempeño y
  recuperar la sensación táctil, por niveles progresivos.
- **Spectatoring**: la auto-observación durante el sexo activa el sistema de
  estrés y corta la erección; se trata con atención al cuerpo y respiración.
- **Urge surfing** (Marlatt) para gestionar impulsos.
- **Higiene del sueño, ejercicio, luz de la mañana e interocepción** para regular
  la dopamina basal.

> Es una herramienta de autoayuda basada en evidencia, **no un tratamiento médico**.
> Si el malestar persiste, un sexólogo o psicólogo puede ayudar. La disfunción
> eréctil también puede tener causas físicas: conviene una revisión médica.

## Cómo usarla en el iPhone

La forma más cómoda es publicarla en **GitHub Pages** (gratis y con HTTPS, que
es lo que necesita el modo app y el uso sin conexión):

1. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, y elige la rama de este proyecto con la carpeta raíz (`/`).
2. Espera 1–2 min y abre la URL que te da GitHub Pages en **Safari** del iPhone.
3. Toca **Compartir** (el cuadrado con la flecha) → **Añadir a inicio**.
4. Ábrela desde el icono nuevo: se verá a pantalla completa, como una app.

Alternativa local (para probar en el ordenador): sirve la carpeta con cualquier
servidor estático, p. ej. `npx serve` o `python3 -m http.server`, y abre
`http://localhost:PORT`.

## Estructura

```
index.html              · estructura y barra de navegación
css/styles.css          · estilos (tema oscuro, mobile-first, safe-area iOS)
js/data.js              · programa de 90 días y biblioteca (base científica)
js/app.js               · lógica, estado local y vistas
manifest.webmanifest    · instalación como PWA
sw.js                   · service worker (uso sin conexión)
icons/                  · iconos de la app
scripts/gen-icons.js    · regenera los iconos PNG (node scripts/gen-icons.js)
```

Los datos viven en `localStorage`; para reiniciar el programa hay un botón en
**Progreso**.
