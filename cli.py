#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI ligero para consultar el motor fiscal sin generar el Excel masivo."""

import argparse
from pathlib import Path

import numpy as np


SCRIPT_ORIGINAL = Path(__file__).with_name("Calculo_Salario_IRPF.py")
MARCADOR_EJECUCION = "# 6. EJECUCIÓN MAESTRA Y GENERACIÓN DEL EXCEL COMPLETO"


def cargar_motor():
    """Carga funciones y datos del script original evitando su ejecución final."""
    codigo = SCRIPT_ORIGINAL.read_text(encoding="utf-8")
    codigo_motor = codigo.split(MARCADOR_EJECUCION, maxsplit=1)[0]
    namespace = {}
    exec(codigo_motor, namespace)
    return namespace


MOTOR = cargar_motor()


def formatear_euros(valor):
    return f"{valor:,.2f} €"


def calcular_nomina_resumen(bruto, anio, pagas):
    parametros = MOTOR["obtener_parametros"](anio)
    coste, ss_empresa, ss_trabajador, irpf, neto = MOTOR["calcular_nomina_agregada"](
        bruto, anio, parametros
    )
    return {
        "Año": anio,
        "Bruto anual": bruto,
        "Coste empresa": coste,
        "SS empresa": ss_empresa,
        "SS trabajador": ss_trabajador,
        "IRPF": irpf,
        "Neto anual": neto,
        f"Neto mensual ({pagas}p)": neto / pagas,
    }


def calcular_marginal(anio, desde, hasta, paso):
    salarios = np.arange(desde, hasta + paso, paso)
    filas = []
    anterior = None

    for bruto in salarios:
        if bruto > hasta:
            continue

        resumen = calcular_nomina_resumen(float(bruto), anio, pagas=12)
        fila = {
            "Año": anio,
            "Bruto anual": resumen["Bruto anual"],
            "Neto anual": resumen["Neto anual"],
            "Subida bruta": 0.0,
            "Subida neta": 0.0,
            "Tipo marginal efectivo": 0.0,
        }

        if anterior is not None:
            subida_bruta = fila["Bruto anual"] - anterior["Bruto anual"]
            subida_neta = fila["Neto anual"] - anterior["Neto anual"]
            fila["Subida bruta"] = subida_bruta
            fila["Subida neta"] = subida_neta
            if subida_bruta:
                fila["Tipo marginal efectivo"] = (1 - subida_neta / subida_bruta) * 100

        filas.append(fila)
        anterior = fila

    return filas


def calcular_comparativa_ipc(bruto_actual, anio_base, anio_actual, pagas):
    inflacion = MOTOR["obtener_inflacion_acumulada"](anio_base, anio_actual)
    bruto_base = bruto_actual / inflacion

    base = calcular_nomina_resumen(bruto_base, anio_base, pagas)
    actual = calcular_nomina_resumen(bruto_actual, anio_actual, pagas)
    irpf_base_actualizado = base["IRPF"] * inflacion
    neto_base_actualizado = base["Neto anual"] * inflacion
    tipo_base = irpf_base_actualizado / bruto_actual * 100 if bruto_actual else 0.0
    tipo_actual = actual["IRPF"] / bruto_actual * 100 if bruto_actual else 0.0
    diferencia_irpf = actual["IRPF"] - irpf_base_actualizado
    diferencia_neto = actual["Neto anual"] - neto_base_actualizado

    return [
        {
            "Concepto": f"{anio_base} equiv.",
            "Año": anio_base,
            "Bruto nominal": bruto_base,
            f"Bruto {anio_actual}": bruto_actual,
            "IPC": inflacion,
            f"IRPF {anio_actual}": irpf_base_actualizado,
            "Tipo IRPF": tipo_base,
            "Dif. tipo": 0.0,
            f"Neto {anio_actual}": neto_base_actualizado,
            "Dif. IRPF": 0.0,
            f"Dif. neto/mes ({pagas}p)": 0.0,
        },
        {
            "Concepto": f"{anio_actual} actual",
            "Año": anio_actual,
            "Bruto nominal": bruto_actual,
            f"Bruto {anio_actual}": bruto_actual,
            "IPC": 1.0,
            f"IRPF {anio_actual}": actual["IRPF"],
            "Tipo IRPF": tipo_actual,
            "Dif. tipo": tipo_actual - tipo_base,
            f"Neto {anio_actual}": actual["Neto anual"],
            "Dif. IRPF": diferencia_irpf,
            f"Dif. neto/mes ({pagas}p)": diferencia_neto / pagas,
        },
    ]


