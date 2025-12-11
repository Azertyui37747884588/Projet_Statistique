import pandas as pd

def numeric_columns(df: pd.DataFrame):
    return [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]

def categorical_columns(df: pd.DataFrame, max_unique: int = 30):
    return [c for c in df.columns if (not pd.api.types.is_numeric_dtype(df[c])) or df[c].nunique() <= max_unique]

def interp_pvalue(p: float) -> str:
    if p < 0.001:
        return "Très forte évidence contre H0 (p < 0,001)."
    elif p < 0.01:
        return "Forte évidence contre H0 (p < 0,01)."
    elif p < 0.05:
        return "Évidence modérée contre H0 (p < 0,05)."
    else:
        return "Pas d'évidence suffisante pour rejeter H0 (p ≥ 0,05)."
