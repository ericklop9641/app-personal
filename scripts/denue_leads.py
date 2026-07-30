"""
DENUE Lead Generator - TSROB
Extrae establecimientos de industria alimentaria / almacenamiento refrigerado
en la Zona Metropolitana de Monterrey, vía la API pública del DENUE (INEGI).

Requisitos:
    pip install requests pandas openpyxl

Uso:
    1. Copia .env.example a .env (junto a este script o en el directorio actual)
    2. Pon tu token del DENUE en DENUE_TOKEN (gratis en https://www.inegi.org.mx/servicios/api_denue.html)
    3. python denue_leads.py

Salida:
    tsrob_leads_denue.xlsx  -> listado completo, deduplicado, con link a Google Maps
"""

import os
import sys
import time

import pandas as pd
import requests


def cargar_env():
    """Carga variables desde un archivo .env (junto al script o en el cwd).

    Las variables ya definidas en el entorno tienen prioridad.
    """
    candidatos = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
        os.path.join(os.getcwd(), ".env"),
    ]
    for ruta in candidatos:
        if not os.path.isfile(ruta):
            continue
        with open(ruta, encoding="utf-8") as f:
            for linea in f:
                linea = linea.strip()
                if not linea or linea.startswith("#") or "=" not in linea:
                    continue
                clave, _, valor = linea.partition("=")
                clave = clave.strip()
                valor = valor.strip().strip('"').strip("'")
                if clave and clave not in os.environ:
                    os.environ[clave] = valor
        break


cargar_env()

TOKEN = os.environ.get("DENUE_TOKEN", "")
if not TOKEN:
    sys.exit(
        "Falta el token del DENUE. Copia .env.example a .env y define DENUE_TOKEN, "
        "o exporta la variable de entorno DENUE_TOKEN."
    )
ENTIDAD_NL = "19"

# Municipios de la Zona Metropolitana de Monterrey (clave INEGI de 3 dígitos)
MUNICIPIOS = {
    "039": "Monterrey",
    "006": "Apodaca",
    "026": "Guadalupe",
    "046": "San Nicolás de los Garza",
    "021": "General Escobedo",
    "048": "Santa Catarina",
    "018": "García",
    "031": "Juárez",
}

# Códigos SCIAN relevantes para carga refrigerada
# clave: código SCIAN, valor: etiqueta descriptiva
# La longitud del código determina en qué campo de la API se envía:
# 2 dígitos=sector, 3=subsector, 4=rama, 6=clase
CLASES_SCIAN = {
    "493130": "Almacenamiento con refrigeración",
    "311": "Industria alimentaria (subsector completo)",
    "4311": "Comercio al por mayor de alimentos, bebidas y tabaco",
}

# Estratos de personal ocupado a consultar (excluye 1-2: micro de 0-10 personas)
ESTRATOS = {
    "3": "11 a 30",
    "4": "31 a 50",
    "5": "51 a 100",
    "6": "101 a 250",
    "7": "251 y más",
}

BASE_URL = "https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarAreaActEstr"

PAGE_SIZE = 500
REINTENTOS = 3


def consultar_pagina(municipio, codigo_scian, estrato, reg_ini, reg_fin):
    """Llama BuscarAreaActEstr para un municipio + código SCIAN dados (una página)."""
    # Args: entidad/municipio/localidad/ageb/manzana/sector/subsector/rama/clase/
    #       nombre/reg_ini/reg_fin/id/estrato/token
    campos = {2: 5, 3: 6, 4: 7, 6: 8}  # longitud del código -> índice del campo
    if len(codigo_scian) not in campos:
        raise ValueError(f"Código SCIAN no soportado: {codigo_scian}")
    area = ["0"] * 9  # entidad..clase
    area[0], area[1] = ENTIDAD_NL, municipio
    area[campos[len(codigo_scian)]] = codigo_scian
    url = (
        f"{BASE_URL}/{'/'.join(area)}/0/"
        f"{reg_ini}/{reg_fin}/0/{estrato}/{TOKEN}"
    )
    for intento in range(1, REINTENTOS + 1):
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, dict) and "Message" in data:
                # La API responde con Message cuando no hay resultados en el rango
                return []
            return data
        except requests.exceptions.ConnectionError as e:
            # Peculiaridad de la API: cuando no hay resultados responde con una
            # línea de estado malformada ("HTTP/1.1 000") y la conexión aborta.
            if "BadStatusLine" in str(e) or "000" in str(e):
                return []
            if intento == REINTENTOS:
                print(f"  [error] {municipio}/{codigo_scian}/estrato {estrato}: {e}")
                return []
            time.sleep(2 ** intento)
        except requests.exceptions.RequestException as e:
            if intento == REINTENTOS:
                print(f"  [error] {municipio}/{codigo_scian}/estrato {estrato}: {e}")
                return []
            time.sleep(2 ** intento)
        except ValueError:
            print(
                f"  [error] {municipio}/{codigo_scian}/estrato {estrato}: "
                "respuesta no es JSON válido"
            )
            return []
    return []


