# 📋 AUDITORÍA INTEGRAL — Calculadora IRPF por CCAA
**Fecha:** 2026-04-25  
**Auditor:** Elcano  
**Versión auditada:** v3.0 (2026-04-24)  
**Repositorio:** `/root/.openclaw/workspace/projects/Calculadora-de-Salarios-y-Progresividad-en-Fr-o/`

---

## 🔴 CRÍTICO — Bugs fiscales o errores de cálculo

### C1. La Rioja: usa escala supletorio en lugar de escala propia
- **Archivo:** `data.js:la_rioja`
- **Problema:** `la_rioja: null` → usa escala ESTATAL (0.185 en tramo 4). La Rioja tiene escala propia con tipo **0.192** en tramo 4 (35.200€–60.000€) según PDF Hacienda y escalas.csv.
- **Impacto:** **Subestima IRPF en La Rioja** para base entre 35.200€ y 60.000€. Diferencia ~0.7 puntos porcentuales en ese tramo.
- **Corrección:** Añadir escala propia para La Rioja:
  ```js
  la_rioja: [
    [12450, 0.095], [20200, 0.12], [35200, 0.15], [60000, 0.192], [Infinity, 0.225]
  ]
  ```

### C2. Aragón: tipo máximo incorrecto (0.275 vs 0.255)
- **Archivo:** `data.js:aragon`
- **Problema:** Último tramo `[175000, 0.275]` debería ser `[175000, 0.255]` según PDF Hacienda pág. 150.
- **Impacto:** **Sobreestima IRPF en Aragón** para rentas > 175.000€. Diferencia de 2 puntos porcentuales en el último tramo.
- **Corrección:** Cambiar `0.275` → `0.255` en el último tramo de Aragón.

### C3. Baleares: tipo máximo incorrecto (0.275 vs 0.255)
- **Archivo:** `data.js:baleares`
- **Problema:** Último tramo `[175000, 0.275]` debería ser `[175000, 0.255]` según PDF Hacienda.
- **Impacto:** **Sobreestima IRPF en Baleares** para rentas > 175.000€.
- **Corrección:** Cambiar `0.275` → `0.255` en el último tramo de Baleares.

### C4. Canarias: tipo máximo incorrecto (0.275 vs 0.255)
- **Archivo:** `data.js:canarias`
- **Problema:** Último tramo `[175000, 0.275]` debería ser `[175000, 0.255]` según PDF Hacienda.
- **Impacto:** **Sobreestima IRPF en Canarias** para rentas > 175.000€.
- **Corrección:** Cambiar `0.275` → `0.255` en el último tramo de Canarias.

### C5. Escalas.csv contiene tipos estatales incorrectos en algunos tramos
- **Archivo:** `escalas.csv`
- **Problema:** Para Madrid tramo 4, el CSV indica tipo estatal 0.185 pero el PDF Hacienda pág. 47 indica que Madrid usa **0.179** para el tramo 35.426€–60.000€. Similar discrepancia en otros tramos.
- **Nota:** `data.js` tiene los valores correctos (0.179, 0.205, 0.235). El CSV parece desactualizado en tipos estatales — **data.js es la fuente correcta**.
- **Corrección:** Actualizar escalas.csv para que coincida con data.js o regenerar desde data.js.

---

## 🟡 IMPORTANTE — Problemas de UX, accesibilidad, o datos

### I1. Falta descarga CSV desde la página principal
- **Archivo:** `index.html`
- **Problema:** No hay enlace visible para descargar `escalas.csv` desde la calculadora. Solo está disponible desde `fuentes.html`.
- **Impacto:** Los usuarios no encuentran fácilmente los datos descargables.
- **Corrección:** Añadir botón de descarga en `index.html` junto a los otros controles.

### I2. Falta Open Graph y Schema.org
- **Archivo:** `index.html`
- **Problema:** No hay meta tags `og:*` ni markup Schema.org para SEO/social sharing.
- **Corrección:**
  ```html
  <meta property="og:title" content="Calculadora IRPF por Comunidad Autónoma">
  <meta property="og:description" content="Compara el IRPF en las 19 CCAA españolas">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://elcanosail.github.io/Calculadora-de-Salarios-y-Progresividad-en-Fr-o/">
  ```

