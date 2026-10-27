// Spanish display words for the tokens a council writes. Councils can come in either
// language (the example sessions and the API runner write English), so the room and the
// PDF map every token through here instead of showing it raw.

const LABELS = { "GO": "ADELANTE", "GO WITH CONDITIONS": "ADELANTE CON CONDICIONES", "RESHAPE": "REPLANTEAR", "WAIT": "ESPERAR", "DON'T DO IT": "NO LO HAGAS" };

/** "GO WITH CONDITIONS" -> "ADELANTE CON CONDICIONES"; a Spanish label passes through. */
export const verdictLabel = (l) => {
  const t = String(l || "").trim().toUpperCase().replace(/’/g, "'");
  return LABELS[t] || t;
};

/** Which color band a verdict label belongs to: go, wait, reshape, or dont. */
export const labelKind = (l) => {
  const t = verdictLabel(l);
  return /NO LO HAGAS/.test(t) ? "dont" : /REPLANTEAR/.test(t) ? "reshape" : /ESPERAR/.test(t) ? "wait" : "go";
};

const VOTES = { endorse: "respalda", amend: "enmienda", dissent: "disiente" };
export const voteWord = (v) => VOTES[v] || String(v || "");

/** A card's STANCE / POSTURA line as one or two words for a chip. */
export function stanceWord(t = "") {
  const m = String(t).match(/strong yes|conditional yes|strong no|s[ií] rotundo|s[ií],? con condiciones|no rotundo|yes|s[ií]|no/i);
  if (!m) return "Habló";
  const w = m[0].toLowerCase().replace(/í/g, "i").replace(",", "");
  return {
    "strong yes": "Sí rotundo", "si rotundo": "Sí rotundo",
    "conditional yes": "Condicional", "si con condiciones": "Condicional",
    "strong no": "No rotundo", "no rotundo": "No rotundo",
    yes: "Sí", si: "Sí", no: "No",
  }[w] || "Habló";
}

/** Did the seat change position this round? ("yes, from A to B" or "sí, de A a B") */
export const movedYes = (t) => /^\s*(yes|s[ií])(?![a-zñ])/i.test(String(t || ""));