def consultar(municipio, codigo_scian, estrato):
    """Obtiene todos los registros paginando de a PAGE_SIZE."""
    resultados = []
    reg_ini = 1
    while True:
        pagina = consultar_pagina(
            municipio, codigo_scian, estrato, reg_ini, reg_ini + PAGE_SIZE - 1
        )
        resultados.extend(pagina)
        if len(pagina) < PAGE_SIZE:
            break
        reg_ini += PAGE_SIZE
        time.sleep(0.3)  # cortesía con el servidor
    return resultados


def main():
    todos = []
    total_consultas = len(MUNICIPIOS) * len(CLASES_SCIAN)
    n = 0

    for mun_clave, mun_nombre in MUNICIPIOS.items():
        for scian_clave, scian_label in CLASES_SCIAN.items():
            n += 1
            print(f"[{n}/{total_consultas}] {mun_nombre} - {scian_label} ({scian_clave})")
            for estrato_clave, estrato_label in ESTRATOS.items():
                resultados = consultar(mun_clave, scian_clave, estrato_clave)
                if resultados:
                    print(f"  {estrato_label} personas: {len(resultados)}")
                for r in resultados:
                    r["_municipio"] = mun_nombre
                    r["_giro_buscado"] = scian_label
                    todos.append(r)
                time.sleep(0.3)  # cortesía con el servidor

    if not todos:
        print("No se obtuvieron resultados. Revisa el token o la conectividad.")
        sys.exit(1)

    df = pd.DataFrame(todos)
    print(f"\nTotal registros crudos: {len(df)}")

    # Normalizar nombres de columnas esperadas (la API a veces varía mayúsculas)
    df.columns = [c.strip() for c in df.columns]

    # Deduplicar por Id de establecimiento
    if "Id" in df.columns:
        df = df.drop_duplicates(subset=["Id"])
    print(f"Total tras deduplicar por Id: {len(df)}")

    # El filtro por estrato (11+ empleados) ya se aplicó en el servidor:
    # solo se consultaron los estratos 3-7. La columna Estrato viene como
    # texto descriptivo (p. ej. "11 a 30 personas").
    df_filtrado = df

    # Construir link de Google Maps para verificación visual
    lat_col = "Latitud" if "Latitud" in df_filtrado.columns else None
    lon_col = "Longitud" if "Longitud" in df_filtrado.columns else None
    if lat_col and lon_col:
        df_filtrado = df_filtrado.copy()
        df_filtrado["Google_Maps"] = df_filtrado.apply(
            lambda r: f"https://www.google.com/maps?q={r[lat_col]},{r[lon_col]}"
            if pd.notna(r[lat_col]) and pd.notna(r[lon_col]) else "",
            axis=1,
        )

    # Reordenar columnas útiles primero
    cols_prioritarias = [
        "_municipio", "_giro_buscado", "Nombre", "Razon_social",
        "Clase_actividad", "Estrato", "Calle", "Num_Exterior", "Colonia",
        "CP", "Telefono", "Correo_e", "Sitio_internet",
        "Latitud", "Longitud", "Google_Maps",
    ]
    cols_finales = [c for c in cols_prioritarias if c in df_filtrado.columns]
    cols_restantes = [c for c in df_filtrado.columns if c not in cols_finales]
    df_filtrado = df_filtrado[cols_finales + cols_restantes]

    # Exportar: hoja completa + hoja resumen por municipio/giro
    out_path = os.environ.get("DENUE_OUT", "tsrob_leads_denue.xlsx")
    out_dir = os.path.dirname(out_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        df_filtrado.to_excel(writer, sheet_name="Leads", index=False)
        if "_municipio" in df_filtrado.columns and "_giro_buscado" in df_filtrado.columns:
            resumen = (
                df_filtrado.groupby(["_municipio", "_giro_buscado"])
                .size()
                .reset_index(name="Total")
                .sort_values("Total", ascending=False)
            )
            resumen.to_excel(writer, sheet_name="Resumen", index=False)

    print(f"\nArchivo generado: {os.path.abspath(out_path)}")
    print(f"Filas finales (Leads): {len(df_filtrado)}")


if __name__ == "__main__":
    main()
