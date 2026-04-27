# 💶 Auditor Histórico de Nóminas e IRPF (España 2012-2026) con Ajuste de Inflación

![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Estado](https://img.shields.io/badge/estado-Completado-success.svg)

Auditor fiscal en Python que calcula el salario neto en España (2012-2026) euro a euro. Genera una auditoría masiva en Excel del IRPF, Seguridad Social, MEI y analiza la pérdida de poder adquisitivo ajustada a la inflación real.

A diferencia de las calculadoras de sueldo neto convencionales, este script **genera un informe exhaustivo de más de 1.5 millones de cálculos**, analizando todos los tramos salariales (de 0€ a 100.000€) y aplicando un **análisis macroeconómico de inflación** para revelar la pérdida real de poder adquisitivo provocada por la "progresividad en frío" (el conocido como *hachazo fiscal silencioso*).

## ✨ Características Principales

* **📜 Histórico Normativo (2012-2026):** Incluye toda la evolución de bases máximas, tipos de cotización, reducciones, gastos fijos y escalas del IRPF.
* **🔎 Precisión Legal Absoluta:**
  * Aplicación estricta de la **Reducción por Rendimientos del Trabajo (Art. 20)** calculada sobre el rendimiento neto previo, separada de los gastos deducibles generales (Art. 19).
  * Régimen transitorio de IRPF del año **2018** (Disposición Adicional 47ª LIRPF).
  * Tope máximo legal de retención en nómina del **43%** (Art. 85.3 RIRPF).
  * Deducciones específicas del SMI actualizadas a 2025 y 2026.
* **🏛️ Nuevos Impuestos:** Integración completa del **Mecanismo de Equidad Intergeneracional (MEI)** y la nueva **Cuota de Solidaridad** progresiva (aplicable a partir de 2025 y actualizada a los tipos de 2026).
* **📉 Análisis de Inflación Real:** Compara salarios actuales con años anteriores encadenando el IPC acumulado mediante las tasas oficiales del INE (de diciembre a diciembre).

## 🚀 Instalación y Uso

1. **Clona este repositorio:**
   ```bash
   git clone [https://github.com/TU-USUARIO/calculadora-nominas-espana.git](https://github.com/TU-USUARIO/calculadora-nominas-espana.git)
   cd calculadora-nominas-espana
   Instala las dependencias necesarias:
Asegúrate de tener Python instalado. Las librerías requeridas son pandas, numpy y openpyxl.
Instala las dependencias necesarias:
Asegúrate de tener Python instalado. Las librerías requeridas son pandas, numpy y openpyxl.

Bash
pip install -r requirements.txt
Ejecuta el script:

Bash
python main.py
(Nota: La generación del archivo Excel tomará unos minutos debido al enorme volumen de datos procesados. ¡Ten paciencia mientras se escribe el documento!)

Consulta rápida por CLI: si solo quieres calcular salarios puntuales, tablas pequeñas o comparativas entre años sin generar el Excel masivo, revisa [CLI.md](CLI.md).

📊 Entendiendo el Output (Excel Generado)
El script genera un archivo llamado Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx con la siguiente estructura de pestañas:

CONTROL_GENERAL y CONTROL_TRAMOS_IRPF: Diccionario normativo. Aquí puedes auditar los porcentajes de la Seguridad Social, el MEI, los mínimos personales, el mínimo exento y el histórico de tramos del IRPF de cada año.

COMPARATIVA_INFLACION: La "prueba del algodón" macroeconómica. Muestra cuánto poder adquisitivo ha perdido un salario actual frente a su equivalente en el pasado, deflactando el bruto y actualizando todos los impuestos.

DAT_2012 a DAT_2026: Pestañas anuales de desglose. Muestran para cada salario (de 1€ a 100.000€) el coste laboral, desglose de cotizaciones patronales y obreras, cuota por cada tramo de IRPF, aplicación de límites legales y salario neto final.

🤝 Contribuciones
¡Las contribuciones son bienvenidas! Si detectas una actualización normativa oficial, un error tipográfico en los Presupuestos Generales del Estado o quieres añadir nuevas funcionalidades (ej. cálculo de IRPF autonómico específico o situaciones familiares):

Haz un Fork del proyecto.

Crea una rama con tu nueva funcionalidad (git checkout -b feature/NuevaNormativa).

Haz un Commit de tus cambios (git commit -m 'Añade tipos IRPF 2027').

Haz Push a la rama (git push origin feature/NuevaNormativa).

Abre un Pull Request.

⚖️ Aviso Legal
Este proyecto tiene fines educativos, divulgativos y de análisis económico. Aunque el algoritmo se ha programado siguiendo minuciosamente la normativa de la AEAT y la Seguridad Social española, los resultados son orientativos y no sustituyen el consejo de un profesional fiscal o un graduado social.

📝 Licencia
Distribuido bajo la Licencia MIT. Siéntete libre de usar, modificar y distribuir este software de manera personal o comercial sin responsabilidad legal para los autores. Consulta el archivo LICENSE incluido en el repositorio para más información.