### I3. Falta CSP (Content Security Policy)
- **Archivo:** `index.html`
- **Problema:** No hay `<meta http-equiv="Content-Security-Policy" ...>`.
- **Impacto:** Mayor superficie de ataque XSS.
- **Corrección:** Añadir CSP restrictiva dado que no hay dependencias externas.

### I4. Sin sanitización de innerHTML en modal
- **Archivo:** `app.js:modalBody.innerHTML`
- **Problema:** El modal carga `FORMULAS.md` vía `fetch()` y lo renderiza con `marked.parse(text)`. Si el archivo se compromete, puede ejecutar JS arbitrario.
- **Impacto:** XSS potencial (aunque bajo riesgo dado que FORMULAS.md está en el repo).
- **Corrección:** Usar `DOMPurify` antes de insertar HTML, o usar `textContent` para fallback.

### I5. Variables globales en data.js
- **Archivo:** `data.js`
- **Problema:** Usa `var` para CCAA_NAMES, AUTONOMICAS, etc. Contamina el namespace global.
- **Corrección:** Usar `const` o envolver en IIFE.

### I6. CSS inline en fuentes.html
- **Archivo:** `fuentes.html`
- **Problema:** Tiene `<style>` inline con ~200 líneas de CSS que bloquea renderizado.
- **Corrección:** Mover CSS a `style.css` o usar `defer`.

### I7. Faltan botones de compartir/exportar
- **Archivo:** `index.html`
- **Problema:** No hay opción para compartir resultados ni exportar a PDF/imagen.
- **Impacto:** Difícil compartir comparativas.

---

## 🟢 MENOR — Mejoras sugeridas, optimizaciones

### M1. Falta canonical URL
- **Archivo:** `index.html`
- **Problema:** No hay `<link rel="canonical">`.
- **Corrección:** Añadir canonical para evitar contenido duplicado.

### M2. No hay sitemap.xml
- **Problema:** Los motores de búsqueda no pueden descubrir todas las páginas fácilmente.
- **Corrección:** Crear `sitemap.xml` con index.html, formulas.html, fuentes.html.

### M3. Falta preload de recursos críticos
- **Archivo:** `index.html`
- **Problema:** No hay `<link rel="preload">` para data.js ni app.js.
- **Corrección:** Añadir `preload` para mejorar LCP.

### M4. Gráfico de escalas no tiene tooltip
- **Archivo:** `app.js:renderScaleChart`
- **Problema:** El SVG de escalas no muestra valores al hover.
- **Corrección:** Añadir `<title>` a elementos SVG o tooltip con JS.

### M5. Tabla no es ordenable por columnas
- **Archivo:** `app.js`
- **Problema:** Solo se ordena por neto descendente. No se puede ordenar por IRPF, tipo efectivo, etc.
- **Corrección:** Añadir headers clickeables para ordenar.

### M6. Faltan tests unitarios
- **Problema:** No hay tests para calcularIRPF. Los bugs fiscales podrían detectarse con tests.
- **Corrección:** Añadir suite de tests con casos de verificación (Madrid 35k, Cataluña 35k, etc.).

### M7. No hay Service Worker para offline
- **Problema:** La app no funciona offline.
- **Corrección:** Añadir PWA básico con Service Worker.

### M8. Falta analytics/privacy
- **Problema:** No hay política de privacidad ni aviso de cookies (si se añade analytics).
- **Corrección:** Añadir privacy policy si se añade analytics.

### M9. Input numérico permite valores fuera de rango
- **Archivo:** `app.js:setSalary`
- **Problema:** Aunque se clampa a [10000, 500000], el input `<input type="number">` no tiene `min/max` attributes.
- **Corrección:** Añadir `min="10000" max="500000"` al input HTML.

### M10. Favicon ausente
- **Archivo:** `index.html`
- **Problema:** No hay `<link rel="icon">`.
- **Corrección:** Añadir favicon.

---

## ✅ CORRECTO — Verificaciones que pasan

