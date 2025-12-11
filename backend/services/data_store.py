from __future__ import annotations
import pandas as pd
from typing import Optional

class DataStore:
    """
    Stocke le DataFrame téléversé et la cible choisie.
    (Simple, en mémoire. Pour la production, utiliser une base ou un cache persistant.)
    """
    _df: Optional[pd.DataFrame] = None
    _target: Optional[str] = None

    @classmethod
    def set_df(cls, df: pd.DataFrame) -> None:
        cls._df = df

    @classmethod
    def get_df(cls) -> Optional[pd.DataFrame]:
        return cls._df

    @classmethod
    def set_target(cls, target: Optional[str]) -> None:
        cls._target = target

    @classmethod
    def get_target(cls) -> Optional[str]:
        return cls._target
