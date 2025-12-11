from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd
import plotly.express as px
from scipy import stats

from backend.services.data_store import DataStore


def _get_df_or_raise() -> pd.DataFrame:
    df = DataStore.get_df()
    if df is None:
        raise ValueError("Aucune donnée téléversée.")
    return df


def _fig_to_png_bytes(fig) -> bytes:
    """Render a Plotly figure to PNG bytes using kaleido."""
    # Using Plotly's built-in renderer (kaleido) to produce PNG bytes
    return fig.to_image(format="png")


def histogram(var: str, bins: int = 30) -> bytes:
    df = _get_df_or_raise()
    if var not in df.columns:
        raise ValueError(f"Colonne '{var}' introuvable dans le DataFrame.")

    df_plot = df[[var]].dropna()
    if df_plot.empty:
        raise ValueError(f"Pas de données pour la colonne {var}.")

    fig = px.histogram(df_plot, x=var, nbins=bins, title=f"Histogramme de {var}")
    return _fig_to_png_bytes(fig)


def boxplot(y: str, x: Optional[str] = None) -> bytes:
    df = _get_df_or_raise()
    if y not in df.columns:
        raise ValueError(f"Colonne '{y}' introuvable dans le DataFrame.")

    if x is None:
        fig = px.box(df, y=y, title=f"Boxplot de {y}")
    else:
        if x not in df.columns:
            raise ValueError(f"Colonne '{x}' introuvable dans le DataFrame.")
        fig = px.box(df, x=x, y=y, title=f"{y} par {x}")

    return _fig_to_png_bytes(fig)


def scatter(x: str, y: str, hue: Optional[str] = None) -> bytes:
    df = _get_df_or_raise()
    if x not in df.columns or y not in df.columns:
        raise ValueError("Colonnes invalides.")

    cols = [x, y] + ([hue] if hue else [])
    df_plot = df[cols].dropna()
    if df_plot.empty:
        raise ValueError(f"Pas assez de données pour tracer le scatter entre {x} et {y}.")

    if hue and hue in df_plot.columns:
        fig = px.scatter(df_plot, x=x, y=y, color=hue, title=f"{x} vs {y}")
    else:
        fig = px.scatter(df_plot, x=x, y=y, title=f"{x} vs {y}")

    return _fig_to_png_bytes(fig)


def line(y: str, order_by: str) -> bytes:
    """
    Pour compatibilité : la précédente 'courbe' est remplacée par un Camembert (pie)
    représentant la répartition de la colonne `y`.
    """
    df = _get_df_or_raise()
    if y not in df.columns:
        raise ValueError(f"Colonne '{y}' introuvable dans le DataFrame.")

    counts = df[y].value_counts(dropna=False).reset_index()
    counts.columns = [y, "count"]
    fig = px.pie(counts, names=y, values="count", title=f"Répartition de {y}")
    return _fig_to_png_bytes(fig)


def kde(var: str) -> bytes:
    df = _get_df_or_raise()
    if var not in df.columns:
        raise ValueError(f"Colonne '{var}' introuvable dans le DataFrame.")

    series = pd.to_numeric(df[var], errors="coerce").dropna()
    if series.empty:
        raise ValueError(f"Pas de données numériques pour la colonne {var}.")

    kde_est = stats.gaussian_kde(series.values)
    xs = np.linspace(series.min(), series.max(), 300)
    ys = kde_est(xs)
    fig = px.line(x=xs, y=ys, labels={"x": var, "y": "Densité"}, title=f"KDE de {var}")
    return _fig_to_png_bytes(fig)


def bar(cat: str, topk: int = 10) -> bytes:
    df = _get_df_or_raise()
    if cat not in df.columns:
        raise ValueError(f"Colonne '{cat}' introuvable dans le DataFrame.")

    counts = df[cat].value_counts(dropna=False).head(topk).reset_index()
    counts.columns = [cat, "count"]
    fig = px.bar(counts, x=cat, y="count", title=f"Top {topk} de {cat}")
    return _fig_to_png_bytes(fig)