### Fiscal
- ✅ Reducción art. 20: tramos y fórmulas correctas
- ✅ Mínimo personal (Art. 57/63): se aplica sobre la **cuota íntegra**, NO sobre la base liquidable
- ✅ Base liquidable = rneto (rn - gastos deducibles - reducción art.20)
- ✅ Cuotas separadas estatal + autonómica: implementación correcta
- ✅ Deducción por mínimo personal: cuota mínima calculada sobre los tipos marginales reales
- ✅ Tope de retención (43%): aplicado correctamente sobre (bruto - mínimo exento)
- ✅ Forales (Navarra, País Vasco): escala propia como cuota única, sin desglose estatal/autonómico
- ✅ Gastos fijos (2.000€): aplicados correctamente en el cálculo de rneto
- ✅ Cotización SS: tope correcto a 58.914€, tipo 6,35%
- ✅ Madrid: cálculo correcto verificado contra simulador AEAT
- ✅ Cataluña: cálculo correcto

### Datos (CCAA correctas)
- ✅ Madrid: 7 tramos, tipos correctos
- ✅ Cataluña: 8 tramos, tipos correctos
- ✅ Andalucía: 5 tramos, tipos correctos
- ✅ Asturias: 6 tramos, tipos correctos
- ✅ Cantabria: 7 tramos, tipos correctos
- ✅ Castilla y León: 5 tramos, tipos correctos
- ✅ Castilla-La Mancha: 7 tramos, tipos correctos
- ✅ Extremadura: 10 tramos, tipos correctos
- ✅ Galicia: 6 tramos, tipos correctos
- ✅ Murcia: 5 tramos, tipos correctos
- ✅ Comunidad Valenciana: 6 tramos, tipos correctos
- ✅ Navarra (foral): escala correcta
- ✅ País Vasco (foral): escala correcta

### UX/UI
- ✅ Flujo de uso intuitivo: slider + input numérico + selectores
- ✅ Tabla comparativa clara con ranking, diferencias y colores
- ✅ Gráfico de barras funcional con eje roto
- ✅ Links entre páginas (index ↔ formulas ↔ fuentes)
- ✅ Responsive: media query @media (max-width: 640px)

### SEO
- ✅ `<title>` presente y descriptivo
- ✅ `<meta name="description">` presente
- ✅ Lang="es" correcto
- ✅ Viewport configurado

### Seguridad
- ✅ No hay backend (solo frontend estático)
- ✅ No se envían datos a servidores externos
- ✅ No hay localStorage que almacene datos sensibles
- ✅ URLs absolutas: no se detectan HTTP inseguras

### Rendimiento
- ✅ CSS externo (no inline en index.html)
- ✅ Sin dependencias de CDN (marked.js y highlight.js no se cargan — fallback a texto plano)
- ✅ JavaScript mínimo (~300 líneas)

---

## 📊 RESUMEN EJECUTIVO

| Categoría | 🔴 Crítico | 🟡 Importante | 🟢 Menor | ✅ Correcto |
|-----------|-----------|--------------|----------|------------|
| Fiscal | 4 | 0 | 0 | 10+ |
| Datos | 1 (CSV) | 0 | 0 | 15 |
| UX/UI | 0 | 2 | 5 | 4 |
| SEO | 0 | 1 | 2 | 4 |
| Seguridad | 0 | 2 | 0 | 5 |
| Rendimiento | 0 | 1 | 1 | 3 |

**Prioridad de corrección:**
1. 🔴 **C1–C4**: Corregir escalas de La Rioja, Aragón, Baleares, Canarias en data.js
2. 🔴 **C5**: Sincronizar escalas.csv con data.js (o regenerar)
3. 🟡 **I1**: Añadir botón descarga CSV en index.html
4. 🟡 **I2**: Añadir Open Graph y Schema.org
5. 🟡 **I4**: Sanitizar innerHTML del modal

**Nota:** El cálculo fiscal base es **correcto y robusto**. Los errores están en datos de escalas (4 CCAA con tipos incorrectos) y mejoras de UX/seguridad. El diseño y la arquitectura son sólidos.

---
*Auditoría completada por Elcano · Navegante del código*
