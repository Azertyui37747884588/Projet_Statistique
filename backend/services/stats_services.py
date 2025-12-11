import numpy as np
import pandas as pd
from scipy import stats
import warnings

warnings.filterwarnings('ignore')


# ===============================
# 🟦 FONCTIONS UTILITAIRES
# ===============================
def _clean_array(x):
    """Convertit en numpy array float et supprime les NaN."""
    x = np.array(x, dtype=float)
    return x[~np.isnan(x)]


def _safe_p(p):
    """Évite p = 0 tout en conservant l'information."""
    try:
        p = float(p)
    except Exception:
        return 1.0
    return max(p, 1e-16)


def interpret_pvalue(p):
    if p < 0.001:
        return "Différence hautement significative (p < 0.001)."
    elif p < 0.05:
        return "Différence statistiquement significative (p < 0.05)."
    else:
        return "Aucune différence statistiquement significative"


# ===============================
# 🟩 TESTS STATISTIQUES
# ===============================


def spearman_test(df: pd.DataFrame, col1: str, col2: str):
    if col1 not in df.columns or col2 not in df.columns:
        return {"error": "Colonnes non trouvées."}

    if not np.issubdtype(df[col1].dtype, np.number) or not np.issubdtype(df[col2].dtype, np.number):
        return {"error": "Les deux variables doivent être numériques pour Spearman."}

    x = _clean_array(df[col1])
    y = _clean_array(df[col2])

    valid_mask = (~np.isnan(x)) & (~np.isnan(y))
    x_clean = x[valid_mask]
    y_clean = y[valid_mask]

    corr, p = stats.spearmanr(x_clean, y_clean)

    return {
        "test": "Spearman",
        "correlation": float(corr),
        "n": int(len(x_clean)),
        "p_value": float(_safe_p(p)),
        "interpretation": interpret_pvalue(p),
        "suggestion": f"Testez la corrélation monotone entre {col1} et {col2}."
    }


def mann_whitney_test(df: pd.DataFrame, qual_col: str, quant_col: str):
    groups = df[qual_col].dropna().unique()
    if len(groups) != 2:
        return {"error": "Variable qualitative doit avoir exactement 2 groupes."}
    if not np.issubdtype(df[quant_col].dtype, np.number):
        return {"error": "Variable quantitative doit être numérique."}

    x = df[df[qual_col] == groups[0]][quant_col].dropna()
    y = df[df[qual_col] == groups[1]][quant_col].dropna()
    if len(x) < 2 or len(y) < 2:
        return {"error": "Chaque groupe doit avoir au moins 2 observations."}

    stat, p = stats.mannwhitneyu(x, y, alternative='two-sided')

    return {
        "test": "Mann–Whitney U",
        "groups": list(groups),
        "n1": int(len(x)),
        "n2": int(len(y)),
        "statistic": float(stat),
        "p_value": float(_safe_p(p)),
        "interpretation": interpret_pvalue(p),
        "suggestion": f"Variable qualitative: {qual_col}, Variable quantitative: {quant_col}"
    }


def kruskal_wallis_test(df: pd.DataFrame, qual_col: str, quant_col: str):
    groups_list = df[qual_col].dropna().unique()
    if len(groups_list) < 3:
        return {"error": "Variable qualitative doit avoir au moins 3 groupes."}
    if not np.issubdtype(df[quant_col].dtype, np.number):
        return {"error": "Variable quantitative doit être numérique."}

    samples = [df[df[qual_col] == g][quant_col].dropna() for g in groups_list]
    for i, s in enumerate(samples):
        if len(s) < 2:
            return {"error": f"Groupe {groups_list[i]} a moins de 2 observations."}

    stat, p = stats.kruskal(*samples)
    return {
        "test": "Kruskal–Wallis H",
        "groups": list(groups_list),
        "n_per_group": [int(len(s)) for s in samples],
        "statistic": float(stat),
        "p_value": float(_safe_p(p)),
        "interpretation": interpret_pvalue(p),
        "suggestion": f"Variable qualitative: {qual_col} (≥3 groupes), Variable quantitative: {quant_col}"
    }


