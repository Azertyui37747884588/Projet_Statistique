"""
Script de test pour l'analyse globale avec des données d'exemple
"""
import pandas as pd
import numpy as np

# Créer un jeu de données d'exemple pour tester le script
np.random.seed(42)

n_samples = 200

# Générer des données d'exemple
data = {
    'age': np.random.randint(20, 80, n_samples),
    'bmi': np.random.normal(28, 5, n_samples),
    'glucose': np.random.normal(120, 30, n_samples),
    'blood_pressure': np.random.normal(80, 15, n_samples),
    'cholesterol': np.random.normal(200, 40, n_samples),
    'gender': np.random.choice(['Male', 'Female'], n_samples),
    'smoking': np.random.choice(['Yes', 'No'], n_samples),
    'physical_activity': np.random.choice(['Low', 'Medium', 'High'], n_samples),
    'diagnosed_diabetes': np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
}

df = pd.DataFrame(data)

print("📊 Données d'exemple créées avec succès!")
print(f"   Dimensions: {df.shape}")
print(f"   Colonnes: {list(df.columns)}")
print(f"\n🔍 Aperçu des données:")
print(df.head())
print(f"\n📈 Statistiques descriptives:")
print(df.describe())

# Importer et exécuter l'analyse
print("\n" + "="*60)
print("🚀 LANCEMENT DE L'ANALYSE GLOBALE")
print("="*60 + "\n")

# Importer la fonction depuis le script
import sys
sys.path.append('scripts')

try:
    from analyse_globale import analyse_globale
    
    # Exécuter l'analyse
    analyse_globale(df, cible='diagnosed_diabetes')
    
except ImportError:
    print("⚠️ Impossible d'importer le module. Exécution directe du code...")
    
    # Si l'import échoue, exécuter le code directement
    exec(open('scripts/analyse-globale.py').read())
    analyse_globale(df, cible='diagnosed_diabetes')
