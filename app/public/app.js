import { downloadVerdictPdf } from "./pdf.js";
import { verdictLabel, labelKind, voteWord, stanceWord, movedYes } from "./es.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const SAMPLES = [
  ["¿Subir mis precios?", "Tengo un negocio de coaching que factura $30k al mes con 15 clientes activos a $2.000 cada uno. Quiero subir el precio a $3.500. Opciones: subir a todos ahora, subir solo a clientes nuevos, o mantener $2.000. Cierro cerca del 50% de las llamadas de venta. Me inclino por subir a todos porque cobro poco."],
  ["¿Primer vendedor?", "Fundé sin socios un SaaS B2B con $25k de MRR que crece 5% al mes. Hago yo todas las llamadas de venta (unas 20 horas a la semana) y me estoy quemando. ¿Contrato un account executive a tiempo completo con $120k de base, un closer a media jornada solo a comisión, o sigo vendiendo yo seis meses más? Tengo $150k en el banco."],
  ["¿Segundo producto?", "Mi agencia factura $80k al mes construyendo automatizaciones con IA para dentistas. Algunos clientes pidieron un recepcionista con IA. ¿Lo construyo como un SaaS aparte, lo ofrezco como complemento solo a clientes actuales, o me enfoco en la agencia? Equipo de 6, unos $200k en caja."],
  ["¿Dejar mi trabajo?", "Gano $180k al año en una empresa de tecnología. Mi negocio paralelo (un newsletter de pago) factura $6k al mes y creció 8% mensual este año. Tengo 9 meses de gastos ahorrados. ¿Renuncio ahora, renuncio en 6 meses, o mantengo ambos y contrato a alguien que escriba?"],
];

const EXAMPLE = "Tengo un negocio de coaching que factura $30k al mes con 15 clientes a $2.000 cada uno. ¿Subo a $3.500 para todos, subo solo para clientes nuevos, o mantengo $2.000? Cierro cerca del 50% y tengo $40k en el banco. El éxito es llegar a $45k al mes en marzo. Me inclino por subir a todos porque cobro poco.";

// The how-to, shown in the side panel while the room is empty and in "How it works".
const GUIDE = `
  <div class="guide">
    <div class="guide-sec">
      <h4>Cómo usar la Mesa de Socios</h4>
      <ol>
        <li><span>Abre Claude Code en esta carpeta.</span></li>
        <li><span>Escribe <code>/mesa-de-socios</code> y tu decisión.</span></li>
        <li><span>Elige a tus asesores (el Presidente te recomienda un consejo) y responde sus preguntas. Luego mira aquí cómo el consejo lo discute.</span></li>
        <li><span>Cuando llegue el veredicto, descárgalo en PDF.</span></li>
      </ol>
    </div>
    <div class="guide-sec">
      <h4>Qué poner en tu pregunta</h4>
      <ul>
        <li><span><b>La decisión</b> en una línea.</span></li>
        <li><span><b>Tus opciones.</b> Dos o tres. "Seguir como estoy" cuenta.</span></li>
        <li><span><b>Tus números.</b> Facturación, caja y tamaño del equipo.</span></li>
        <li><span><b>Tus límites.</b> Plazo, horas y presupuesto.</span></li>
        <li><span><b>Cómo se ve el éxito</b>, y para cuándo.</span></li>
        <li><span><b>Hacia dónde te inclinas</b>, y por qué. El consejo lo pone a prueba.</span></li>
      </ul>
      <p class="note" style="margin-top:8px">¿Te faltó algo? El Presidente te pregunta antes de que empiece el consejo.</p>
    </div>
    <div class="guide-sec">
      <h4>Ejemplo</h4>
      <div class="example">
        <p><code>/mesa-de-socios</code> ${EXAMPLE.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>
        <button class="ghost" type="button" data-copy-example>Copiar este ejemplo</button>
      </div>
    </div>
    <div class="guide-sec">
      <h4>Conviene saber</h4>
      <ul>
        <li><span><b>Elige tu consejo:</b> el Presidente recomienda a los asesores que encajan con tu pregunta y te pide confirmar. Añade o quita a quien quieras.</span></li>
        <li><span><b>Consejo completo:</b> de 5 a 7 asesores, 3 rondas. Para decisiones grandes y difíciles de deshacer.</span></li>
        <li><span><b>Rápido:</b> añade <code>--quick</code> para 4 asesores y 2 rondas. Gasta mucho menos de tu plan.</span></li>
        <li><span><b>Cada consejo se guarda.</b> Abre Sesiones anteriores para repetir uno o descargar su PDF.</span></li>
        <li><span><b>Añade un asesor:</b> escribe <code>/nuevo-asesor</code> y un nombre. Cambia tu consejo por defecto con <code>/mesa-de-socios board</code>.</span></li>
      </ul>
    </div>
  </div>`;

const SHAPES = ["base", "open", "mid", "blink"];
// A seat's cartoon frames live in /portraits/<key>-<shape>.webp (or .png, .jpg). A seat added with /nuevo-asesor
// may have only a base frame, or none: missing frames fall back to the base frame, then to a
// drawn bust in the seat's color whose mouth and eyes still move.
const portrait = (key, shape = "base") => {
  const have = state.byKey[key]?.portraits || {};
  return have[shape] || have.base || drawnBust(key, shape);
};
const bustCache = new Map();
function drawnBust(key, shape) {
  const id = `${key}-${shape}`;
  if (bustCache.has(id)) return bustCache.get(id);
  const s = state.byKey[key] || {};
  const c = /^#[0-9a-f]{6}$/i.test(s.color || "") ? s.color : "#37bdf8";
  const initials = esc((s.initials || s.short || key).slice(0, 3).toUpperCase());
  const eyes = shape === "blink"
    ? `<path d="M226 250h30M304 250h30" stroke="#1d2733" stroke-width="7" stroke-linecap="round"/>`
    : `<circle cx="241" cy="250" r="11" fill="#1d2733"/><circle cx="319" cy="250" r="11" fill="#1d2733"/><circle cx="245" cy="246" r="3.5" fill="#fff"/><circle cx="323" cy="246" r="3.5" fill="#fff"/>`;
  const mouth = shape === "open" ? `<ellipse cx="280" cy="318" rx="24" ry="17" fill="#5a2430"/>`
    : shape === "mid" ? `<ellipse cx="280" cy="316" rx="20" ry="8" fill="#5a2430"/>`
    : `<path d="M256 312q24 16 48 0" fill="none" stroke="#5a2430" stroke-width="7" stroke-linecap="round"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560"><g transform="translate(-14 -64) scale(1.05)">
    <path d="M70 640c0-160 86-250 210-250s210 90 210 250z" fill="${c}"/>
    <path d="M232 384h96l-48 58z" fill="#e9eef3"/>
    <rect x="248" y="330" width="64" height="70" rx="22" fill="#d9b49a"/>
    <ellipse cx="280" cy="250" rx="112" ry="128" fill="#e8c4a8"/>
    <path d="M168 236c0-90 50-122 112-122s112 32 112 122c-20-46-60-64-112-64s-92 18-112 64z" fill="#3a4654"/>
    ${eyes}${mouth}
    <text x="280" y="540" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="54" fill="rgba(255,255,255,.92)">${initials}</text>
  </g></svg>`;
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  bustCache.set(id, url);
  return url;
}
const ROUND_NAME = ["", "Apertura", "Debate", "Votación"];

