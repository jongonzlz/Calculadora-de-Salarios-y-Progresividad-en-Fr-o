# CLI de consulta rápida

`cli.py` permite consultar el motor fiscal sin generar el Excel masivo. El caso principal es comparar un salario actual con su equivalente real en 2019, ajustando por IPC.

## Uso principal: 2019 vs 2026

Por defecto, `ipc` compara un salario de 2026 contra su equivalente de 2019 con la misma capacidad económica real.

```bash
python3 cli.py ipc 30000
```

Salida:

```text
Concepto    | Año  | Bruto nominal | Bruto 2026  | IPC     | IRPF 2026  | Tipo IRPF | Dif. tipo | Neto 2026   | Dif. IRPF | Dif. neto/mes (12p)
------------+------+---------------+-------------+---------+------------+-----------+-----------+-------------+-----------+--------------------
2019 equiv. | 2019 |   23,843.46 € | 30,000.00 € | 1.2582x | 4,038.62 € |   13.46 % | 0.00 p.p. | 24,056.38 € |    0.00 € |              0.00 €
2026 actual | 2026 |   30,000.00 € | 30,000.00 € | 1.0000x | 4,926.00 € |   16.42 % | 2.96 p.p. | 23,124.00 € |  887.38 € |            -77.70 €
```

Cómo leerlo:

- `2019 equiv.`: salario nominal de 2019 que equivale a `30.000 €` de 2026 tras aplicar IPC.
- `IRPF 2026`: IRPF expresado en euros comparables de 2026.
- `Tipo IRPF`: IRPF dividido entre el bruto equivalente de 2026.
- `Dif. tipo`: aumento del tipo efectivo frente al caso equivalente de 2019.
- `Dif. IRPF`: cuánto más IRPF se paga frente al caso equivalente de 2019.
- `Dif. neto/mes`: pérdida o ganancia mensual neta frente al caso equivalente de 2019.

Para cambiar los años:

```bash
python3 cli.py ipc 30000 --anio-base 2019 --anio-actual 2026
```

## Rentas bajas: tipo marginal efectivo

`marginal` muestra cuánto neto queda de cada subida bruta dentro de un rango. Es útil para ver zonas donde una subida salarial se convierte en poco neto disponible.

```bash
python3 cli.py marginal --anio 2026 --desde 16500 --hasta 18500 --paso 500
```

Salida:

```text
Año  | Bruto anual | Neto anual  | Subida bruta | Subida neta | Tipo marginal efectivo
-----+-------------+-------------+--------------+-------------+-----------------------
2026 | 16,500.00 € | 15,427.50 € |       0.00 € |      0.00 € |                 0.00 %
2026 | 17,000.00 € | 15,895.00 € |     500.00 € |    467.50 € |                 6.50 %
2026 | 17,500.00 € | 16,082.95 € |     500.00 € |    187.95 € |                62.41 %
2026 | 18,000.00 € | 16,206.18 € |     500.00 € |    123.23 € |                75.35 %
2026 | 18,500.00 € | 16,329.42 € |     500.00 € |    123.23 € |                75.35 %
```

## Otros comandos

Calcular un salario concreto:

```bash
python3 cli.py salario 30000
```

Salida:

```text
Año  | Bruto anual | Coste empresa | SS empresa | SS trabajador | IRPF       | Neto anual  | Neto mensual (12p)
-----+-------------+---------------+------------+---------------+------------+-------------+-------------------
2026 | 30,000.00 € |   39,645.00 € | 9,645.00 € |    1,950.00 € | 4,926.00 € | 23,124.00 € |         1,927.00 €
```

Generar una tabla pequeña por rango salarial:

```bash
python3 cli.py tabla --anio 2026 --desde 20000 --hasta 40000 --paso 10000
```

Salida:

```text
Año  | Bruto anual | Coste empresa | SS empresa  | SS trabajador | IRPF       | Neto anual  | Neto mensual (12p)
-----+-------------+---------------+-------------+---------------+------------+-------------+-------------------
2026 | 20,000.00 € |   26,430.00 € |  6,430.00 € |    1,300.00 € | 1,773.32 € | 16,926.68 € |         1,410.56 €
2026 | 30,000.00 € |   39,645.00 € |  9,645.00 € |    1,950.00 € | 4,926.00 € | 23,124.00 € |         1,927.00 €
2026 | 40,000.00 € |   52,860.00 € | 12,860.00 € |    2,600.00 € | 7,745.00 € | 29,655.00 € |         2,471.25 €
```

Comparar el mismo bruto nominal entre años:

```bash
python3 cli.py comparar 30000 --desde-anio 2024 --hasta-anio 2026
```

Salida:

```text
Año  | Bruto anual | Coste empresa | SS empresa | SS trabajador | IRPF       | Neto anual  | Neto mensual (12p)
-----+-------------+---------------+------------+---------------+------------+-------------+-------------------
2024 | 30,000.00 € |   39,594.00 € | 9,594.00 € |    1,941.00 € | 4,928.70 € | 23,130.30 € |         1,927.52 €
2025 | 30,000.00 € |   39,621.00 € | 9,621.00 € |    1,944.00 € | 4,927.80 € | 23,128.20 € |         1,927.35 €
2026 | 30,000.00 € |   39,645.00 € | 9,645.00 € |    1,950.00 € | 4,926.00 € | 23,124.00 € |         1,927.00 €
```

`comparar` no ajusta por inflación. Para la comparación de salario real 2019 vs 2026, usa `ipc`.

## Instalación y ayuda

Instala las dependencias del proyecto:

```bash
python3 -m pip install -r requirements.txt
```

Ver comandos disponibles:

```bash
python3 cli.py --help
```

Salida resumida:

```text
usage: cli.py [-h] {ipc,marginal,salario,tabla,comparar} ...
```

`cli.py` también puede ejecutarse directamente si tiene permisos de ejecución:

```bash
./cli.py ipc 30000
```

## Nota

El CLI reutiliza las funciones de `Calculo_Salario_IRPF.py`, pero evita ejecutar la sección final que genera `Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx`.

## Validación

Para comprobar que el CLI devuelve resultados coherentes con el Excel masivo, se generó localmente el archivo completo ejecutando:

```bash
python3 Calculo_Salario_IRPF.py
```

Resultado de la validación:

```text
Archivo generado: Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx
Tamaño aproximado: 144.8 MB
Hojas: 18
DAT_2012, DAT_2024, DAT_2025, DAT_2026: 100002 filas cada una, incluyendo cabecera
```

También se compararon filas representativas del Excel contra el motor usado por el CLI:

```text
OK DAT_2026 bruto 30000: neto 23,124.00 €
OK DAT_2026 bruto 50000: neto 35,545.50 €
OK DAT_2025 bruto 30000: neto 23,128.20 €
OK DAT_2024 bruto 30000: neto 23,130.30 €
OK DAT_2012 bruto 30000: neto 22,666.59 €
VALIDACION_OK
```

El Excel masivo no se incluye en el repositorio porque es un artefacto pesado y reproducible.
