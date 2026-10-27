# Round prompts

Paste these into each seat's Agent call. Replace the bracketed parts. Seats read the brief and earlier rounds from the session folder, so the cards stay verbatim without being pasted into every prompt.

The prompts are in Spanish and every card comes back in Spanish. Keep the uppercase field labels exactly as written (ASESOR, POSTURA, PUNTUACIÓN POR OPCIÓN, and so on): the room parses them. The brains are in English, so a seat reads English and answers in Spanish; verbatim quotes stay in English with a translation after them (the "Citas" line in each prompt), because a translated line is no longer the person's words and the quote checker only finds the original.

Agent type: `council-<seat>`. If that type is not registered in this session (agent files load at session start), spawn `general-purpose` and put these lines first: `Read .claude/agents/council-<seat>.md and follow it as your instructions for this whole task. Only read files; do not write anything.`

Paths in prompts are relative to the repo root; give the absolute repo root once at the top of each prompt.

**Options.** When the brief lists options (A, B, C, including "no hacerlo"), every card scores every option. When it is a single yes or no decision, the options are "hacerlo como se propone" and "no hacerlo".

**Pillar score.** The seat's score of the option it recommends, judged on its own pillar alone.

---

## Round 1: opening position

```
MESA DE SOCIOS, RONDA 1 DE 3: POSICIÓN INICIAL

Raíz del repo: [ruta absoluta]. Ocupas el asiento [SEAT] ([pilar]). Lee el _hot.md de tu cerebro y luego como máximo tres archivos más que encajen con esta decisión (frameworks.md y positions.md suelen ser los adecuados).

Lee el caso: [carpeta de la sesión]/brief.md

Tu peso en esta decisión: [w]/3 ([motivo en una línea]).

Responde en español neutro, con la voz de tu asiento, en texto plano, en menos de 350 palabras, exactamente con esta forma. Las etiquetas en mayúsculas van tal cual, sin traducir ni cambiar: la sala las lee.

ASESOR: [SEAT] ([pilar])
POSTURA: Sí rotundo | Sí | Sí, con condiciones | No | No rotundo   (sobre la opción que recomiendas)
PUNTUACIÓN POR OPCIÓN: [A] n/10 · [B] n/10 · [C] n/10   (cuánto respaldas cada opción)
PUNTUACIÓN DE PILAR: n/10   ([dimensión]: la opción que recomiendas, juzgada solo desde tu pilar)
CONFIANZA: n/5
RIESGO DE RUINA: ninguno | posible | probable   (un daño irreversible que podría hundir la empresa o a quien la dirige, con la opción que recomiendas)
PUERTA: irreversible | reversible   (¿se puede deshacer la opción que recomiendas?)

MI DECISIÓN: una frase, nombrando la opción o una variante.
POR QUÉ:
1. argumento, nombrando el framework o principio que usaste y su id de fuente, por ejemplo (Value Equation, S014)
2. ...
3. ...
EL RIESGO QUE VEO: lo que más probablemente sale mal.
QUÉ ME HARÍA CAMBIAR DE OPINIÓN: un dato o un número concreto.
QUÉ HARÍA ESTA SEMANA: una acción.
MI PREGUNTA PARA TI: la única pregunta que harías antes de dar el visto bueno.

Reglas: argumenta primero desde tu pilar. Usa números reales cuando el caso los tenga, y di qué números estás suponiendo cuando no. No suavices para sonar equilibrado: el Presidente equilibra el consejo, tú traes tu lente a toda potencia.

Citas: cita solo frases que estén textualmente en tu cerebro. Van en su inglés original, entre comillas, con el id de fuente justo detrás, y la traducción después, entre corchetes y sin comillas: "exact words from the brain" (S014) [traducción]. Nunca pongas entre comillas una traducción ni una paráfrasis.
```

---

## Round 2: debate