def imprimir_tabla(filas):
    if not filas:
        print("No hay filas para mostrar.")
        return

    columnas = list(filas[0].keys())
    filas_texto = []
    for fila in filas:
        valores = []
        for columna in columnas:
            valor = fila[columna]
            if columna == "Año":
                valores.append(str(valor))
            elif columna in {"Concepto"}:
                valores.append(str(valor))
            elif columna in {"Tipo marginal efectivo", "Tipo IRPF"}:
                valores.append(f"{valor:,.2f} %")
            elif columna == "Dif. tipo":
                valores.append(f"{valor:,.2f} p.p.")
            elif columna == "IPC":
                valores.append(f"{valor:,.4f}x")
            else:
                valores.append(formatear_euros(valor))
        filas_texto.append(valores)

    anchos = [
        max(len(str(columna)), *(len(fila[i]) for fila in filas_texto))
        for i, columna in enumerate(columnas)
    ]
    cabecera = " | ".join(str(columna).ljust(anchos[i]) for i, columna in enumerate(columnas))
    separador = "-+-".join("-" * ancho for ancho in anchos)

    print(cabecera)
    print(separador)
    for fila in filas_texto:
        print(" | ".join(valor.rjust(anchos[i]) for i, valor in enumerate(fila)))


def cmd_salario(args):
    imprimir_tabla([calcular_nomina_resumen(args.bruto, args.anio, args.pagas)])


def cmd_tabla(args):
    salarios = np.arange(args.desde, args.hasta + args.paso, args.paso)
    filas = [
        calcular_nomina_resumen(float(bruto), args.anio, args.pagas)
        for bruto in salarios
        if bruto <= args.hasta
    ]
    imprimir_tabla(filas)


def cmd_comparar(args):
    if args.desde_anio > args.hasta_anio:
        raise SystemExit("--desde-anio no puede ser mayor que --hasta-anio")

    filas = [
        calcular_nomina_resumen(args.bruto, anio, args.pagas)
        for anio in range(args.desde_anio, args.hasta_anio + 1)
    ]
    imprimir_tabla(filas)


def cmd_marginal(args):
    if args.desde > args.hasta:
        raise SystemExit("--desde no puede ser mayor que --hasta")
    if args.paso <= 0:
        raise SystemExit("--paso debe ser mayor que 0")

    imprimir_tabla(calcular_marginal(args.anio, args.desde, args.hasta, args.paso))


def cmd_ipc(args):
    if args.anio_base >= args.anio_actual:
        raise SystemExit("--anio-base debe ser anterior a --anio-actual")

    imprimir_tabla(
        calcular_comparativa_ipc(
            args.bruto_actual,
            args.anio_base,
            args.anio_actual,
            args.pagas,
        )
    )


def crear_parser():
    parser = argparse.ArgumentParser(
        description="Consulta rápida de salario neto, IRPF y Seguridad Social en España (2012-2026)."
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    ipc = subparsers.add_parser(
        "ipc",
        help="Compara un salario actual con su equivalente real en un año anterior.",
    )
    ipc.add_argument("bruto_actual", type=float, help="Salario bruto anual del año actual.")
    ipc.add_argument("--anio-base", type=int, default=2019, choices=range(2012, 2027), metavar="YYYY")
    ipc.add_argument("--anio-actual", type=int, default=2026, choices=range(2012, 2027), metavar="YYYY")
    ipc.add_argument("--pagas", type=int, default=12, help="Número de pagas para la diferencia mensual.")
    ipc.set_defaults(func=cmd_ipc)

    marginal = subparsers.add_parser(
        "marginal",
        help="Muestra cuánto neto queda de cada subida bruta dentro de un rango.",
    )
    marginal.add_argument("--anio", type=int, default=2026, choices=range(2012, 2027), metavar="YYYY")
    marginal.add_argument("--desde", type=float, default=15000, help="Primer bruto anual.")
    marginal.add_argument("--hasta", type=float, default=25000, help="Último bruto anual.")
    marginal.add_argument("--paso", type=float, default=500, help="Salto entre salarios.")
    marginal.set_defaults(func=cmd_marginal)

    salario = subparsers.add_parser("salario", help="Calcula una nómina anual concreta.")
    salario.add_argument("bruto", type=float, help="Salario bruto anual.")
    salario.add_argument("--anio", type=int, default=2026, choices=range(2012, 2027), metavar="YYYY")
    salario.add_argument("--pagas", type=int, default=12, help="Número de pagas para el neto mensual.")
    salario.set_defaults(func=cmd_salario)

    tabla = subparsers.add_parser("tabla", help="Genera una tabla ligera por rango salarial.")
    tabla.add_argument("--anio", type=int, default=2026, choices=range(2012, 2027), metavar="YYYY")
    tabla.add_argument("--desde", type=float, default=15000, help="Primer bruto anual.")
    tabla.add_argument("--hasta", type=float, default=100000, help="Último bruto anual.")
    tabla.add_argument("--paso", type=float, default=5000, help="Salto entre salarios.")
    tabla.add_argument("--pagas", type=int, default=12, help="Número de pagas para el neto mensual.")
    tabla.set_defaults(func=cmd_tabla)

    comparar = subparsers.add_parser("comparar", help="Compara un mismo bruto nominal entre años.")
    comparar.add_argument("bruto", type=float, help="Salario bruto anual.")
    comparar.add_argument("--desde-anio", type=int, default=2012, choices=range(2012, 2027), metavar="YYYY")
    comparar.add_argument("--hasta-anio", type=int, default=2026, choices=range(2012, 2027), metavar="YYYY")
    comparar.add_argument("--pagas", type=int, default=12, help="Número de pagas para el neto mensual.")
    comparar.set_defaults(func=cmd_comparar)

    return parser


def main():
    args = crear_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
