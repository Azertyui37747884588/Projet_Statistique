from fastapi import APIRouter, UploadFile, Form
import pandas as pd
from io import StringIO
from backend.services.data_store import DataStore
from backend.services.utils.helpers import numeric_columns, categorical_columns

router = APIRouter()

@router.post("/upload")
async def upload_csv(file: UploadFile):
    """
    Téléverser un CSV, détecter le séparateur automatiquement,
    le sauvegarder en mémoire et renvoyer les colonnes disponibles.
    """
    try:
        # === Lire le fichier entier ===
        raw = await file.read()
        
        # === Détection automatique du séparateur ===
        sample = raw[:10000].decode("utf-8", errors="ignore")
        sep = ","
        if sample.count(";") > sample.count(",") and sample.count(";") > sample.count("\t"):
            sep = ";"
        elif sample.count("\t") > sample.count(","):
            sep = "\t"

        # === Lecture complète du fichier CSV ===
        df = pd.read_csv(StringIO(raw.decode("utf-8", errors="ignore")), sep=sep)
        
        # === Sauvegarde en mémoire via DataStore ===
        DataStore.set_df(df)

        # === Réponse JSON envoyée au frontend ===
        return {
            "message": "Fichier téléversé avec succès.",
            "rows": int(df.shape[0]),
            "cols": int(df.shape[1]),
            "sep": sep,
            "columns": list(df.columns),
        }

    except Exception as e:
        return {"detail": f"Erreur lors du téléversement : {str(e)}"}

# --- Cible (colonne à prédire éventuellement)
@router.post("/set-target")
async def set_target(target: str | None = Form(None)):
    DataStore.set_target(target)
    return {"target": target}

# --- Aperçu des données (10 premières lignes)
@router.get("/preview")
def preview(n: int = 10):
    df = DataStore.get_df()
    if df is None:
        return {"error": "Aucune donnée téléversée."}
    return {"head": df.head(n).to_dict(orient="records")}


@router.get("/column-values")
def column_values(var: str, n: int | None = None):
    """Retourne les valeurs d'une colonne (optionnellement tronquées) pour calculs côté client."""
    df = DataStore.get_df()
    if df is None:
        return {"error": "Aucune donnée téléversée."}
    if var not in df.columns:
        return {"error": f"Colonne '{var}' introuvable."}
    series = df[var].dropna()
    # Convertir en valeurs simples (numériques si possible)
    try:
        vals = pd.to_numeric(series, errors='coerce').dropna().tolist()
    except Exception:
        vals = series.astype(str).tolist()
    if n:
        vals = vals[:int(n)]
    return {"values": vals}

# --- Liste des colonnes disponibles
@router.get("/columns")
def columns():
    df = DataStore.get_df()
    if df is None:
        return {"error": "Aucune donnée téléversée."}
    return {
        "all": list(df.columns),
        "numeric": numeric_columns(df),
        "categorical": categorical_columns(df),
        "target": DataStore.get_target()
    }

# --- Route de débogage pour vérifier les données
@router.get("/debug")
async def debug_data():
    df = DataStore.get_df()
    return {
        "data_loaded": df is not None,
        "columns": df.columns.tolist() if df is not None else [],
        "shape": df.shape if df is not None else "No data",
        "rows_count": len(df) if df is not None else 0
    }