```
MESA DE SOCIOS, RONDA 2 DE 3: DEBATE

Raíz del repo: [ruta absoluta]. Ocupas el asiento [SEAT]. Vuelve a leer el _hot.md de tu cerebro y cualquier archivo que necesites para responder a los demás (como máximo tres).

Lee: [carpeta de la sesión]/brief.md y [carpeta de la sesión]/round-1.md (la tarjeta de cada asiento y los puntos clave del Presidente).

LOS PUNTOS CLAVE QUE VE EL PRESIDENTE
1. [punto clave]: [asientos de cada lado]. [Si este asiento está en un lado, nombra el argumento que debe responder.]
2. ...

Responde en español neutro, con la voz de tu asiento, en texto plano, en menos de 300 palabras, exactamente con esta forma. Las etiquetas en mayúsculas van tal cual.

ASESOR: [SEAT]
CON QUIEN MÁS DISCREPO: [asiento]. Su argumento en una línea, y luego tu réplica con tus frameworks.
CONCEDO: el punto más fuerte que otro asiento hizo contra ti, y qué cambia. "Nada" solo si puedes decir por qué falla su mejor punto.
SOBRE LOS PUNTOS CLAVE: tu respuesta a cada uno, en una o dos líneas.
POSTURA: ...
PUNTUACIÓN POR OPCIÓN: [A] n/10 · [B] n/10 · [C] n/10
PUNTUACIÓN DE PILAR: n/10
CONFIANZA: n/5
RIESGO DE RUINA: ninguno | posible | probable
CAMBIÉ DE POSTURA: no | sí, de X a Y, porque ...
MIS CONDICIONES PARA EL SÍ: hasta tres, concretas y verificables (un número, una fecha, un resultado de prueba).

Reglas: responde a los argumentos que de verdad están sobre la mesa. Cambia solo ante un argumento mejor, nunca por quedar bien. Si todos están de acuerdo contigo, busca la parte más débil de tu propio caso y dila.

Citas: cita solo frases que estén textualmente en tu cerebro. Van en su inglés original, entre comillas, con el id de fuente justo detrás, y la traducción después, entre corchetes y sin comillas: "exact words from the brain" (S014) [traducción]. Nunca pongas entre comillas una traducción ni una paráfrasis.
```

---

## Round 3: ratification

```
MESA DE SOCIOS, RONDA 3 DE 3: VOTACIÓN DE LA PROPUESTA

Raíz del repo: [ruta absoluta]. Ocupas el asiento [SEAT]. Ya discutiste esto en dos rondas; lee solo tu _hot.md si lo necesitas.

Lee: [carpeta de la sesión]/brief.md, tu propia sección de [carpeta de la sesión]/round-2.md, y [carpeta de la sesión]/draft-resolution.md.

Responde en español neutro, con la voz de tu asiento, en menos de 150 palabras, exactamente con esta forma. Las etiquetas en mayúsculas van tal cual.

ASESOR: [SEAT]
VOTO: Respaldo | Respaldo con enmienda | Disiento
PUNTUACIÓN POR OPCIÓN: [A] n/10 · [B] n/10 · [C] n/10   (dadas las condiciones de la propuesta)
PUNTUACIÓN FINAL: n/10   (tu apoyo a la propuesta tal como está escrita)
PUNTUACIÓN FINAL DE PILAR: n/10
ENMIENDA O DISENSO: una o dos frases (qué cambiar, o por qué disientes). En blanco si respaldas.
UNA LÍNEA PARA TI: lo que, desde tu pilar, no puedes olvidar.

Citas: si citas, la frase va en su inglés original, entre comillas, con el id de fuente justo detrás y la traducción entre corchetes: "exact words from the brain" (S014) [traducción].
```

---

## Single-seat consult

```
MESA DE SOCIOS, CONSULTA A UN SOLO ASIENTO

Raíz del repo: [ruta absoluta]. Ocupas el asiento [SEAT]. Lee el _hot.md de tu cerebro y luego como máximo cuatro archivos más que encajen con la pregunta.

LA PREGUNTA
[pregunta, más el contexto que haya]

Responde en español neutro, con la voz de tu asiento, en primera persona, en menos de 500 palabras: tu decisión, tu razonamiento con frameworks nombrados e ids de fuente, qué harías esta semana, y la pregunta que harías de vuelta. No narres al experto en tercera persona. Termina con "Fuentes:" y los ids de fuente que usaste.

Citas: cita solo frases que estén textualmente en tu cerebro. Van en su inglés original, entre comillas, con el id de fuente justo detrás, y la traducción después, entre corchetes y sin comillas: "exact words from the brain" (S014) [traducción]. Nunca pongas entre comillas una traducción ni una paráfrasis.
```
