import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

def predict_manual(age: float, bmi: float, systolic_bp: float,
                   glucose_fasting: float, hba1c: float, family_history: int,
                   threshold: float = 0.5):
    # Jeu d'entraînement synthétique
    X_train = pd.DataFrame({
        "age": np.random.randint(18, 80, 300),
        "bmi": np.random.uniform(18, 40, 300),
        "systolic_bp": np.random.randint(90, 170, 300),
        "glucose_fasting": np.random.randint(70, 220, 300),
        "hba1c": np.random.uniform(4.5, 10.5, 300),
        "family_history": np.random.randint(0, 2, 300),
    })
    y_train = ((X_train["glucose_fasting"] > 125) | (X_train["hba1c"] > 6.4)).astype(int)

    scaler = StandardScaler()
    model = LogisticRegression(max_iter=1000)
    X_scaled = scaler.fit_transform(X_train)
    model.fit(X_scaled, y_train)

    x_user = np.array([[age, bmi, systolic_bp, glucose_fasting, hba1c, family_history]])
    proba = float(model.predict_proba(scaler.transform(x_user))[0, 1])
    decision = "Diabétique" if proba >= threshold else "Non diabétique"

    return {"probability": proba, "threshold": float(threshold), "result": decision}
