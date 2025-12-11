from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np

# ✅ Import correct depuis ton dossier services
from backend.services.stats_services import (
    spearman_corr,
    kruskal_test,
    ks_two_samples,
    friedman_test,
    mann_whitney,
    chi2_test,
)
from backend.services.data_store import DataStore

router = APIRouter()

class TestInput(BaseModel):
    var1: str
    var2: str | None = None

def _convert_to_numeric(series):
    """Convertit une série en numérique, gère les erreurs"""
    try:
        return pd.to_numeric(series, errors='coerce').dropna()
    except:
        return pd.Series(dtype=float)

# ===========================
#     TESTS NON PARAMÉTRIQUES
# ===========================

@router.post("/spearman")
def spearman_route(data: TestInput):
    """Test de corrélation entre deux variables numériques"""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if data.var1 not in df.columns or data.var2 not in df.columns:
        raise HTTPException(status_code=400, detail="Colonnes invalides.")
    
    try:
        # Conversion en numérique
        var1_data = _convert_to_numeric(df[data.var1])
        var2_data = _convert_to_numeric(df[data.var2])
        
        if len(var1_data) == 0 or len(var2_data) == 0:
            raise HTTPException(status_code=400, detail="Variables non numériques ou données manquantes")
        
        res = spearman_corr(var1_data, var2_data)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du test Spearman: {str(e)}")

@router.post("/mannwhitney")
def mannwhitney_route(data: TestInput):
    """Test Mann-Whitney pour comparer deux variables numériques indépendantes"""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if data.var1 not in df.columns or data.var2 not in df.columns:
        raise HTTPException(status_code=400, detail="Colonnes invalides.")
    
    try:
        # Conversion en numérique
        var1_data = _convert_to_numeric(df[data.var1])
        var2_data = _convert_to_numeric(df[data.var2])
        
        if len(var1_data) == 0 or len(var2_data) == 0:
            raise HTTPException(status_code=400, detail="Variables non numériques ou données manquantes")
        
        # Vérifier qu'il y a assez de données
        if len(var1_data) < 3 or len(var2_data) < 3:
            raise HTTPException(status_code=400, detail="Pas assez de données (minimum 3 observations par variable)")
        
        # Utiliser mann_whitney pour comparer les deux distributions
        res = mann_whitney(var1_data, var2_data)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du test Mann-Whitney: {str(e)}")

@router.post("/kruskal")
def kruskal_route(data: TestInput):
    """Test Kruskal-Wallis pour comparer deux variables numériques"""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if data.var1 not in df.columns or data.var2 not in df.columns:
        raise HTTPException(status_code=400, detail="Colonnes invalides.")
    
    try:
        # Conversion en numérique
        var1_data = _convert_to_numeric(df[data.var1])
        var2_data = _convert_to_numeric(df[data.var2])
        
        if len(var1_data) == 0 or len(var2_data) == 0:
            raise HTTPException(status_code=400, detail="Variables non numériques ou données manquantes")
        
        # Pour Kruskal-Wallis avec deux variables, on les traite comme deux groupes
        res = kruskal_test([var1_data.values, var2_data.values])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du test Kruskal-Wallis: {str(e)}")

@router.post("/friedman")
def friedman_route(data: TestInput):
    """Test Friedman pour données appariées"""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    
    try:
        if not data.var1 or not data.var2:
            raise HTTPException(status_code=400, detail="Le test Friedman nécessite deux variables")
        
        # Conversion en numérique
        var1_data = _convert_to_numeric(df[data.var1])
        var2_data = _convert_to_numeric(df[data.var2])
        
        if len(var1_data) == 0 or len(var2_data) == 0:
            raise HTTPException(status_code=400, detail="Variables non numériques ou données manquantes")
        
        # Trouver une troisième variable numérique
        numeric_cols = df.select_dtypes(include=['number']).columns
        other_numeric_cols = [col for col in numeric_cols if col not in [data.var1, data.var2]]
        
        if len(other_numeric_cols) == 0:
            # Si pas de troisième variable numérique, utiliser les deux premières
            raise HTTPException(status_code=400, detail="Le test Friedman nécessite une troisième variable numérique")
        
        third_var = other_numeric_cols[0]
        var3_data = _convert_to_numeric(df[third_var])
        
        # Prendre le minimum d'observations communes
        min_len = min(len(var1_data), len(var2_data), len(var3_data))
        if min_len < 10:
            raise HTTPException(status_code=400, detail="Pas assez de données pour le test Friedman (minimum 10 observations)")
        
        # Tronquer à la même longueur
        var1_data = var1_data.values[:min_len]
        var2_data = var2_data.values[:min_len] 
        var3_data = var3_data.values[:min_len]
        
        res = friedman_test([var1_data, var2_data, var3_data])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du test Friedman: {str(e)}")

@router.post("/ks")
def ks_route(data: TestInput):
    """Test Kolmogorov-Smirnov pour comparer deux distributions"""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if data.var1 not in df.columns or data.var2 not in df.columns:
        raise HTTPException(status_code=400, detail="Colonnes invalides.")
    
    try:
        # Conversion en numérique
        var1_data = _convert_to_numeric(df[data.var1])
        var2_data = _convert_to_numeric(df[data.var2])
        
        if len(var1_data) == 0 or len(var2_data) == 0:
            raise HTTPException(status_code=400, detail="Variables non numériques ou données manquantes")
        
        res = ks_two_samples(var1_data, var2_data)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du test Kolmogorov-Smirnov: {str(e)}")


@router.post("/chi2")
def chi2_route(data: TestInput):
    """Test du Chi² d'indépendance entre deux variables catégorielles"""
    df = DataStore.get_df()
    if df is None:
        raise HTTPException(status_code=400, detail="Aucune donnée téléversée.")
    if not data.var1 or not data.var2:
        raise HTTPException(status_code=400, detail="Le test Chi² nécessite deux variables.")
    if data.var1 not in df.columns or data.var2 not in df.columns:
        raise HTTPException(status_code=400, detail="Colonnes invalides.")

    try:
        # On convertit en catégories (string) pour construire la table de contingence
        a = df[data.var1].astype(str).fillna('NA')
        b = df[data.var2].astype(str).fillna('NA')
        # Si l'une des colonnes a trop de modalités, prévenir
        if a.nunique() > 100 or b.nunique() > 100:
            raise HTTPException(status_code=400, detail="Trop de modalités pour effectuer le test Chi² (max 100 par variable).")

        res = chi2_test(df, data.var1, data.var2)
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du test Chi²: {str(e)}")