const state = {
  seats: [], byKey: {}, board: [], table: [], session: null, options: [], weights: {}, active: [], round: 0,
  cards: { 1: {}, 2: {}, 3: {} }, replaying: false, verdict: null, links: [], geo: {}, setup: null, wait: null,
};

// ------------------------------------------------------------- boot
async function boot() {
  const r = await refreshSeats();
  state.runner = r.runner;
  if (r.runner === "api" && !r.hasKey) toast("No se encontró ANTHROPIC_API_KEY en .env. Añádela y reinicia el servidor.");
  renderSeats(state.board);
  renderSamples();
  bindUI();
  new ResizeObserver(() => { layoutStage(); drawLinks(); }).observe($("#stage"));
  startBlinking();
  reset();
  typeIn($("#composer h2"));
  typeIn($("#waiting h2"));
  const ss = await fetch("/api/sessions").then((x) => x.json());
  if (ss.running) attach(ss.running);
  else if (ss.live) attach(ss.live);
  refreshUsage();
  setInterval(watchForLive, 2500);
  setInterval(tickWait, 1000);
}

// The roster (every seat, plus the default board) comes from the skill's roster.json.
async function refreshSeats() {
  const r = await fetch("/api/seats").then((x) => x.json());
  state.seats = r.seats;
  state.byKey = Object.fromEntries(r.seats.map((s) => [s.key, s]));
  state.board = (r.board?.default || []).filter((k) => state.byKey[k]);
  if (!state.board.length) state.board = r.seats.slice(0, 7).map((s) => s.key);
  bustCache.clear();
  return r;
}

// a council started in Claude Code shows up here on its own
const seenLive = new Set();
async function watchForLive() {
  const ss = await fetch("/api/sessions").then((x) => x.json()).catch(() => null);
  const id = ss?.live || ss?.running;
  if (!id || seenLive.has(id) || id === state.session) return;
  seenLive.add(id);
  attach(id);
}

// Arrival: a heading types in a character at a time, blur to sharp
function typeIn(el) {
  if (!el) return;
  const text = el.textContent;
  el.classList.add("typein");
  // characters sit inside a nowrap span per word, so lines only break between words
  let i = 0;
  el.innerHTML = text.split(" ").map((word) => `<span class="wd">${[...word].map((c) => `<span class="ch" style="animation-delay:${i++ * 22}ms">${esc(c)}</span>`).join("")}</span>`).join(" ");
  el.setAttribute("aria-label", text);
}

function renderSamples() {
  $("#samples").innerHTML = SAMPLES.map(([t], i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join("");
  $("#samples").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $("#prompt").value = SAMPLES[b.dataset.i][1];
    $("#prompt").focus();
  });
}

const MAX_TABLE = 9; // the most busts the table can seat and still read

/** Seat these keys at the table (roster order). Does nothing when they are already seated. */
function renderSeats(keys) {
  const order = state.seats.map((s) => s.key);
  const want = order.filter((k) => keys.includes(k)).slice(0, MAX_TABLE);
  if (want.join() === state.table.join() && $("#seats").children.length) return;
  state.table = want;
  const seats = want.map((k) => state.byKey[k]);
  $("#seats").innerHTML = seats.map((s, i) => `
    <div class="seat" id="seat-${s.key}" data-seat="${s.key}" style="--d:-${(i * 1.7) % 6}s" tabindex="0" role="button" aria-label="${esc(s.name)}, ${esc(s.pillar)}. Abrir tarjeta.">
      <div class="think" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="bust" data-shape="base">${SHAPES.map((sh) => `<img class="${sh}" src="${portrait(s.key, sh)}" alt="" draggable="false">`).join("")}</div>
    </div>`).join("");
  $("#plates").innerHTML = seats.map((s) => `
    <div class="nameplate" id="plate-${s.key}" data-seat="${s.key}">
      <b>${esc(s.short === "Gary V" ? "Gary V" : s.name)}</b>
      <small>${esc(s.pillar)}</small>
      <div class="meta"><span class="pips" title="Peso en esta decisión"></span><span class="chip" hidden></span><span class="score" hidden></span></div>
    </div>`).join("");
  layoutStage();
  startBlinking();
}

// The table is an ellipse seen from the front. Seats sit along its far edge: the
// middle seat is farthest (higher, smaller), the end seats nearest (lower, bigger).
function layoutStage() {
  const stage = $("#stage");
  const W = stage.clientWidth;
  const narrow = matchMedia("(max-width: 820px)").matches;
  const H = narrow ? Math.round(W * 0.62) : stage.clientHeight;
  const cx = W / 2, cy = H * (narrow ? 0.98 : 0.9), rx = W * 0.48, ry = H * (narrow ? 0.46 : 0.42);
  const t = $("#table");
  Object.assign(t.style, { left: `${cx - rx}px`, top: `${cy - ry}px`, width: `${rx * 2}px`, height: `${ry * 2}px` });
  const edge = (x) => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  // seats spread evenly along the far edge; past seven they shrink to fit
  const n = state.table.length;
  const xs = n === 1 ? [0.5] : state.table.map((_, i) => 0.085 + (0.83 * i) / (n - 1));
  const fit = Math.min(1, 6 / Math.max(1, n - 1));
  state.geo = {};
  state.table.forEach((k, i) => {
    const s = state.byKey[k];
    const x = W * xs[i];
    const d = ((x - cx) / rx) ** 2;
    const size = H * (narrow ? 0.5 + 0.08 * d : 0.37 + 0.07 * d) * fit;
    const bottom = edge(x) + size * 0.2;
    const el = $(`#seat-${s.key}`);
    Object.assign(el.style, { left: `${x - size / 2}px`, top: `${bottom - size}px`, width: `${size}px`, height: `${size}px`, zIndex: 10 + Math.round(d * 10) });
    const pl = $(`#plate-${s.key}`);
    pl.style.left = `${x}px`;
    pl.style.top = `${edge(x) + H * 0.01}px`; // straddles the table edge, over the chest
    state.geo[s.key] = { x, head: bottom - size * 0.72, top: bottom - size * 0.9, size };
  });
  const c = $("#center");
  if (narrow) {
    stage.style.paddingTop = `${H}px`; // the scene sits on top; captions flow below it
  } else {
    stage.style.paddingTop = "";
    // the captions start below the lowest nameplate they could collide with
    const inner = (n > 2 ? state.table.slice(1, -1) : state.table).map((k) => $(`#plate-${k}`));
    const top = Math.max(...inner.map((p) => p.offsetTop + p.offsetHeight / 2)) + H * 0.035;
    Object.assign(c.style, { left: `${W * 0.2}px`, width: `${W * 0.6}px`, top: `${top}px`, height: `${H - top - H * 0.09}px` });
  }
  const sp = state.speaking ? state.geo[state.speaking] : null;
  if (sp) moveSpot(state.speaking);
}

