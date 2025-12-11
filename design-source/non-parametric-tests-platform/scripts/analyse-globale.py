import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import (
    kruskal, spearmanr, friedmanchisquare, ks_2samp
)
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

def analyse_globale(df, cible='diagnosed_diabetes'):
    """
    Analyse universelle de toutes les variables de la base :
    - Nettoyage automatique
        - Application des tests non paramétriques :
            Kruskal-Wallis, Spearman, Kolmogorov-Smirnov, Friedman
    - Correction automatique des erreurs courantes
    - Visualisation (boxplot et courbes)
    - Prédiction du risque de diabète
    """

    print("🚀 Lancement de l'analyse complète de la base...\n")

    # === 1. Nettoyage global de la base ===
    df = df.copy()
    df = df.dropna(how='all')
    df = df.drop_duplicates()

    # Conversion automatique des types
    for col in df.columns:
        try:
            df[col] = pd.to_numeric(df[col], errors='ignore')
        except Exception:
            pass

    # === 2. Séparation numérique / catégorielle ===
    var_num = [col for col in df.select_dtypes(include=['int', 'float']).columns if col != cible]
    var_cat = [col for col in df.select_dtypes(include=['object', 'category']).columns]

    print(f"🔹 Variables numériques détectées : {var_num}")
    print(f"🔹 Variables catégorielles détectées : {var_cat}\n")

    # === 3. Fonction de correction pour éviter les erreurs ===
    def groupes_valides(series, group):
        """
        Retourne uniquement les groupes valides pour les tests non paramétriques
        """
        grp = [g[series.name].dropna().values for _, g in df.groupby(group) if len(g) > 1]
        return [g for g in grp if len(g) > 1]

    # === 4. Boucle sur toutes les combinaisons ===
    for cat in var_cat:
        for num in var_num:
            print(f"\n==============================")
            print(f"📊 Analyse de {num} selon {cat}")
            print(f"==============================")

            groupes = groupes_valides(df[num], cat)

            if len(groupes) < 2:
                print(f"⚠ Pas assez de groupes valides pour {cat}. Passage à la suite.")
                continue

            # ➤ Test de Kruskal-Wallis
            try:
                stat, p = kruskal(*groupes)
                print(f"   Kruskal-Wallis : H={stat:.3f}, p={p:.4f}")
            except Exception as e:
                print(f"   Erreur Kruskal : {e}")

            # ➤ Test de Spearman
            try:
                le = LabelEncoder()
                codes = le.fit_transform(df[cat].astype(str))
                r, p_s = spearmanr(df[num], codes)
                print(f"   Spearman : r={r:.3f}, p={p_s:.4f}")
            except Exception as e:
                print(f"   Erreur Spearman : {e}")

            # ➤ (test omitted) - removed from the automated script

            # ➤ Test de Kolmogorov-Smirnov (comparaison distribution)
            try:
                if len(groupes) >= 2:
                    ks_stat, ks_p = ks_2samp(groupes[0], groupes[1])
                    print(f"   Kolmogorov-Smirnov : KS={ks_stat:.3f}, p={ks_p:.4f}")
            except Exception as e:
                print(f"   Erreur Kolmogorov-Smirnov : {e}")

            # ➤ Test de Friedman (si 3 groupes ou plus)
            try:
                if len(groupes) >= 3:
                    stat_f, p_f = friedmanchisquare(*groupes[:3])
                    print(f"   Friedman : χ²={stat_f:.3f}, p={p_f:.4f}")
            except Exception as e:
                print(f"   Erreur Friedman : {e}")

            # ➤ Visualisations
            try:
                plt.figure(figsize=(7, 5))
                sns.boxplot(x=cat, y=num, data=df)
                plt.title(f"Boxplot de {num} selon {cat}")
                plt.xticks(rotation=45)
                plt.tight_layout()
                plt.show()
            except Exception as e:
                print(f"   ⚠ Erreur d’affichage du boxplot : {e}")

            try:
                le = LabelEncoder()
                codes = le.fit_transform(df[cat].astype(str))
                plt.figure(figsize=(6, 4))
                plt.plot(df[num], codes, 'o', alpha=0.5)
                plt.title(f"Courbe {num} vs {cat} (codé)")
                plt.xlabel(num)
                plt.ylabel(cat)
                plt.tight_layout()
                plt.show()
            except Exception as e:
                print(f"   ⚠ Erreur d’affichage de la courbe : {e}")

    # === 5. Section Prédiction du Diabète ===
    print("\n🤖 [IA] Prédiction du risque de diabète en cours...")

    try:
        df_pred = df.copy().dropna(subset=[cible])
        label_encoders = {}

        for col in df_pred.select_dtypes(include=['object', 'category']).columns:
            le = LabelEncoder()
            df_pred[col] = le.fit_transform(df_pred[col].astype(str))
            label_encoders[col] = le

        X = df_pred.drop(columns=[cible])
        y = df_pred[cible].astype(int)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        score = model.score(X_test, y_test)

        print(f"   ✅ Modèle entraîné (précision : {score*100:.2f}%)")

        example = np.array([X.mean().values])
        pred = model.predict(example)[0]
        print(f"   🔮 Prédiction pour un individu moyen : {'Diabétique' if pred==1 else 'Non diabétique'}")

    except Exception as e:
        print(f"🚫 Erreur lors de la prédiction : {e}")

    print("\n✅ Analyse complète terminée avec succès.")
