# Mesa de Socios

Trae una decisión de negocio difícil y un consejo de asesores de IA la discute, te da un veredicto con puntuaciones y lo puedes descargar en PDF con un clic. Vienen doce asesores, cada uno construido a partir del trabajo público de esa persona: cartas, ensayos, charlas y videos. Para cada pregunta, el Presidente del consejo recomienda quién se sienta a la mesa y tú lo confirmas. El consejo corre en Claude Code, y una pequeña app web local los muestra alrededor de una mesa discutiendo en vivo. ¿Quieres a alguien más en la mesa? Escribe `/nuevo-asesor` y un nombre, y Claude construye ese asesor de la misma forma.

Todo funciona en español: el consejo, la sala y el PDF.

| Asesor | Pilar | La pregunta que le toca |
|---|---|---|
| Jeff Bezos | Estrategia y decisiones | ¿Es la apuesta correcta, y qué tan reversible es? |
| Paul Graham | Producto y startups | ¿La gente de verdad quiere esto, y está creciendo? |
| Alex Hormozi | Ofertas, precios y ventas | ¿La gente va a pagar, cuánto, y cómo cerramos? |
| Gary Vaynerchuk | Marketing y atención | ¿De dónde sale la atención, y está barata? |
| Dan Martell | Equipo, contrataciones y tu tiempo | ¿Quién hace esto, y cuánto le cuesta a tu agenda? |
| Gino Wickman | Operaciones y escala | ¿Puede el negocio sostener esto sin que tú lo mantengas en pie? |
| Warren Buffett | Dinero y capital | ¿Qué le hace a la caja, al riesgo y al valor a largo plazo? |

Esos siete forman el **consejo por defecto**. Otros cinco están de guardia, y el Presidente los llama cuando tu pregunta cae en su terreno:

| Asesor | Pilar | La pregunta que le toca |
|---|---|---|
| Naval Ravikant | Apalancamiento y riqueza | ¿Esto construye apalancamiento y patrimonio tuyo, o solo alquila tu tiempo? |
| Codie Sanchez | Comprar y ser dueño de pequeñas empresas | ¿Deberías construir esto, o comprar algo que ya funciona? |
| Leila Hormozi | Liderazgo y equipos que escalan | ¿Pueden tu equipo y tu liderazgo cargar con esto, y quién tiene que cambiar? |
| Sara Blakely | Producto de consumo y marca desde cero | ¿Lo van a amar tanto que lo vendan por ti, sin dinero externo? |
| Elon Musk | Primeros principios y velocidad de ejecución | ¿Cuál es la restricción real, y podemos quitar pasos y construirlo más rápido? |

## Qué necesitas

