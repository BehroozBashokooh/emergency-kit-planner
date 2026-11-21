/* Emergency Kit Planner – app logic (no dependencies, no tracking, no server). */
(function () {
  "use strict";

  const STORE_KEY = "ekp-v1";
  const $ = (id) => document.getElementById(id);

  /* ---------- state ---------- */
  function detectLang() {
    const n = (navigator.language || "en").toLowerCase();
    if (n.startsWith("fa") || n.startsWith("prs")) return "fa";
    if (n.startsWith("nl")) return "nl";
    if (n.startsWith("de")) return "de";
    if (n.startsWith("fr")) return "fr";
    return "en";
  }
  function detectCountry(lang) {
    const n = (navigator.language || "").toUpperCase();
    const region = n.split("-")[1];
    if (region && COUNTRIES[region]) return region;
    return { de: "DE", fr: "FR" }[lang] || "NL";
  }
  const perCountry = (f) => Object.fromEntries(Object.keys(COUNTRIES).map((k) => [k, f(k)]));

  const defaults = () => {
    const lang = detectLang();
    return {
      lang,
      country: detectCountry(lang),
      adults: 2, seniors: 0, children: 0, babies: 0, pets: 0, needs: {},
      days: perCountry((k) => COUNTRIES[k].defaultDays),
      have: perCountry(() => ({})),
    };
  };

  function load() {
    let s = defaults();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) s = Object.assign(s, JSON.parse(raw));
    } catch (e) { /* storage unavailable – fine */ }
    // URL parameters (shared links) override saved settings
    const q = new URLSearchParams(location.search);
    if (LANGS[q.get("lang")]) s.lang = q.get("lang");
    if (COUNTRIES[q.get("country")]) s.country = q.get("country");
    const num = (k, min, max) => {
      const v = parseInt(q.get(k), 10);
      return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : null;
    };
    const a = num("a", 0, 20), sn = num("s", 0, 20), c = num("c", 0, 20), b = num("b", 0, 10), p = num("p", 0, 20), d = num("d", 1, 60);
    if (a !== null) s.adults = a;
    if (sn !== null) s.seniors = sn;
    if (q.get("n")) { s.needs = {}; q.get("n").split(",").forEach((k) => { if (NEEDS.includes(k)) s.needs[k] = true; }); }
    if (c !== null) s.children = c;
    if (b !== null) s.babies = b;
    if (p !== null) s.pets = p;
    if (d !== null) s.days[s.country] = d;
    s.needs = s.needs || {};
    if (s.adults + (s.seniors || 0) < 1) s.adults = 1;
    s.have = s.have || {};
    s.days = s.days || {};
    Object.keys(COUNTRIES).forEach((k) => {
      s.have[k] = s.have[k] || {};
      if (!Number.isFinite(s.days[k])) s.days[k] = COUNTRIES[k].defaultDays;
    });
    if (!COUNTRIES[s.country]) s.country = "NL";
    if (!LANGS[s.lang]) s.lang = "en";
    return s;
  }

  let S = load();
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} };

  const ctx = () => ({
    country: S.country,
    days: S.days[S.country],
    adults: S.adults, seniors: S.seniors, children: S.children, babies: S.babies, pets: S.pets,
    needs: S.needs,
    grown: S.adults + S.seniors,
    persons: S.adults + S.seniors + S.children + S.babies,
    eaters: S.adults + S.seniors + S.children,
  });

  /* ---------- formatting ---------- */
  const t = () => T[S.lang];
  const nf = (n) => new Intl.NumberFormat(LANGS[S.lang].locale, { maximumFractionDigits: 1 }).format(n);

  function fmtQty(q) {
    if (!q) return "";
    const L = t(), n = nf(q.n);
    switch (q.unit) {
      case "L": return `${n} ${L.u_L}`;
      case "kg": return `${n} ${L.u_kg}`;
      case "CUR": {
        const cur = COUNTRIES[S.country].currency;
        if (cur === "EUR") return S.lang === "fa" ? `${n} ${L.u_EUR}` : `€ ${n}`;
        return `${cur} ${n}`;
      }
      case "pcs": return S.lang === "fa" ? `${n} ${L.u_pcs}` : `${n}${L.u_pcs}`;
      case "pack": return `${n} ${q.n === 1 ? L.u_pack : L.u_packs}`;
      case "roll": return `${n} ${L.u_roll}`;
      case "rolls": return `${n} ${L.u_rolls}`;
      case "set": return `${n} ${L.u_set}`;
      case "pair": return `${n} ${L.u_pair}`;
      case "days": return `${n} ${L.u_days}`;
      default: return `${n} ${q.unit}`;
    }
  }

  function badge(src) {
    const L = t();
    if (src === "gov") return `<span class="badge gov">${L["badge_gov_" + S.country]}</span>`;
    if (src === "ref") return `<span class="badge">${L.badge_ref}</span>`;
    return `<span class="badge">${L.badge_tip}</span>`;
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  function visibleItems() {
    const c = ctx();
    return ITEMS.filter((it) => it.src[S.country] && (!it.show || it.show(c)));
  }

  /* ---------- render ---------- */
  function renderStatic() {
    const L = t();
    document.documentElement.lang = S.lang;
    document.documentElement.dir = LANGS[S.lang].dir;
    document.body.dir = LANGS[S.lang].dir;
    document.title = L.title;
    ["title", "subtitle", "language", "country", "step1", "step2", "step3", "step3Help", "step4", "step5", "sources", "promptLabel"]
      .forEach((k) => { const el = $("t_" + k); if (el) el.textContent = L[k]; });
    $("aiIntro").textContent = L.aiIntro;
    $("aiNote").textContent = L.aiNote;
    $("aiGeminiNote").textContent = L.aiGeminiNote;
    $("btnClaude").textContent = L.openClaude;
    $("btnChatGPT").textContent = L.openChatGPT;
    $("btnGemini").textContent = L.openGemini;
    $("copyBtn").textContent = L.copy;
    $("shareBtn").textContent = L.share;
    $("printBtn").textContent = L.print;
    $("resetBtn").textContent = L.reset;
    $("linkBtn").textContent = L.shareLink;
    $("reviewTip").textContent = L.reviewTip;
    $("disclaimer").textContent = L.disclaimer;

    $("lang").innerHTML = Object.entries(LANGS)
      .map(([k, v]) => `<option value="${k}"${k === S.lang ? " selected" : ""}>${v.name}</option>`).join("");
    $("country").innerHTML = Object.keys(COUNTRIES)
      .map((k) => `<option value="${k}"${k === S.country ? " selected" : ""}>${esc(L[k])}</option>`).join("");

    const fields = [
      ["adults", L.adults, 0, 20],
      ["seniors", L.seniors, 0, 20],
      ["children", L.children, 0, 20],
      ["babies", L.babies, 0, 10],
      ["pets", L.pets, 0, 20],
      ["days", L.days, COUNTRIES[S.country].minDays, 60],
    ];
    $("household").innerHTML = fields.map(([k, label, min, max]) => {
      const v = k === "days" ? S.days[S.country] : S[k];
      return `<label class="field"><span>${esc(label).replace(/\([^)]*\)/g, (m) => `<span class="nw">${m}</span>`)}</span>
        <div class="stepper">
          <button type="button" data-step="${k}" data-d="-1" aria-label="−">−</button>
          <input type="number" inputmode="numeric" id="f_${k}" data-field="${k}" min="${min}" max="${max}" value="${v}">
          <button type="button" data-step="${k}" data-d="1" aria-label="+">+</button>
        </div></label>`;
    }).join("");
    $("daysHint").textContent = L["daysHint_" + S.country];
    $("t_needs").textContent = L.needsTitle;
    $("needs").innerHTML = NEEDS.map((k) => `<label class="need"><input type="checkbox" data-need="${k}"${S.needs[k] ? " checked" : ""}><span>${esc(L["need_" + k])}</span></label>`).join("");
    $("foodNote").textContent = L["foodNote_" + S.country] || L.foodNote_ref.replace("{in}", L.inCountry[S.country]);

    const siteLang = (code) => code === "many" ? L.manyLangs : (LANGS[code] ? LANGS[code].name : code.toUpperCase());
    $("sources").innerHTML = COUNTRIES[S.country].sources
      .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener" hreflang="${s.lang === "many" ? "" : s.lang}">${esc(L["src_" + s.key])}</a>
        <span class="url">${esc(s.url.replace(/^https:\/\/(www\.)?/, "").split("/")[0])} · ${esc(siteLang(s.lang))}</span></li>`).join("");
    $("emergency").textContent = L["emergency_" + S.country];
  }

  function renderDynamic() {
    const L = t(), c = ctx(), C = COUNTRIES[S.country];

    // stats
    const water = waterL(c);
    const wDays = C.waterDays || c.days;
    const foodKg = Object.values(basketOf(c)).reduce((a, b) => a + b, 0) * c.eaters * c.days;
    const cash = C.cashAdult == null ? null : c.grown * C.cashAdult + (S.children + S.babies) * C.cashChild;
    $("stats").innerHTML = [
      [L.sumDays.charAt(0).toUpperCase() + L.sumDays.slice(1), nf(c.days), `${L[S.country]}`],
      [L.sumWater, `${nf(water)} ${L.u_L}`, `${nf(C.waterPerPersonDay)} ${L.u_L} × ${nf(c.persons)} × ${nf(wDays)}`],
      [L.sumFood, `≈ ${nf(Math.round(foodKg * 10) / 10)} ${L.u_kg}`, `≈ ${nf(BASKET_KCAL[C.basket])} ${L.kcalPerDay}`],
      [L.sumCash, cash == null ? "—" : fmtQty({ n: cash, unit: "CUR" }), cash == null ? (L["cashNote_" + S.country] || L.cashNone) : `${fmtQty({ n: C.cashAdult, unit: "CUR" })} / ${fmtQty({ n: C.cashChild, unit: "CUR" })}`],
    ].map(([k, v, s]) => `<div class="stat"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div><div class="s">${esc(s)}</div></div>`).join("");

    // checklist
    const have = S.have[S.country];
    const items = visibleItems();
    $("checklist").innerHTML = CATEGORIES.map((cat) => {
      const list = items.filter((it) => it.cat === cat);
      if (!list.length) return "";
      return `<h3>${esc(L["cat_" + cat])}</h3><ul class="items">` + list.map((it) => {
        const q = it.qty(c);
        const on = !!have[it.id];
        return `<li class="${on ? "have" : ""}">
          <input type="checkbox" id="h_${it.id}" data-have="${it.id}"${on ? " checked" : ""}>
          <label class="name" for="h_${it.id}">${esc(L.items[it.id])}${badge(it.src[S.country])}</label>
          <span class="qty">${esc(on ? L.haveTag : fmtQty(q))}</span></li>`;
      }).join("") + `</ul>`;
    }).join("");

    const nHave = items.filter((it) => have[it.id]).length;
    $("haveCount").innerHTML = esc(L.haveCount)
      .replace("{have}", `<b>${nf(nHave)}</b>`).replace("{total}", nf(items.length)).replace("{buy}", `<b>${nf(items.length - nHave)}</b>`);

    // shopping list
    const lines = shoppingLines();
    $("shopping").innerHTML = lines.length
      ? lines.map((l) => `<li><span class="name">${esc(l.name)}</span><span class="qty">${esc(l.qty)}</span></li>`).join("")
      : `<li><span class="name">${esc(L.shoppingEmpty)}</span></li>`;

    // print header
    $("printHeader").textContent =
      `${[L.title + " — " + L[S.country], `${L.adults}: ${nf(S.adults)}, ${L.seniors}: ${nf(S.seniors)}, ${L.children}: ${nf(S.children)}, ${L.babies}: ${nf(S.babies)}, ${L.pets}: ${nf(S.pets)}`, `${nf(c.days)} ${L.sumDays}`, new Date().toLocaleDateString(LANGS[S.lang].locale)].join(S.lang === "fa" ? "؛ " : " · ")}`;

    // AI prompt + links
    $("prompt").value = buildPrompt(S.lang, c, lines.map((l) => l.qty ? `${l.name}: ${l.qty}` : l.name));
    updateAiLinks();
  }

  function shoppingLines() {
    const L = t(), c = ctx(), have = S.have[S.country];
    return visibleItems().filter((it) => !have[it.id])
      .map((it) => ({ name: L.items[it.id], qty: fmtQty(it.qty(c)) }));
  }

  function shoppingText() {
    const L = t();
    const lines = shoppingLines();
    const head = `${L.title} — ${L[S.country]} (${nf(ctx().days)} ${L.sumDays})`;
    return head + "\n" + (lines.length ? lines.map((l) => `☐ ${l.name}${l.qty ? " — " + l.qty : ""}`).join("\n") : L.shoppingEmpty);
  }

  const MAX_URL = 8000; // keep links well under common server URL limits
  function updateAiLinks() {
    const enc = encodeURIComponent($("prompt").value);
    const ok = enc.length < MAX_URL;
    $("btnClaude").href = ok ? `https://claude.ai/new?q=${enc}` : "https://claude.ai/new";
    $("btnChatGPT").href = ok ? `https://chatgpt.com/?q=${enc}` : "https://chatgpt.com/";
    $("btnGemini").href = "https://gemini.google.com/app";
  }

  /* ---------- clipboard & toast ---------- */
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("on"), 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  function shareUrl() {
    const u = new URL(location.href.split("?")[0]);
    u.searchParams.set("lang", S.lang);
    u.searchParams.set("country", S.country);
    u.searchParams.set("a", S.adults);
    u.searchParams.set("s", S.seniors);
    u.searchParams.set("c", S.children);
    const n = NEEDS.filter((k) => S.needs[k]); if (n.length) u.searchParams.set("n", n.join(","));
    u.searchParams.set("b", S.babies);
    u.searchParams.set("p", S.pets);
    u.searchParams.set("d", S.days[S.country]);
    return u.toString();
  }

  /* ---------- events ---------- */
  function setField(k, v) {
    const min = { adults: 0, seniors: 0, children: 0, babies: 0, pets: 0, days: COUNTRIES[S.country].minDays }[k];
    const max = { adults: 20, seniors: 20, children: 20, babies: 10, pets: 20, days: 60 }[k];
    v = Math.min(max, Math.max(min, parseInt(v, 10) || min));
    // at least one grown-up in the household
    if (k === "adults" && v + S.seniors < 1) v = 1;
    if (k === "seniors" && v + S.adults < 1) v = 1;
    if (k === "days") S.days[S.country] = v; else S[k] = v;
    const inp = $("f_" + k); if (inp && String(inp.value) !== String(v)) inp.value = v;
    save(); renderDynamic();
  }

  document.addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    if (step) {
      const k = step.dataset.step;
      const cur = k === "days" ? S.days[S.country] : S[k];
      setField(k, cur + parseInt(step.dataset.d, 10));
      return;
    }
    const ai = e.target.closest("[data-ai]");
    if (ai) {
      // let the link open normally (keeps app/universal-link behaviour); copy the request too
      copyText($("prompt").value);
      toast(t().copied);
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.id === "lang") { S.lang = el.value; save(); renderStatic(); renderDynamic(); }
    else if (el.id === "country") { S.country = el.value; save(); renderStatic(); renderDynamic(); }
    else if (el.dataset.field) setField(el.dataset.field, el.value);
    else if (el.dataset.need) {
      if (el.checked) S.needs[el.dataset.need] = true; else delete S.needs[el.dataset.need];
      save(); renderDynamic();
    }
    else if (el.dataset.have) {
      S.have[S.country][el.dataset.have] = el.checked;
      if (!el.checked) delete S.have[S.country][el.dataset.have];
      save(); renderDynamic();
    }
  });

  $("prompt").addEventListener("input", updateAiLinks);

  $("copyBtn").addEventListener("click", () => copyText(shoppingText()).then(() => toast(t().copied)));
  $("printBtn").addEventListener("click", () => { try { window.print(); } catch (e) {} });
  $("shareBtn").addEventListener("click", () => {
    const text = shoppingText();
    if (navigator.share) navigator.share({ title: t().title, text }).catch(() => {});
    else copyText(text).then(() => toast(t().copied));
  });
  $("linkBtn").addEventListener("click", () => copyText(shareUrl()).then(() => toast(t().copied)));
  $("resetBtn").addEventListener("click", () => { S.have[S.country] = {}; save(); renderDynamic(); });

  renderStatic();
  renderDynamic();
})();
