// app.js — UI: tabla comparativa + gráfico barras + escalas
(function() {
  "use strict";

  const CCAA_KEYS = Object.keys(ESCALAS);
  const slider = document.getElementById("salary-slider");
  const numInput = document.getElementById("salary-input");
  const display = document.getElementById("salary-display");
  const edadSelect = document.getElementById("edad-select");
  const hijosSelect = document.getElementById("hijos-select");
  const ascendientesSelect = document.getElementById("ascendientes-select");
  const configSummary = document.getElementById("config-summary");
  const tbody = document.querySelector("#ccaa-table tbody");
  const barDiv = document.getElementById("bar-chart");
  const scaleDiv = document.getElementById("scale-chart");
  const pillsDiv = document.getElementById("ccaa-pills");

  let currentSalary = 35000;
  let selectedScales = new Set(["supletorio", "madrid", "cataluna", "comunidad_valenciana"]);

  // --- Configuración ---
  function getConfig() {
    return {
      edad: edadSelect?.value || "normal",
      hijos: parseInt(hijosSelect?.value || "0"),
      ascendientes: parseInt(ascendientesSelect?.value || "0"),
      discapacidad: 0,
      tributacion: "individual"
    };
  }

  function updateConfigSummary(config) {
    if (!configSummary) return;
    const parts = [];
    if (config.edad === "senior") parts.push("≥65");
    else if (config.edad === "mayor") parts.push("≥75");
    if (config.hijos > 0) parts.push(config.hijos + (config.hijos === 1 ? " hijo" : " hijos"));
    if (config.ascendientes > 0) parts.push(config.ascendientes + " ascendiente" + (config.ascendientes > 1 ? "s" : ""));
    configSummary.innerHTML = parts.length > 0 ? "Mínimo aplicado: " + parts.join(", ") : "Contribuyente individual, sin mínimos adicionales";
  }

  // --- Sync inputs ---
  function setSalary(v) {
    v = Math.max(10000, Math.min(500000, Math.round(v / 100) * 100));
    currentSalary = v;
    slider.value = v;
    numInput.value = v;
    display.textContent = v.toLocaleString("es-ES") + " €";
    update();
  }

  slider.addEventListener("input", () => setSalary(+slider.value));
  numInput.addEventListener("input", () => setSalary(+numInput.value));

  // Config change triggers update
  if (edadSelect) edadSelect.addEventListener("change", update);
  if (hijosSelect) hijosSelect.addEventListener("change", update);
  if (ascendientesSelect) ascendientesSelect.addEventListener("change", update);

  // --- Bar chart (pure CSS/HTML) ---
  function renderBarChart(results) {
    const sorted = [...results].sort((a, b) => b.res.neto - a.res.neto);
    const maxNeto = sorted[0].res.neto;
    const minNeto = sorted[sorted.length - 1].res.neto;
    const supletorioNeto = results.find(r => r.key === "supletorio")?.res.neto || 0;
    // Broken axis: start from below min to amplify differences
    const range = maxNeto - minNeto;
    const baseline = Math.max(0, minNeto - range * 0.3);
    const span = maxNeto - baseline;

    let html = '<div class="bars">';
    // Baseline indicator
    html += `<div class="bar-baseline">Eje desde ${fmt(Math.round(baseline))}</div>`;
    for (const r of sorted) {
      const pct = span > 0 ? ((r.res.neto - baseline) / span * 100) : 0;
      const delta = r.res.neto - supletorioNeto;
      const color = r.key === "supletorio" ? "var(--accent)" : (delta > 0 ? "#059669" : (delta < 0 ? "#dc2626" : "var(--muted)"));
      const deltaStr = delta === 0 ? "" : ` (${delta > 0 ? "+" : ""}${delta.toLocaleString("es-ES")}€)`;
      html += `
        <div class="bar-row" title="${CCAA_NAMES[r.key]}: ${fmt(r.res.neto)}${deltaStr}">
          <div class="bar-label">${CCAA_NAMES[r.key]}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <div class="bar-val">${fmt(r.res.neto)}</div>
        </div>`;
    }
    html += '</div>';
    barDiv.innerHTML = html;
  }

  // --- Table ---
  function renderTable(results) {
    const supletorio = results.find(r => r.key === "supletorio");
    const sorted = [...results].sort((a, b) => b.res.neto - a.res.neto);

    let html = "";
    sorted.forEach((r, i) => {
      const delta = r.res.neto - (supletorio?.res.neto || 0);
      const rowClass = i === 0 ? "best" : (i === sorted.length - 1 ? "worst" : "");
      const deltaClass = delta > 0 ? "positive" : (delta < 0 ? "negative" : "");
      const deltaStr = r.key === "supletorio" ? "—" : `<span class="delta ${deltaClass}">${fmtDelta(delta)}</span>`;

      html += `<tr class="${rowClass}">
        <td class="pos">${i + 1}</td>
        <td>${CCAA_NAMES[r.key]}</td>
        <td class="money">${fmt(r.res.neto)}</td>
        <td class="money">${fmt(r.res.irpfFinal)}</td>
        <td class="pct">${fmtPct(r.res.tipoEfectivo)}</td>
        <td class="pct">${fmtPct(r.res.tipoMax)}</td>
        <td>${deltaStr}</td>
      </tr>`;
    });
    tbody.innerHTML = html;
  }

  // --- Scale chart (step function) ---
  function renderScaleChart() {
    const maxBase = 200000;
    const step = 500;
    const colors = {
      supletorio: "#64748b",
      madrid: "#059669",
      cataluna: "#dc2626",
      comunidad_valenciana: "#f59e0b",
      andalucia: "#8b5cf6",
      extremadura: "#0891b2",
      canarias: "#d97706",
      baleares: "#be185d",
      aragon: "#4f46e5",
      asturias: "#15803d",
      galicia: "#b45309",
      cantabria: "#0e7490",
      castilla_y_leon: "#7c3aed",
      castilla_la_mancha: "#c026d3",
      la_rioja: "#ea580c",
      murcia: "#0d9488",
      navarra: "#e11d48",
      pais_vasco: "#1d4ed8",
      ceuta: "#a3a3a3",
      melilla: "#a3a3a3"
    };

    const datasets = [];
    for (const key of selectedScales) {
      const escala = ESCALAS[key];
      if (!escala) continue;
      const points = [];
      for (let b = 0; b <= maxBase; b += step) {
        let tipoEff = 0;
        if (b > 0) {
          let cuota = 0, prev = 0;
          for (const [lim, tipo] of escala) {
            if (b > prev) {
              const base = Math.min(b, lim) - prev;
              cuota += base * tipo;
            }
            prev = lim;
          }
          tipoEff = cuota / b * 100;
        }
        points.push({ x: b, y: +tipoEff.toFixed(2) });
      }
      datasets.push({
        label: CCAA_NAMES[key],
        data: points,
        borderColor: colors[key] || "#64748b",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0
      });
    }

    // Simple SVG chart (no external deps)
    const W = scaleDiv.clientWidth || 800;
    const H = 380;
    const margin = { top: 20, right: 20, bottom: 40, left: 55 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const maxTipo = 55;
    const scaleX = v => margin.left + (v / maxBase) * w;
    const scaleY = v => margin.top + h - (v / maxTipo) * h;

    let svg = `<svg viewBox="0 0 ${W} ${H}" class="scale-svg">`;

    // Grid
    for (let t = 0; t <= maxTipo; t += 10) {
      const y = scaleY(t);
      svg += `<line x1="${margin.left}" y1="${y}" x2="${W - margin.right}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
      svg += `<text x="${margin.left - 5}" y="${y + 4}" text-anchor="end" fill="#64748b" font-size="11">${t}%</text>`;
    }
    for (let b = 0; b <= maxBase; b += 50000) {
      const x = scaleX(b);
      svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${H - margin.bottom}" stroke="#e2e8f0" stroke-width="1"/>`;
      svg += `<text x="${x}" y="${H - margin.bottom + 18}" text-anchor="middle" fill="#64748b" font-size="11">${(b/1000).toFixed(0)}k</text>`;
    }

    // Lines
    for (const ds of datasets) {
      let d = `M ${scaleX(ds.data[0].x)} ${scaleY(ds.data[0].y)}`;
      for (let i = 1; i < ds.data.length; i++) {
        d += ` L ${scaleX(ds.data[i].x)} ${scaleY(ds.data[i].y)}`;
      }
      svg += `<path d="${d}" fill="none" stroke="${ds.borderColor}" stroke-width="2"/>`;
    }

    // Legend
    let lx = margin.left;
    const ly = margin.top + 4;
    for (const ds of datasets) {
      svg += `<rect x="${lx}" y="${ly - 8}" width="12" height="12" fill="${ds.borderColor}" rx="2"/>`;
      svg += `<text x="${lx + 16}" y="${ly + 2}" fill="#0f172a" font-size="11">${ds.label}</text>`;
      lx += ds.label.length * 7 + 30;
    }

    // Axis labels
    svg += `<text x="${W / 2}" y="${H - 2}" text-anchor="middle" fill="#64748b" font-size="11">Base liquidable (€)</text>`;

    svg += "</svg>";
    scaleDiv.innerHTML = svg;
  }

  // --- Pills ---
  function renderPills() {
    let html = "";
    for (const key of CCAA_KEYS) {
      const active = selectedScales.has(key) ? "active" : "";
      html += `<button class="pill ${active}" data-key="${key}">${CCAA_NAMES[key]}</button>`;
    }
    pillsDiv.innerHTML = html;

    pillsDiv.querySelectorAll(".pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.key;
        if (selectedScales.has(k)) {
          if (selectedScales.size > 1) selectedScales.delete(k);
        } else {
          selectedScales.add(k);
        }
        renderPills();
        renderScaleChart();
      });
    });
  }

  // --- Update all ---
  function update() {
    const config = getConfig();
    updateConfigSummary(config);
    const results = CCAA_KEYS.map(key => ({ key, res: calcularIRPF(currentSalary, key, config) }));
    renderBarChart(results);
    renderTable(results);
    renderScaleChart();
  }

  // --- Init ---
  renderPills();
  setSalary(35000);

  // --- Modal FORMULAS.md (v2) ---
  const modal = document.getElementById("formulas-modal");
  const modalBody = document.getElementById("formulas-body");
  const modalClose = document.getElementById("modal-close");
  const formulasLink = document.getElementById("formulas-link");

  async function loadFormulas() {
    if (modalBody.dataset.loaded) return;
    try {
      const res = await fetch("FORMULAS.md");
      const text = await res.text();
      if (typeof marked !== "undefined") {
        modalBody.innerHTML = marked.parse(text);
      } else {
        modalBody.innerHTML = `<pre style="white-space:pre-wrap;font-family:monospace;font-size:0.85rem;line-height:1.6">${text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`;
      }
      if (typeof hljs !== "undefined") {
        modalBody.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block));
      }
      modalBody.dataset.loaded = "true";
    } catch (e) {
      modalBody.innerHTML = `<p class="error">Error cargando FORMULAS.md. <a href="FORMULAS.md" target="_blank">Abrir directamente</a>.</p>`;
    }
  }

  function openModal() {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    loadFormulas();
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Expose globally for inline onclick
  window.__openFormulasModal = openModal;
  window.__closeFormulasModal = closeModal;

  // Expose globally for inline onclick
  window.__openFormulasModal = openModal;
  window.__closeFormulasModal = closeModal;

  // Use both addEventListener and onclick for maximum browser compatibility
  if (formulasLink) {
    formulasLink.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal || e.target.classList.contains("modal-backdrop")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Resize handler
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderScaleChart(), 150);
  });
})();