- [Claude Code](https://claude.com/claude-code). Tu plan de Claude lo cubre; no necesitas clave de API.
- [Node.js](https://nodejs.org) 20 o más nuevo, para la sala. No hay nada más que instalar.

## Instalación

```bash
git clone https://github.com/diegovasquez-ai/mesa-de-socios.git
cd mesa-de-socios
```

## Cómo se usa

1. Arranca la sala: `npm start`, y abre http://localhost:4730. Déjala abierta.
2. Abre Claude Code en la misma carpeta: `claude` (o abre la carpeta en VS Code y usa el chat de Claude Code).
3. Escribe `/mesa-de-socios` y tu decisión.
4. Responde las preguntas del Presidente y mira cómo el consejo lo discute en la sala.
5. Cuando llegue el veredicto, pulsa **Descargar PDF**.

También recibes un veredicto corto en Claude Code, y el informe completo queda en `sessions/<fecha>-<decisión>/verdict.md`.

## Qué poner en tu pregunta

El consejo es tan bueno como lo que le das. Incluye:

- **La decisión** en una línea.
- **Tus opciones.** Dos o tres. "Seguir como estoy" cuenta.
- **Tus números.** Facturación, caja y tamaño del equipo.
- **Tus límites.** Plazo, horas y presupuesto.
- **Cómo se ve el éxito**, y para cuándo.
- **Hacia dónde te inclinas**, y por qué. El consejo pone a prueba tu preferencia en lugar de darte la razón.

¿Te faltó algo? El Presidente te pregunta antes de que empiece el consejo. Ejemplo:

```
/mesa-de-socios Tengo un negocio de coaching que factura $30k al mes con 15 clientes a $2.000 cada uno.
¿Subo a $3.500 para todos, subo solo para clientes nuevos, o mantengo $2.000?
Cierro cerca del 50% y tengo $40k en el banco. El éxito es llegar a $45k al mes en marzo.
Me inclino por subir a todos porque cobro poco.
```

Otras formas de usarlo:

- `/mesa-de-socios --quick ...` sienta a cuatro asesores durante dos rondas. Para decisiones más pequeñas y reversibles. Gasta mucho menos de tu plan.
- `/mesa-de-socios --seats hormozi,buffett ...` sienta solo a los asesores que nombres.
- `/mesa-de-socios ask hormozi ...` pide una respuesta a un solo asesor.
- `/mesa-de-socios --all ...` sienta a todos tus asesores (hasta nueve).
- `/mesa-de-socios board` muestra quién se sienta por defecto y te deja cambiarlo.

La sala es opcional. El consejo funciona igual en Claude Code sin ella.

## Elige quién se sienta a la mesa

Cuando usas `/mesa-de-socios`, el Presidente lee tu pregunta y recomienda un consejo entre todos tus asesores, con una línea sobre por qué encaja cada uno. Tú eliges:

- **Consejo recomendado**: los cinco a siete asesores que el Presidente eligió para esta pregunta.
- **Consejo por defecto**: tus siete de siempre.
- **Todos**: todos, cuando tienes nueve o menos.
- **Otro**: escribe cambios, como "el recomendado, pero añade a Naval y quita a Wickman".

Cada consejo mantiene un asiento que cuida tu riesgo y uno que probablemente discrepe, para que la mesa discuta en lugar de asentir.

Cómo se elige el consejo es un ajuste en `.claude/skills/mesa-de-socios/roster.json`:

| Ajuste | Qué pasa en cada `/mesa-de-socios` |
|---|---|
| `"ask"` (por defecto) | El Presidente recomienda un consejo y te pide confirmarlo. |
| `"auto"` | El Presidente elige el consejo y te dice quién y por qué, sin preguntar. |
| `"default"` | Se sienta tu consejo por defecto siempre. Sin preguntas. |

No hace falta editar el archivo a mano: escribe `/mesa-de-socios board` y di lo que quieres.

## Añade tu propio asesor

```
/nuevo-asesor Morgan Housel
```

Claude construye un asiento nuevo igual que los originales:

1. Te hace dos o tres preguntas: el pilar y la pregunta que le toca, si entra en tu consejo por defecto y qué tan a fondo investigar.
2. Busca su trabajo público: ensayos, cartas, charlas, entrevistas largas y podcasts donde habla esa persona.
3. Lo descarga en `build/<nombre>/`, una carpeta local que git ignora.
4. Extrae cómo piensa: sub-agentes en paralelo leen cada fuente y sacan sus frameworks, reglas, posturas, historias y forma de hablar, con citas textuales.
5. Escribe su cerebro (`.claude/skills/mesa-de-socios/brains/<nombre>/`) y comprueba que cada cita esté palabra por palabra en su fuente.
6. Escribe su agente (`.claude/agents/council-<nombre>.md`) y lo añade a `roster.json`.
7. Hace su retrato para la sala a partir de una foto real, en el mismo estilo caricatura que los demás.
8. Prueba el asiento nuevo con una pregunta de ejemplo.

| Profundidad | Fuentes | Para qué |
|---|---|---|
| `--quick` | 12 a 20 | Probar a alguien |
| por defecto | 30 a 50 | Un asesor que vas a usar |
| `--deep` | 80+ | Igualar a los originales |

Una construcción normal son unos 8 a 10 sub-agentes, así que gasta una parte real de tu plan. El retrato necesita una clave de [kie.ai](https://kie.ai/api-key) en `.env` (`KIE_AI_API_KEY=`) y Python con `opencv-python`. Sin clave, el asesor funciona igual y aparece con una cara genérica.

Para transcripciones de YouTube y fotos funciona mejor con [yt-dlp](https://github.com/yt-dlp/yt-dlp) instalado, y los PDF necesitan `pdftotext` ([Poppler](https://poppler.freedesktop.org)). Ambos son opcionales.

## Cómo funciona

- **El consejo corre en Claude Code.** Cada asiento es un sub-agente (`.claude/agents/council-*.md`, listados en `roster.json`) que lee su propio cerebro: frameworks, principios, posturas, historias y notas de voz sacadas de fuentes públicas, con cada cita atada a una fuente. Claude hace de Presidente: dirige las rondas, lleva la cuenta y escribe el veredicto (`.claude/skills/mesa-de-socios/SKILL.md`).
- **Los cerebros están en inglés** y los asesores responden en español. Cuando citan una frase real de su fuente, la dejan en inglés con la traducción entre corchetes, para que siga siendo una cita verdadera.
- **Cada asiento puntúa cada opción**, ponderado según cuánto importa su pilar en tu decisión. El Presidente pone un tope al veredicto cuando un asiento marca riesgo de ruina, y fuerza una discusión real cuando todos se ponen de acuerdo demasiado rápido.
- **La sala solo mira.** El Presidente escribe cada paso en `sessions/` y la app reproduce esos archivos. No hace llamadas de IA por su cuenta.
- **Cada consejo se guarda** en `sessions/` (fuera de git). "Sesiones anteriores" repite cualquiera y descarga su PDF. Los tres consejos de ejemplo que vienen con el repo están en inglés.
- **Consumo:** un consejo completo son tres sub-agentes por asiento (21 para siete), así que gasta bastante de tu plan. Usa `--quick` para decisiones pequeñas.

## Opcional: que la sala corra consejos por sí sola

Copia `.env.example` a `.env`, añade un `ANTHROPIC_API_KEY`, pon `COUNCIL_RUNNER=api` y reinicia `npm start`. Ese modo se cobra en tu cuenta de la API de Anthropic (unas 25 llamadas por consejo completo) y sus prompts siguen en inglés.

## Qué hay dentro

| Ruta | Qué es |
|---|---|
| `.claude/skills/mesa-de-socios/` | La skill del consejo: protocolo, prompts, puntuación, plantilla del informe y un cerebro por asesor |
| `.claude/skills/mesa-de-socios/roster.json` | Todos los asesores, tu consejo por defecto y cómo se elige |
| `.claude/skills/nuevo-asesor/` | La skill `/nuevo-asesor` y sus scripts |
| `.claude/agents/` | Un agente por asesor (`council-<nombre>.md`) |
| `app/` | La sala: un servidor Node sin dependencias, la página web y el generador de PDF |
| `sessions/` | Tus consejos (fuera de git) y los tres ejemplos |

## Sobre los asesores

Son simulaciones construidas a partir del trabajo público de cada persona, igual que cualquier asesor que añadas. No son esas personas, no hablan en su nombre y ninguna está afiliada a este proyecto ni lo respalda. Un asiento solo cita textualmente a una persona cuando la frase está en su cerebro con su fuente, y `python .claude/skills/mesa-de-socios/scripts/check_quotes.py sessions/<sesión>` comprueba cada cita de un consejo contra los cerebros. El `sources.md` de cada cerebro lista de dónde salió.

## Créditos y licencia

Basado en [Roast Room](https://github.com/nateherkai/roast-room) de AI Automation Society, con licencia MIT. Esta versión lo traduce al español y le cambia el nombre y la marca. El código es MIT; ver `LICENSE`. El generador de PDF incluye [jsPDF](https://github.com/parallax/jsPDF) (MIT) y [Montserrat](https://github.com/JulietaUla/Montserrat) (SIL Open Font License); sus licencias están junto a ellos en `app/public/`.