function moveSpot(key) {
  const g = state.geo[key]; const spot = $("#spot");
  if (!g) { spot.classList.remove("on"); return; }
  spot.style.left = `${g.x}px`;
  spot.style.top = `${g.head}px`;
  spot.style.width = spot.style.height = `${g.size * 1.9}px`;
  spot.classList.add("on");
}

function bindUI() {
  $("#composer").addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = $("#prompt").value.trim();
    if (prompt.length < 10) return toast("Dale al consejo una decisión real, al menos una frase.");
    const mode = $('input[name="mode"]:checked').value;
    $("#convene").disabled = true;
    const r = await fetch("/api/council", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, mode }) });
    const j = await r.json();
    $("#convene").disabled = false;
    if (!r.ok) return toast(j.error || "No se pudo iniciar el consejo.");
    attach(j.id);
  });
  const openFrom = (e) => { const b = e.target.closest("[data-seat]"); if (b) openCard(b.dataset.seat); };
  $("#seats").addEventListener("click", openFrom);
  $("#plates").addEventListener("click", openFrom);
  $("#seats").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFrom(e); } });
  $("#feed").addEventListener("click", (e) => { const c = e.target.closest(".feed-card"); if (c) openCard(c.dataset.seat, Number(c.dataset.round)); });
  $("#waitHistory").addEventListener("click", openHistory);
  $("#waitGuide").addEventListener("click", openGuide);
  $("#guideBtn").addEventListener("click", openGuide);
  document.addEventListener("click", async (e) => {
    if (e.target.closest("[data-copy-example]")) {
      try { await navigator.clipboard.writeText("/mesa-de-socios " + EXAMPLE); toast("Copiado. Pégalo en Claude Code."); }
      catch { toast("No se pudo copiar aquí. Selecciona el texto y cópialo."); }
    }
    if (e.target.closest("[data-pdf]")) savePdf(e.target.closest("[data-pdf]"));
  });
  $("#historyBtn").addEventListener("click", openHistory);
  $("#newBtn").addEventListener("click", reset);
  $("#verdictSheet").addEventListener("click", (e) => { if (e.target.id === "verdictSheet" || e.target.closest("[data-close]")) $("#verdictSheet").hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#verdictSheet").hidden = true; });
  // Clicking the dimmed backdrop around a card, the guide, or past sessions closes it (Escape already does).
  // Both press and release must land outside the box, so a text selection dragged out of it never closes it.
  $$("dialog.card-dialog").forEach((d) => {
    const outside = (e) => {
      const r = d.getBoundingClientRect();
      return e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
    };
    let pressedOutside = false;
    d.addEventListener("pointerdown", (e) => { pressedOutside = outside(e); });
    d.addEventListener("click", (e) => { if (pressedOutside && outside(e)) d.close(); pressedOutside = false; });
  });
  $$(".speed button").forEach((b) => b.addEventListener("click", () => {
    player.speed = Number(b.dataset.speed);
    $$(".speed button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  $("#skipBtn").addEventListener("click", () => player.skip());
}

// ------------------------------------------------------------- the player
// Every event goes through one ordered queue. Seats speak one at a time, at a
// readable pace, even though the API answers them in parallel. Skip ahead drains
// whatever is queued instantly; new events after that animate again.
const player = {
  q: [], busy: false, epoch: 0, speed: 1, fast: false, timers: new Set(),
  push(ev) { this.q.push(ev); this.info(); this.pump(); },
  async pump() {
    if (this.busy) return;
    this.busy = true;
    const my = this.epoch;
    while (this.q.length && my === this.epoch) {
      const ev = this.q.shift();
      this.info();
      hideWait();
      try { await handle(ev); } catch (e) { console.error(e); }
    }
    if (my === this.epoch) { this.busy = false; this.fast = false; this.info(); }
  },
  sleep(ms) {
    if (this.fast || ms <= 0) return Promise.resolve();
    return new Promise((res) => { const t = setTimeout(() => { this.timers.delete(o); res(); }, ms / this.speed); const o = { t, res }; this.timers.add(o); });
  },
  flushTimers() { for (const o of this.timers) { clearTimeout(o.t); o.res(); } this.timers.clear(); },
  skip() { this.fast = true; this.flushTimers(); },
  reset() { this.epoch++; this.q.length = 0; this.fast = true; this.flushTimers(); this.busy = false; this.fast = false; this.info(); },
  info() {
    const waiting = this.q.filter((e) => e.type === "seat_done").length;
    $("#queueInfo").textContent = waiting ? `${waiting} intervenciones en cola` : "";
  },
};

// ------------------------------------------------------------- session wiring
function reset() {
  state.es?.close();
  player.reset();
  Object.assign(state, { session: null, options: [], weights: {}, active: [], round: 0, cards: { 1: {}, 2: {}, 3: {} }, replaying: false, verdict: null, links: [], speaking: null, setup: null, wait: null });
  hideWait();
  $("#stage").classList.remove("live");
  $("#topic").hidden = true;
  $("#composer").hidden = state.runner !== "api";
  $("#waiting").hidden = state.runner === "api";
  $("#caption").hidden = true;
  $("#cruxes").hidden = true;
  $("#plate").hidden = true;
  $("#playbar").hidden = true;
  $("#newBtn").hidden = true;
  $("#verdictSheet").hidden = true;
  $("#panelHead").textContent = "Primeros pasos";
  $("#feed").innerHTML = GUIDE;
  $$(".vote").forEach((b) => b.remove());
  renderSeats(state.board);
  $$(".seat").forEach((el) => { el.classList.remove("absent", "speaking", "thinking", "addressed"); $(".bust", el).dataset.shape = "base"; });
  $$(".nameplate").forEach((el) => { el.classList.remove("absent", "speaking"); $(".chip", el).hidden = true; $(".score", el).hidden = true; $(".pips", el).innerHTML = ""; });
  $("#spot").classList.remove("on");
  $$(".stepper li").forEach((li) => li.classList.remove("active", "done"));
  drawLinks();
}

function begin(id) {
  reset();
  state.session = id;
  $("#composer").hidden = true;
  $("#waiting").hidden = true;
  $("#newBtn").hidden = false;
  $("#playbar").hidden = false;
  $("#panelHead").textContent = "Puntos clave";
  $("#feed").innerHTML = '<div class="empty">Una línea por asesor mientras habla el consejo. Haz clic en un asesor para leer su tarjeta completa.</div>';
  $("#stage").classList.add("live");
  chairSays("El consejo está tomando asiento", { dots: true });
}

function attach(id) {
  begin(id);
  const es = new EventSource(`/api/stream/${id}`);
  state.es = es;
  es.onmessage = (m) => {
    const ev = JSON.parse(m.data);
    if (ev.type === "end") { es.close(); refreshUsage(); return; }
    if (ev.type === "delta") return; // seats speak from their finished cards
    if (ev.type === "usage") return refreshUsage();
    if (ev.type === "seat_error") return toast(`${state.byKey[ev.seat].short} tuvo un error: ${ev.error}`);
    player.push(ev);
  };
  es.onerror = () => { /* the browser retries; the server replays from the start */ };
}

// ------------------------------------------------------------- event handling
const STEP_OF = { setup: "setup", round1: "round1", cruxes: "cruxes", round2: "round2", draft: "round3", round3: "round3", skip3: "round3", verdict: "verdict" };
const ORDER = ["setup", "round1", "cruxes", "round2", "round3", "verdict"];

function setStep(step) {
  const idx = ORDER.indexOf(step);
  $$(".stepper li").forEach((li) => {
    const i = ORDER.indexOf(li.dataset.step);
    li.classList.toggle("done", i < idx);
    li.classList.toggle("active", i === idx);
  });
}

async function handle(ev) {
  switch (ev.type) {
    case "phase": {
      state.wait = { phase: ev.phase, at: ev.at || Date.now() };
      setStep(STEP_OF[ev.phase] || "setup");
      feedPhase(ev.label);
      const thinking = ["setup", "cruxes", "draft", "verdict"].includes(ev.phase);
      if (thinking || ev.phase === "skip3") {
        chairSays(ev.label.replace(/^(The Chair is|El Presidente está) /, "").replace(/^./, (c) => c.toUpperCase()), { dots: thinking });
        await player.sleep(1400);
      }
      break;
    }
    case "setup": state.setup = ev; await onSetup(ev); await player.sleep(1800); break;
    case "round_start": onRoundStart(ev.round); break;
    case "seat_start": $(`#seat-${ev.seat}`)?.classList.add("thinking"); break;
    case "seat_done": await onSeatDone(ev); break;
    case "round_done": state.wait = null; updateOptions(ev.scores); break;
    case "cruxes": await onCruxes(ev); break;
    case "draft": await onDraft(ev.draft); break;
    case "verdict": state.wait = null; onVerdict(ev); break;
    case "error": state.wait = null; toast(`El consejo se detuvo: ${ev.error}`); chairSays(`El consejo se detuvo: ${ev.error}`); break;
  }
}

async function onSetup(ev) {
  if (ev.seats.some((k) => !state.byKey[k])) await refreshSeats(); // a seat added since the page loaded
  // seat the default board plus anyone this council called in; past the table's limit, only this council
  const both = [...new Set([...state.board, ...ev.seats])];
  renderSeats(both.length <= MAX_TABLE ? both : ev.seats);
  state.options = ev.options;
  state.weights = ev.weights;
  state.active = ev.seats;
  $("#topic").hidden = false;
  $("#topicTitle").textContent = ev.title;
  typeIn($("#topicTitle"));
  $("#options").innerHTML = ev.options.map((o) => `
    <div class="opt" data-opt="${o.id}"><span class="id">${o.id}</span><span class="label">${esc(o.label)}</span><span class="val">-</span><span class="bar"><i></i></span></div>`).join("");
  for (const s of state.table.map((k) => state.byKey[k])) {
    const absent = !ev.seats.includes(s.key);
    $(`#seat-${s.key}`).classList.toggle("absent", absent);
    const pl = $(`#plate-${s.key}`);
    pl.classList.toggle("absent", absent);
    const w = ev.weights[s.key]?.weight || 1;
    pl.title = `Peso ${w} de 3: ${ev.weights[s.key]?.reason || ""}`;
  }
  chairSays(ev.title, { tag: ev.mode === "quick" ? "Consejo rápido" : "Consejo completo" });
}

function updateOptions(scores) {
  const best = Object.entries(scores).sort((a, b) => (b[1].score ?? 0) - (a[1].score ?? 0))[0]?.[0];
  for (const [id, v] of Object.entries(scores)) {
    const el = $(`.opt[data-opt="${id}"]`); if (!el) continue;
    $(".val", el).textContent = v.score ?? "-";
    $(".bar i", el).style.width = `${(v.score || 0) * 10}%`;
    el.classList.toggle("lead", id === best);
    el.title = v.math;
  }
}

function onRoundStart(round) {
  state.round = round;
  state.links = [];
  drawLinks();
  $("#cruxes").hidden = true;
  chairSays(`${["", "Ronda 1: posiciones iniciales", "Ronda 2: el debate", "Ronda 3: la votación"][round]}`, { dots: true, tag: "Se abre la palabra" });
}

// ------------------------------------------------------------- talking
const clean = (t) => String(t || "").replace(/\s*\((?:S\d+|source[^)]*)[^)]*\)/gi, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function firstSentences(t, max) {
  const parts = t.match(/[^.!?]+[.!?]+["”)]?\s*|[^.!?]+$/g) || [t];
  let out = "";
  for (const p of parts) { if (out && (out + p).length > max) break; out += p; }
  return shorten(out.trim(), max + 40);
}

/** The line a seat says out loud: the headline of its card, not the whole card. */
function lineFor(round, p, max = 170) {
  if (round === 1) return firstSentences(clean(p.call || p.stance), max);
  if (round === 2) {
    let t = clean(p.disagreeLine || p.stance);
    // "Graham. His argument..." reads as talking to him: "Graham, his argument..."
    t = t.replace(/^([A-Za-z][\w.' ]{0,24})[.:,]\s+(\S+)/, (m, name, next) => !seatKey(name) ? m : `${state.byKey[seatKey(name)].short}, ${/^I('|$)/.test(next) ? next : next[0].toLowerCase() + next.slice(1)}`);
    return firstSentences(t, max);
  }
  return firstSentences(clean(p.oneLine || p.amendment), max);
}

function shapesFor(word) {
  const out = [];
  for (const ch of word.toLowerCase()) {
    const s = "aei".includes(ch) ? "open" : "ouwy".includes(ch) ? "mid" : "mbpf".includes(ch) ? "base" : null;
    if (s && s !== out[out.length - 1]) out.push(s);
  }
  return out.length ? out : ["mid"];
}

function setShape(key, shape) { const b = $(`#seat-${key} .bust`); if (b) b.dataset.shape = shape; }

function setSpeaker(key, target) {
  state.speaking = key;
  $$(".seat").forEach((el) => { el.classList.toggle("speaking", el.dataset.seat === key); el.classList.toggle("addressed", el.dataset.seat === target); });
  $$(".nameplate").forEach((el) => el.classList.toggle("speaking", el.dataset.seat === key));
  const el = key && $(`#seat-${key}`);
  if (el) {
    el.classList.remove("thinking");
    // lean toward whoever they're answering
    const g = state.geo[key], tg = target && state.geo[target];
    el.style.transform = tg ? `translateX(${Math.sign(tg.x - g.x) * g.size * 0.04}px) rotate(${Math.sign(tg.x - g.x) * 2.5}deg) scale(1.05)` : "scale(1.05)";
    moveSpot(key);
  } else $("#spot").classList.remove("on");
  $$(".seat").forEach((s) => { if (s.dataset.seat !== key) s.style.transform = ""; });
}

function captionFor(who) {
  $("#cruxes").hidden = true;
  $("#plate").hidden = true;
  const c = $("#caption");
  c.hidden = false;
  c.style.animation = "none"; void c.offsetWidth; c.style.animation = "";
  const s = state.byKey[who];
  $("#capAv").className = `cap-av${s ? "" : " chair"}`;
  $("#capAv").innerHTML = s ? `<img src="${portrait(who)}" alt="">` : "<span>P</span>";
  $("#capWho").textContent = s ? s.name : "El Presidente";
}

function chairSays(text, { dots = false, tag = "" } = {}) {
  setSpeaker(null);
  captionFor(null);
  $("#capTag").textContent = tag;
  const p = $("#capText");
  p.className = "cap-text chair";
  p.innerHTML = esc(text) + (dots ? '<span class="dots"><i></i><i></i><i></i></span>' : "");
  $("#capSub").textContent = "";
}

async function speak(key, text, { tag = "", target = null, sub = "" } = {}) {
  setSpeaker(key, target);
  captionFor(key);
  $("#capTag").textContent = tag;
  $("#capSub").textContent = "";
  const p = $("#capText");
  p.className = "cap-text";
  const words = text.split(" ").filter(Boolean);
  p.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span> `).join("");
  const spans = $$(".w", p);
  for (let i = 0; i < words.length; i++) {
    if (player.fast) break;
    const w = words[i];
    spans[i].classList.add("on");
    const shapes = shapesFor(w.normalize("NFD").replace(/[^a-z]/gi, ""));
    const dur = Math.max(170, w.length * 52);
    const per = dur / (shapes.length + 1);
    for (const sh of shapes) { setShape(key, sh); await player.sleep(per); }
    setShape(key, "base");
    await player.sleep(per + (/[.!?]["”)]?$/.test(w) ? 340 : /[,;:]$/.test(w) ? 170 : 25));
  }
  spans.forEach((s) => s.classList.add("on"));
  setShape(key, "base");
  $("#capSub").innerHTML = sub;
  await player.sleep(1300);
}

// idle blinking for everyone, so the room feels alive between lines
const blinking = new Set();
function startBlinking() {
  const blink = (key) => {
    const b = $(`#seat-${key} .bust`);
    if (b && b.dataset.shape === "base") {
      b.dataset.shape = "blink";
      setTimeout(() => { if (b.dataset.shape === "blink") b.dataset.shape = "base"; }, 130);
    }
    setTimeout(() => blink(key), 2400 + Math.random() * 4200);
  };
  state.table.filter((k) => !blinking.has(k)).forEach((k, i) => { blinking.add(k); setTimeout(() => blink(k), 600 + i * 530); });
}

async function onSeatDone(ev) {
  const { round, seat, text, parsed, quotes } = ev;
  state.cards[round][seat] = { text, parsed, quotes };
  const s = state.byKey[seat];
  const top = topOption(parsed.optionScores);
  const line = lineFor(round, parsed);
  let tag = ROUND_NAME[round], sub = "", target = null;
  if (round === 1) {
    tag = `${stanceWord(parsed.stance)}${top ? ` · apoya ${top.id} (${top.v}/10)` : ""}`;
  } else if (round === 2) {
    const tgt = parsed.disagreeWith ? state.byKey[parsed.disagreeWith] : null;
    if (tgt) {
      target = tgt.key;
      tag = `Rebate a ${tgt.short}`;
      state.links = state.links.filter((l) => l.from !== seat);
      state.links.push({ from: seat, to: tgt.key });
      drawLinks();
    }
    sub = movedYes(parsed.moved) ? "Cambió de postura" : "";
  } else {
    const v = parsed.vote || "endorse";
    tag = `Vota: ${voteWord(v)}`;

  }
  feedCard(round, seat, parsed);
  await speak(seat, line || "Lo dejo en mi tarjeta.", { tag, target, sub });

  const pl = $(`#plate-${seat}`);
  const chip = $(".chip", pl);
  chip.hidden = round === 3; // the vote stamp says it
  chip.className = "chip";
  if (round === 3) {
    const v = parsed.vote || "endorse";
    chip.textContent = voteWord(v);
    chip.classList.add(v);
    $(`#seat-${seat} .vote`)?.remove();
    const stamp = document.createElement("div");
    stamp.className = `vote ${v}`;
    stamp.textContent = voteWord(v).toUpperCase();
    $(`#seat-${seat}`).appendChild(stamp);
  } else chip.textContent = stanceWord(parsed.stance);
  if (top) { const sc = $(".score", pl); sc.hidden = false; sc.textContent = `${top.id} ${top.v}`; sc.title = `Puntuación más alta: opción ${top.id}`; }
  setSpeaker(null);
  void s;
}

function topOption(scores = {}) {
  const e = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return e ? { id: e[0], v: e[1] } : null;
}
const shorten = (t, n) => (t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : t);
const face = (k) => `<img src="${portrait(k)}" alt="${esc(state.byKey[k]?.short || k)}" title="${esc(state.byKey[k]?.short || k)}">`;

async function onCruxes(ev) {
  setSpeaker(null);
  $("#caption").hidden = true;
  const c = $("#cruxes");
  c.hidden = false;
  c.innerHTML = `<div class="head">${ev.unanimous ? "Demasiado acuerdo. El Presidente insiste." : "En qué no están de acuerdo"}</div>` +
    ev.cruxes.map((x, i) => `<div class="crux" style="animation-delay:${i * 0.18}s"><b>${esc(x.question)}</b><div class="sides">${x.sides.map((sd) => `<span class="side"><span class="faces">${sd.seats.filter((k) => state.byKey[k]).map(face).join("")}</span>${esc(shorten(sd.position, 48))}</span>`).join("")}</div></div>`).join("");
  const f = document.createElement("div");
  f.className = "feed-note";
  f.innerHTML = `<b>El desacuerdo:</b> ${ev.cruxes.map((x) => esc(x.question)).join(" ")}`;
  feedAppend(f);
  await player.sleep(3500 + 1800 * ev.cruxes.length);
}

async function onDraft(d) {
  chairSays(`Propuesta: ${verdictLabel(d.label)} con la opción ${d.option}. ${firstSentences(clean(d.recommendation), 140)}`, { tag: "A votación" });
  const f = document.createElement("div");
  f.className = "feed-note";
  f.innerHTML = `<b>A votación:</b> ${esc(verdictLabel(d.label))} con la opción ${esc(d.option)}.`;
  feedAppend(f);
  await player.sleep(4200);
}

// ------------------------------------------------------------- rebuttal arcs
function drawLinks() {
  const svg = $("#links");
  const stage = $("#stage");
  const w = stage.clientWidth, h = stage.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const links = state.links || [];
  const col = "#38bdf8";
  svg.innerHTML = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${col}"/></marker></defs>` +
    links.map(({ from, to }, i) => {
      const a = state.geo[from], b = state.geo[to];
      if (!a || !b) return "";
      const y1 = a.top - 6, y2 = b.top - 6;
      const mx = (a.x + b.x) / 2, my = Math.min(y1, y2) - Math.min(90, Math.abs(a.x - b.x) * 0.22) - 10;
      return `<path class="${i < links.length - 1 ? "old" : ""}" d="M${a.x},${y1} Q${mx},${my} ${b.x},${y2}" stroke="${col}" marker-end="url(#arrow)"/>`;
    }).join("");
}

// ------------------------------------------------------------- feed + cards
function feedAppend(node) {
  const feed = $("#feed");
  $(".empty", feed)?.remove();
  feed.appendChild(node);
  feed.scrollTop = feed.scrollHeight;
}
function feedPhase(label) {
  const d = document.createElement("div");
  d.className = "feed-phase";
  d.textContent = label.replace(/^(The Chair is|El Presidente está) /, "Presidente: ");
  feedAppend(d);
}
function feedCard(round, seat, parsed) {
  const s = state.byKey[seat];
  const d = document.createElement("div");
  d.className = "feed-card";
  d.dataset.seat = seat;
  d.dataset.round = round;
  const top = topOption(parsed.optionScores);
  const tgt = parsed.disagreeWith ? state.byKey[parsed.disagreeWith]?.short : "";
  const what = round === 1 ? `${stanceWord(parsed.stance)}${top ? `, apoya ${top.id}` : ""}` : round === 2 ? (tgt ? `vs ${tgt}` : "Debate") : `Vota: ${voteWord(parsed.vote || "endorse")}`;
  d.innerHTML = `<img class="av" src="${portrait(seat)}" alt=""><div><div class="h">${esc(s.short)}<span class="r">${esc(what)}</span></div><p>${esc(lineFor(round, parsed, 105))}</p></div>`;
  feedAppend(d);
}

function openCard(seat, round) {
  const s = state.byKey[seat];
  const rounds = [3, 2, 1].filter((r) => state.cards[r][seat]);
  const r = round || rounds[0];
  const c = state.cards[r]?.[seat];
  $("#cardBody").innerHTML = `
    <div class="card-head"><img src="${portrait(seat)}" alt=""><div><div class="label">${esc(s.pillar)}</div><h3>${esc(s.name)}</h3><p class="muted" style="margin:0">Su pregunta: ${esc(s.question)}</p></div></div>
    ${rounds.length > 1 ? `<p style="margin:0 0 6px">${rounds.slice().reverse().map((x) => `<button class="ghost" data-r="${x}" style="margin-right:6px">${ROUND_NAME[x]}</button>`).join("")}</p>` : ""}
    ${c ? `<pre>${esc(c.text)}</pre>${c.quotes.length ? `<ul class="qcheck">${c.quotes.map((q) => `<li class="${q.verified ? "" : "bad"}">"${esc(shorten(q.quote, 110))}" (${q.source}) ${q.verified ? "verificada en el cerebro" : "no encontrada en el cerebro"}</li>`).join("")}</ul>` : ""}` : `<p class="muted">Este asesor aún no ha hablado.</p>`}
    <p class="muted" style="font-size:12px">Asesor simulado a partir del trabajo público de ${esc(s.name)}. No es la persona.</p>`;
  $$("#cardBody [data-r]").forEach((b) => b.addEventListener("click", () => openCard(seat, Number(b.dataset.r))));
  const dlg = $("#cardDialog");
  if (!dlg.open) dlg.showModal();
}

// ------------------------------------------------------------- verdict
// the Chair should write display names; map any raw seat key just in case
const seatKey = (x) => { const k = String(x).toLowerCase().replace(/\s+/g, ""); return state.byKey[k] ? k : state.seats.find((s) => s.short.toLowerCase() === String(x).toLowerCase() || s.name.toLowerCase() === String(x).toLowerCase())?.key; };
const seatName = (x) => state.byKey[seatKey(x)]?.short || x;

const labelClass = labelKind;

function onVerdict(ev) {
  const v = ev.verdict;
  state.verdict = ev;
  setStep("verdict");
  setSpeaker(null);
  $("#caption").hidden = true;
  $("#cruxes").hidden = true;
  state.links = [];
  drawLinks();
  $("#stage").classList.remove("live");
  updateOptions(v.scores);
  const opt = (id) => state.options.find((o) => o.id === id)?.label || id;
  const seats = ev.seats;
  const mk = seatKey(v.minority.seat);
  const short = (t, n) => esc(shorten(clean(t || ""), n));
  const html = `
    <div class="v-top">
      <div><div class="label">El veredicto del consejo</div><span class="v-label ${labelClass(v.label)}">${esc(verdictLabel(v.label))}</span></div>
      <div class="actions"><button class="pill" type="button" data-pdf>Descargar PDF</button><button class="ghost" data-close>Volver a la mesa</button></div>
    </div>
    <p class="v-call">${esc(v.call)}</p>
    <div class="v-grid">
      <div class="v-sec"><h3>Puntuaciones</h3><div class="v-opts">${state.options.map((o) => `
        <div class="opt ${o.id === v.recommended ? "lead" : ""}"><span class="id">${o.id}</span><span class="label">${esc(o.label)}</span><span class="val">${v.scores[o.id]?.score ?? "-"}</span><span class="bar"><i style="width:${(v.scores[o.id]?.score || 0) * 10}%"></i></span></div>`).join("")}</div>
        <p class="v-meta">Confianza ${v.confidence ?? "-"}/10${v.votes ? ` · ${v.votes.endorse || 0} respaldan, ${v.votes.amend || 0} enmiendan, ${v.votes.dissent || 0} disienten` : ""}</p>
      </div>
      <div class="v-sec"><h3>Por qué</h3><ul class="v-why">${v.why.slice(0, 3).map((w) => { const k = seatKey(w.seat); return `<li>${k ? `<img class="av" src="${portrait(k)}" alt="">` : ""}<span>${short(w.point, 150)}</span></li>`; }).join("")}</ul></div>
      <div class="v-sec"><h3>Ojo con esto</h3><div class="minority"><div class="who">${mk ? `<img class="av" src="${portrait(mk)}" alt="">` : ""}${esc(seatName(v.minority.seat))}</div><q>${short(v.minority.quote, 170)}</q></div></div>
      <div class="v-sec"><h3>Próximos pasos</h3><ul class="v-steps">${v.next_steps.slice(0, 3).map((n) => `<li><b>${esc(n.when)}</b> ${short(n.action, 120)}</li>`).join("")}</ul>
        <p class="v-meta"><b>Abandónalo si:</b> ${short(v.kill_criteria, 140)}</p></div>
    </div>
    <details class="v-more"><summary>Detalle completo</summary>
      <div class="v-grid">
        <div class="v-sec"><h3>Dónde chocaron</h3><ul>${v.fights.map((f) => `<li><b>${esc(f.crux)}</b> ${esc(f.story)}</li>`).join("")}</ul></div>
        <div class="v-sec"><h3>Condiciones</h3><ol>${v.conditions.map((c) => `<li>${esc(c)}</li>`).join("")}</ol></div>
        <div class="v-sec v-wide"><h3>Tabla de puntuaciones</h3>
          <table class="scorecard"><thead><tr><th>Asesor</th><th>Peso</th>${state.options.map((o) => `<th>${o.id}</th>`).join("")}<th>Su frase</th></tr></thead><tbody>
          ${seats.map((x) => { const s = state.byKey[x.key]; return `<tr><td><span class="who"><img class="av" src="${portrait(x.key)}" alt="">${esc(s.short)}</span></td><td class="n">${x.weight}</td>${state.options.map((o) => `<td class="n">${x.optionScores?.[o.id] ?? "-"}</td>`).join("")}<td class="line">${short(x.oneLine, 150)}</td></tr>`; }).join("")}
          </tbody></table>
          <p class="muted" style="font-size:11.5px;margin-top:8px">Ponderado según cuánto importa aquí el pilar de cada asesor. ${state.options.map((o) => `${o.id}: ${esc(v.scores[o.id]?.math || "")}`).join(" · ")}</p></div>
        <div class="v-sec"><h3>La prueba más barata</h3><p>${esc(v.cheapest_test)}</p><h3>Revisar</h3><p>${esc(v.revisit)}</p></div>
        <div class="v-sec"><h3>La objeción más fuerte, completa</h3><p>${esc(v.minority.quote)}</p><p class="muted">Para que tenga razón: ${esc(v.minority.would_have_to_be_true)}</p></div>
        ${v.amendments?.length ? `<div class="v-sec v-wide"><h3>Enmiendas</h3><ul>${v.amendments.map((a) => `<li><b>${esc(seatName(a.seat))}:</b> ${esc(a.amendment)} <span class="tag">${a.adopted ? "Adoptada" : "No adoptada"}: ${esc(a.reason)}</span></li>`).join("")}</ul></div>` : ""}
      </div>
    </details>
    <div class="v-foot"><span class="muted">${esc(v.disclaimer)}</span><button class="ghost" data-close>Volver a la mesa</button></div>`;
  $("#verdictBody").innerHTML = html;
  const plate = $("#plate");
  plate.hidden = false;
  plate.innerHTML = `<div class="label">El veredicto del consejo</div><span class="v-label ${labelClass(v.label)}">${esc(verdictLabel(v.label))}</span><p>${esc(firstSentences(clean(v.call), 150))}</p><div class="row"><button type="button" id="plateOpen">Leer el veredicto</button><button type="button" data-pdf>Descargar PDF</button><button type="button" class="alt" id="plateReplay">Repetir este consejo</button></div>`;
  $("#plateOpen").addEventListener("click", () => ($("#verdictSheet").hidden = false));
  $("#plateReplay").addEventListener("click", () => replay(state.session));
  $("#playbar").hidden = true;
  const f = document.createElement("div");
  f.className = "feed-note";
  f.innerHTML = `<b>Veredicto: ${esc(verdictLabel(v.label))}.</b> ${esc(firstSentences(clean(v.call), 160))}`;
  feedAppend(f);
  setTimeout(() => { if (state.verdict === ev) $("#verdictSheet").hidden = false; }, 1600);
}

// ------------------------------------------------------------- history + replay
const MODE_ES = { full: "completo", quick: "rápido" };
const STATUS_ES = { done: "terminado", running: "en curso", stopped: "detenido", error: "con error" };
async function openHistory() {
  const { sessions } = await fetch("/api/sessions").then((x) => x.json());
  $("#historyList").innerHTML = sessions.length
    ? sessions.map((s) => `<li><button data-id="${esc(s.id)}"><b>${esc(s.title)}</b><small>${esc(s.id.slice(0, 10))} · ${esc(MODE_ES[s.mode] || s.mode)} · ${esc(STATUS_ES[s.status] || s.status)}</small></button>${s.status === "done" ? `<button class="pdf" type="button" data-pdf="${esc(s.id)}" title="Descargar el veredicto en PDF">PDF</button>` : ""}</li>`).join("")
    : '<li class="muted">Aún no hay sesiones. Convoca al consejo una vez y aparecerá aquí.</li>';
  $$("#historyList button[data-id]").forEach((b) => b.addEventListener("click", () => { $("#historyDialog").close(); replay(b.dataset.id); }));
  $("#historyDialog").showModal();
}

async function replay(id) {
  const j = await fetch(`/api/sessions/${encodeURIComponent(id)}`).then((x) => x.json());
  begin(id);
  state.replaying = true;
  for (const ev of j.events) {
    if (["delta", "usage", "seat_error", "end"].includes(ev.type)) continue;
    player.push(ev);
  }
}

// ------------------------------------------------------------- waiting on Claude Code
// A live council goes quiet for minutes while the seats write in parallel. Instead of a
// frozen table, say what is happening, how long it has been, and what each seat is weighing.
const SAME_TIME = "Los asesores escriben todos a la vez en Claude Code. Sus intervenciones aparecen aquí en cuanto termina la ronda.";
function waitCopy(phase) {
  const n = state.setup?.mode === "quick" ? 2 : 3;
  return {
    setup: ["Preparando la mesa", "El Presidente está sentando al consejo.", ""],
    round1: ["Ronda 1 de " + n, "Los asesores están escribiendo sus posiciones iniciales.", SAME_TIME],
    round2: ["Ronda 2 de " + n, "Los asesores están leyendo las aperturas de los demás y respondiendo.", SAME_TIME],
    round3: ["Ronda 3 de " + n, "Los asesores están votando la propuesta del Presidente.", SAME_TIME],
    cruxes: ["Entre rondas", "El Presidente está leyendo las aperturas y buscando en qué discrepan.", "Aquí aparece primero el desacuerdo, y luego empieza el debate."],
    draft: ["Entre rondas", "El Presidente está convirtiendo el debate en una propuesta para votar.", "Después, cada asesor la vota."],
    skip3: ["Último paso", "El Presidente está puntuando la sala y escribiendo el veredicto.", "Cuando llegue, podrás descargarlo en PDF."],
    verdict: ["Último paso", "El Presidente está puntuando la sala y escribiendo el veredicto.", "Cuando llegue, podrás descargarlo en PDF."],
  }[phase] || ["Trabajando", "El consejo está trabajando.", ""];
}
const clock = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

function hideWait() {
  const w = $("#waitcard");
  if (w.hidden) return;
  w.hidden = true;
  $$(".seat.musing").forEach((e) => e.classList.remove("musing"));
  if (state.capWasShown) $("#caption").hidden = false;
  if (state.playbarWasShown) $("#playbar").hidden = false;
}

function tickWait() {
  const w = state.wait;
  const idle = !player.busy && !player.q.length;
  if (!w || !idle || state.replaying || !state.session || state.verdict) return hideWait();
  const card = $("#waitcard");
  if (card.hidden) {
    state.capWasShown = !$("#caption").hidden;
    $("#caption").hidden = true;
    $("#cruxes").hidden = true;
    // speed controls do nothing while the room waits, and they would cover the card
    state.playbarWasShown = !$("#playbar").hidden;
    $("#playbar").hidden = true;
    card.hidden = false;
    state.museAt = 0;
  }
  const [step, head, sub] = waitCopy(w.phase);
  const elapsed = Date.now() - w.at;
  $("#wcStep").textContent = step;
  $("#wcTime").textContent = clock(elapsed);
  $("#wcHead").textContent = head;
  $("#wcSub").textContent = sub;
  $("#wcNudge").hidden = elapsed < 4 * 60 * 1000;
  const round = Number((w.phase.match(/^round(\d)$/) || [])[1]) || 0;
  const bar = $("#wcBar").parentElement;
  const muse = $("#wcMuse");
  if (round) {
    const seats = state.active.length ? state.active : state.table;
    const done = seats.filter((k) => state.cards[round][k]).length;
    bar.classList.toggle("indeterminate", done === 0);
    $("#wcBar").style.width = done ? Math.round((done / seats.length) * 100) + "%" : "";
    // every few seconds, show what one of the still-thinking seats is weighing
    const pending = seats.filter((k) => !state.cards[round][k]);
    if (pending.length && Date.now() - (state.museAt || 0) > 5200) {
      state.museAt = Date.now();
      state.museIdx = ((state.museIdx ?? -1) + 1) % pending.length;
      const s = state.byKey[pending[state.museIdx]];
      muse.classList.add("fade");
      setTimeout(() => {
        muse.innerHTML = "<b>" + esc(s.short) + "</b> está sopesando: " + esc(s.question.replace(/^(¿?)(.)/, (m, q, c) => q + c.toLowerCase())) + (done ? " · " + done + " de " + seats.length + " listos" : "");
        muse.classList.remove("fade");
        $$(".seat").forEach((el) => el.classList.toggle("musing", el.dataset.seat === s.key));
      }, 300);
    }
  } else {
    bar.classList.add("indeterminate");
    $("#wcBar").style.width = "";
    muse.textContent = "";
    $$(".seat.musing").forEach((e) => e.classList.remove("musing"));
  }
}

function openGuide() {
  $("#guideBody").innerHTML = GUIDE;
  const d = $("#guideDialog");
  if (!d.open) d.showModal();
}

// ------------------------------------------------------------- PDF
async function savePdf(btn) {
  const id = btn.dataset.pdf;
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = "Generando PDF...";
  try {
    let setup = state.setup, verdict = state.verdict;
    if (id) { // a past session from the history list
      const j = await fetch("/api/sessions/" + encodeURIComponent(id)).then((x) => x.json());
      setup = j.events.find((e) => e.type === "setup");
      verdict = [...j.events].reverse().find((e) => e.type === "verdict");
    }
    if (!setup || !verdict) throw new Error("Este consejo aún no tiene veredicto.");
    await downloadVerdictPdf({ setup, verdict, byKey: state.byKey, id: id || state.session });
  } catch (e) {
    console.error(e);
    toast("No se pudo generar el PDF: " + (e.message || e));
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

// ------------------------------------------------------------- misc
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 6000);
}
async function refreshUsage() {
  const u = await fetch("/api/usage").then((x) => x.json()).catch(() => null);
  if (!u || !u.calls) { $("#usage").textContent = ""; return; }
  const k = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1000)}k`);
  $("#usage").textContent = `${u.calls} llamadas · ${k(u.input + u.cacheRead + u.cacheWrite)} entrada · ${k(u.output)} salida`;
}

boot();
