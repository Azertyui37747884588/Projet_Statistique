from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import base64

# ✅ Imports corrigés (avec le bon chemin complet)
from backend.services.viz_services import (
    histogram,
    boxplot,
    scatter,
    line,
    kde,
    bar
)
from backend.services.data_store import DataStore

router = APIRouter()

# ===========================
# VISUALISATIONS DES DONNÉES
# ===========================

def _encode_fig_to_base64(fig_bytes: bytes) -> str:
    """Convertit les graphiques en Base64 pour affichage web."""
    return base64.b64encode(fig_bytes).decode("utf-8")


@router.get("/histogram")
def histogram_endpoint(var: str, bins: int = Query(30, ge=1, le=200)):
    """Affiche un histogramme pour une variable numérique."""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if var not in df.columns:
        raise HTTPException(status_code=400, detail=f"Colonne '{var}' introuvable.")
    
    try:
        fig_bytes = histogram(var, bins)
        return {"type": "histogram", "image_base64": _encode_fig_to_base64(fig_bytes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création histogramme : {e}")


@router.get("/boxplot")
def boxplot_endpoint(y: str, x: Optional[str] = None):
    """Affiche une boîte à moustaches (Boxplot) d'une variable numérique, optionnellement groupée."""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if y not in df.columns:
        raise HTTPException(status_code=400, detail=f"Colonne '{y}' invalide.")
    if x and x not in df.columns:
        raise HTTPException(status_code=400, detail=f"Colonne '{x}' invalide.")

    try:
        fig_bytes = boxplot(y, x)
        return {"type": "boxplot", "image_base64": _encode_fig_to_base64(fig_bytes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création boxplot : {e}")


@router.get("/scatter")
def scatter_endpoint(x: str, y: str, hue: Optional[str] = None):
    """Affiche un nuage de points (Scatter Plot)."""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if x not in df.columns or y not in df.columns:
        raise HTTPException(status_code=400, detail="Colonnes invalides.")

    try:
        fig_bytes = scatter(x, y, hue)
        return {"type": "scatter", "image_base64": _encode_fig_to_base64(fig_bytes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création scatter plot : {e}")


@router.get("/line")
def line_endpoint(y: str, order_by: str):
    """Affiche une courbe d’évolution."""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if y not in df.columns or order_by not in df.columns:
        raise HTTPException(status_code=400, detail="Colonnes invalides.")
    
    try:
        fig_bytes = line(y, order_by)
        return {"type": "line", "image_base64": _encode_fig_to_base64(fig_bytes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création courbe : {e}")


@router.get("/kde")
def kde_endpoint(var: str):
    """Affiche la densité (KDE) d’une variable numérique."""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if var not in df.columns:
        raise HTTPException(status_code=400, detail=f"Colonne '{var}' introuvable.")
    
    try:
        fig_bytes = kde(var)
        return {"type": "kde", "image_base64": _encode_fig_to_base64(fig_bytes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création KDE : {e}")


@router.get("/bar")
def bar_endpoint(cat: str, topk: int = Query(10, ge=1, le=50)):
    """Affiche un diagramme en barres pour une variable catégorielle."""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if cat not in df.columns:
        raise HTTPException(status_code=400, detail=f"Colonne '{cat}' introuvable.")
    
    try:
        fig_bytes = bar(cat, topk)
        return {"type": "bar", "image_base64": _encode_fig_to_base64(fig_bytes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création bar chart : {e}")
