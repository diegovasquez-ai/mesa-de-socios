# Live room files

The Mesa de Socios (a local web app on http://localhost:4730) watches the sessions folder and plays a council as its files appear: portraits talk one at a time, rebuttal arrows fly, votes land, and the verdict comes up. It reads the round files you already write, plus four small JSON files. Write each one at the moment listed, as plain JSON (no comments, no trailing commas). Seat names can be keys (`garyvee`) or display names (`Gary V`).

The room is optional. Write these files anyway; they cost a few lines and the council runs the same without the room.

**Language.** Every text value the room shows is in Spanish: titles, options, reasons, cruxes, recommendations, steps. Keys, option ids (`A`, `B`), seat names, and `mode` (`full` or `quick`) stay as shown. Verdict labels are the Spanish ones listed under `verdict.json` (the room also reads the English ones, for older sessions).

## Order

| When | File |
|---|---|
| Step 2, with `brief.md` | `council.json` |
| Round 1 cards back | `round-1.md` (one `## <Seat>` heading per card, cards verbatim, `## Chair notes` last) |
| After the Round 1 Chair notes | `cruxes.json` |
| Round 2 cards back | `round-2.md` |
| With `draft-resolution.md` | `draft.json` (skip in quick mode when Round 3 is skipped) |
| Round 3 cards back | `round-3.md` |
| Last, after `verdict.md` | `verdict.json` |

## council.json

```json
{
  "title": "Subir el coaching a $3.500",
  "decision": "Subir el precio de $2.000 a $3.500, y a quién.",
  "mode": "full",
  "options": [
    { "id": "A", "label": "Subir a $3.500 para todos ya" },
    { "id": "B", "label": "Subir solo a clientes nuevos" },
    { "id": "C", "label": "Mantener $2.000" }
  ],
  "weights": {
    "hormozi": { "weight": 3, "reason": "El precio es su pilar" },
    "buffett": { "weight": 2, "reason": "Riesgo de caja si se van clientes" }
  },
  "seats": ["bezos", "graham", "hormozi", "garyvee", "martell", "wickman", "buffett"],
  "brief": "Dos o tres frases.",
  "assumptions": ["La tasa de cierre se mantiene en 50% (supuesto)"]
}
```

`mode` is `full` or `quick`. `seats` lists only the seats at the table. Give every seat at the table a weight (1 to 3). Option labels stay short: under 50 characters.

## cruxes.json

```json
{
  "cruxes": [
    {
      "question": "¿El dinero de clientes alcanza para dos contrataciones más?",
      "sides": [
        { "position": "Sí, el pago adelantado lo cubre", "seats": ["Hormozi", "Martell"] },
        { "position": "No, es ingreso adelantado", "seats": ["Graham", "Bezos"] }
      ]
    }
  ],
  "unanimous": false,
  "note": "Una frase simple sobre en qué no se ponen de acuerdo."
}
```

One to three cruxes. Questions under 90 characters, positions under 50.

## draft.json

```json
{
  "option": "B",
  "label": "ADELANTE CON CONDICIONES",
  "recommendation": "Una o dos frases.",
  "conditions": ["Condición verificable"],
  "next_steps": ["Paso con fecha"],
  "cheapest_test": "Una línea.",
  "kill_criteria": "Una línea."
}
```

## verdict.json

```json
{
  "label": "ADELANTE CON CONDICIONES",
  "call": "Una o dos frases sobre las que se pueda actuar, nombrando la opción.",
  "recommended": "B",
  "why": [
    { "point": "Una línea.", "seat": "Graham", "framework": "Startup = Growth" }
  ],
  "minority": { "seat": "Martell", "quote": "Las palabras del asesor, copiadas de su tarjeta.", "would_have_to_be_true": "Una línea." },
  "next_steps": [ { "when": "Esta semana", "action": "Una línea." } ],
  "kill_criteria": "Una línea.",
  "conditions": ["Condición verificable"],
  "fights": [ { "crux": "La pregunta", "story": "Quién estaba en cada lado, quién cambió, cómo se resolvió." } ],
  "amendments": [ { "seat": "Buffett", "amendment": "Una línea.", "adopted": true, "reason": "Una línea." } ],
  "cheapest_test": "Una línea.",
  "revisit": "Cuándo y con qué números.",
  "override_note": ""
}
```

`label` is one of ADELANTE, ADELANTE CON CONDICIONES, REPLANTEAR, ESPERAR, NO LO HAGAS (the Spanish names for GO, GO WITH CONDITIONS, RESHAPE, WAIT, DON'T DO IT). Put the three strongest arguments first in `why` and at most three `next_steps`; the room shows those up front and folds the rest under "Detalle completo". The room computes the option scores, confidence, and votes itself from the cards, so they are not in this file.