def friedman_test(df: pd.DataFrame, group_cols: list[str]):
    if len(group_cols) < 2:
        return {"error": "Au moins 2 colonnes nécessaires pour Friedman."}

    arrays = [_clean_array(df[c].dropna()) for c in group_cols]
    min_len = min(len(a) for a in arrays)
    if min_len < 3:
        return {"error": "Taille minimale des observations pour Friedman = 3."}

    arrays_equal = [a[:min_len] for a in arrays]
    stat, p = stats.friedmanchisquare(*arrays_equal)
    return {
        "test": "Friedman",
        "k": len(arrays_equal),
        "n": int(min_len),
        "statistic": float(stat),
        "p_value": float(_safe_p(p)),
        "interpretation": interpret_pvalue(p),
        "suggestion": f"Colonnes appariées: {group_cols}"
    }


def ks_two_samples_test(df: pd.DataFrame, col1: str, col2: str):
    x = _clean_array(df[col1].dropna())
    y = _clean_array(df[col2].dropna())
    if len(x) < 2 or len(y) < 2:
        return {"error": "Chaque échantillon doit avoir au moins 2 observations."}

    stat, p = stats.ks_2samp(x, y, alternative='two-sided')
    return {
        "test": "Kolmogorov–Smirnov",
        "n1": int(len(x)),
        "n2": int(len(y)),
        "statistic": float(stat),
        "p_value": float(_safe_p(p)),
        "interpretation": interpret_pvalue(p),
        "suggestion": f"Comparaison des distributions entre {col1} et {col2}"
    }


def chi2_test(df: pd.DataFrame, col1: str, col2: str):
    if df[col1].dtype not in [object, "category"] or df[col2].dtype not in [object, "category"]:
        return {"error": "Chi² nécessite 2 variables catégorielles."}

    contingency = pd.crosstab(df[col1], df[col2])
    if contingency.size == 0:
        return {"error": "Table de contingence vide."}

    stat, p, dof, expected = stats.chi2_contingency(contingency)
    return {
        "test": "Chi² de Pearson",
        "contingency_table": contingency.to_dict(),
        "statistic": float(stat),
        "degrees_of_freedom": int(dof),
        "p_value": float(_safe_p(p)),
        "interpretation": interpret_pvalue(p),
        "suggestion": f"Variables catégorielles: {col1} et {col2}"
    }


# === Compatibilité avec les anciens noms importés par les routes ===
def spearman_corr(df_or_x, col1=None, col2=None):
    # Original routes passed series; maintain compatibility: allow (series_x, series_y) or (df, col1, col2)
    if isinstance(df_or_x, pd.DataFrame):
        return spearman_test(df_or_x, col1, col2)
    else:
        # assume two arrays
        x = _clean_array(df_or_x)
        y = _clean_array(col1)
        corr, p = stats.spearmanr(x, y)
        return {"test": "spearman", "correlation": float(corr), "p_value": float(_safe_p(p)), "n": int(len(x))}


def mann_whitney(df_or_x, col2=None):
    # If first arg is DataFrame, call new function; otherwise assume two arrays
    if isinstance(df_or_x, pd.DataFrame):
        return mann_whitney_test(df_or_x, col2, None)
    else:
        x = _clean_array(df_or_x)
        y = _clean_array(col2)
        stat, p = stats.mannwhitneyu(x, y, alternative='two-sided')
        return {"test": "mann_whitney", "statistic": float(stat), "p_value": float(_safe_p(p)), "n1": int(len(x)), "n2": int(len(y))}


def kruskal_test(groups):
    # if groups is (df, col1, col2) this wrapper won't be used; keep simple wrapper for previous interface
    try:
        groups_clean = [np.array(g[~np.isnan(g)]) for g in groups if len(g) > 0]
        stat, p = stats.kruskal(*groups_clean)
        return {"test": "kruskal_wallis", "statistic": float(stat), "p_value": float(_safe_p(p))}
    except Exception as e:
        return {"error": str(e)}


def ks_two_samples(x, y):
    x = _clean_array(x)
    y = _clean_array(y)
    stat, p = stats.ks_2samp(x, y, alternative='two-sided')
    return {"test": "kolmogorov_smirnov", "statistic": float(stat), "p_value": float(_safe_p(p)), "n1": int(len(x)), "n2": int(len(y))}
