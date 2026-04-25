# 💶 IRPF por Comunidad Autónoma — Calculadora Interactiva

![Web](https://img.shields.io/badge/web-live-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Calculadora web que compara el salario neto en las **19 comunidades autónomas** españolas, con escalas IRPF 2026 separadas (estatal + autonómica) y cálculo exacto según la LIRPF.

Basada en el trabajo de [Jon González](https://github.com/jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o), con aportaciones propias significativas.

## 🌐 Demo

**[elcanosail.github.io/Calculadora-de-Salarios-y-Progresividad-en-Fr-o](https://elcanosail.github.io/Calculadora-de-Salarios-y-Progresividad-en-Fr-o/)**

## ✨ Funcionalidades

### Interfaz interactiva
- **Slider de salario bruto** (10.000€ – 500.000€) con input numérico sincronizado
- **Selector de edad** (menos de 65 / 65-75 / más de 75) con mínimos personal actualizados
- **Selector de hijos** (0 a 5+) con deducciones por descendientes
- **Selector de ascendientes** (>65 años)
- **Texto dinámico** que refleja la configuración del contribuyente

### Visualización
- **Gráfico de barras** ordenado de mayor a menor neto, con eje desde el supletorio
- **Tabla comparativa** completa: neto, IRPF, tipo efectivo, tipo marginal máximo, diferencia vs supletorio
- **Gráfico de escalas** interactivo: selecciona CCAA y compara tramos marginales estatal/autonómico/combined

### Datos y cálculo
- **Escalas IRPF 2026 separadas**: cuota íntegra estatal + cuota íntegra autonómica (régimen común) o escala foral única (Navarra, País Vasco)
- **19 CCAA**: 17 de régimen común + 2 forales, con escalas propias del PDF oficial de Hacienda
- **Cálculo exacto**: reducción art. 20 LIRPF, mínimo personal y familiar, gastos fijos (2.000€), deducción SMI, límite de retención 43%
- **CSV descargable** con todas las escalas (`escalas.csv`)

### Páginas adicionales
- **[Fórmulas del cálculo](https://elcanosail.github.io/Calculadora-de-Salarios-y-Progresividad-en-Fr-o/formulas.html)** — Especificación paso a paso con referencias al BOE y ejemplos numéricos de verificación
- **[Fuentes y referencias](https://elcanosail.github.io/Calculadora-de-Salarios-y-Progresividad-en-Fr-o/fuentes.html)** — PDF oficial de Hacienda, Orden HFP/886/2025, simulador AEAT, verificación cruzada

## 🔧 Aportaciones respecto al repo original

Este fork parte del excelente trabajo de Jon González (auditoría Python → Excel) y añade:

| Aportación | Descripción |
|-----------|-------------|
| **Web app interactiva** | De script Python a calculadora web con HTML/CSS/JS puro (sin dependencias) |
| **Escalas separadas (v3.0)** | Cálculo con dos cuotas separadas (estatal + autonómica) en vez de escala combinada |
| **19 CCAA** | Las 17 de régimen común + Navarra y País Vasco con escalas forales propias |
| **Configuración de contribuyente** | Edad, hijos, ascendientes — con mínimos personal actualizados (LIRPF 2024+) |
| **Gráfico de escalas** | Visualización interactiva de tramos marginales por CCAA |
| **CSV descargable** | 127 filas con todas las escalas para auditoría |
| **Página de fórmulas** | Especificación legal con referencias al BOE y ejemplos de verificación |
| **Página de fuentes** | PDF oficial, AEAT, verificación cruzada con 5 ejemplos numéricos |
| **Responsive** | Funciona en móvil y escritorio |

## 🏗️ Estructura del proyecto

```
docs/
├── index.html      # Calculadora principal
├── data.js         # Escalas IRPF 2026 (estatal + autonómicas + forales)
├── app.js          # Lógica de cálculo y renderizado
├── style.css       # Estilos
├── formulas.html   # Especificación del cálculo con referencias legales
├── fuentes.html    # Fuentes, referencias y verificación cruzada
└── escalas.csv     # CSV descargable con todas las escalas
```

## 🚀 Uso local

```bash
git clone https://github.com/elCanosail/Calculadora-de-Salarios-y-Progresividad-en-Fr-o.git
cd Calculadora-de-Salarios-y-Progresividad-en-Fr-o/docs
# Abrir docs/index.html en el navegador (no necesita servidor)
```

Para desarrollo con live reload:
```bash
npx serve docs
```

## 📐 Cálculo (régimen común)

```
1. Base SS = min(bruto, 58.914€)
2. Cotización SS = Base SS × 6,35%
3. Rendimiento neto previo = bruto - cotización SS
4. Reducción art. 20 = tramos según rn previo
5. Rendimiento neto = rn previo - 2.000€ gastos - reducción art.20
6. Base liquidable = rendimiento neto
7. Cuota estatal = aplicar escala estatal a base liquidable
8. Cuota autonómica = aplicar escala autonómica a base liquidable
9. Reducción mínimo personal = aplicar escala a mínimo (5.550€ base)
10. Cuota líquida = (cuota estatal - mín.est.) + (cuota aut. - mín.aut.)
11. Deducción SMI si bruto ≤ 18.276€
12. Límite retención = min(cuota resultante, 43% × rendimiento)
13. Neto = bruto - cotización SS - IRPF final
```

## ⚖️ Aviso legal

Calculadora con fines educativos y orientativos. Los resultados no sustituyen el asesoramiento de un profesional fiscal. Las escalas autonómicas proceden del PDF oficial del Ministerio de Hacienda ("Capítulo IV Tributación Autonómica 2026").

## 📝 Licencia

MIT — Ver [LICENSE](LICENSE).

---

*Fork de [jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o](https://github.com/jongonzlz/Calculadora-de-Salarios-y-Progresividad-en-Fr-o) con aportaciones propias.*