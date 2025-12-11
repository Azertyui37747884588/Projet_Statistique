from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import logging
import pickle
import os

router = APIRouter()
logger = logging.getLogger(__name__)

class PredictionInput(BaseModel):
    age: float
    bmi: float
    systolic_bp: float
    glucose_fasting: float
    hba1c: float
    family_history: int
    latitude: float = 48.8566
    longitude: float = 2.3522

def load_model():
    """Charge le modèle ML entraîné"""
    try:
        # Chemin vers votre modèle sauvegardé
        model_path = "backend/models/diabetes_model.pkl"
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            logger.info("✅ Modèle ML chargé avec succès")
            return model
        else:
            logger.warning("⚠️ Modèle non trouvé, utilisation du mode simulation")
            return None
    except Exception as e:
        logger.error(f"❌ Erreur chargement modèle: {e}")
        return None

def simulate_prediction(age, bmi, systolic_bp, glucose_fasting, hba1c, family_history):
    """
    Simule une prédiction réaliste basée sur les caractéristiques médicales
    Remplacez cette fonction par votre vrai modèle ML
    """
    # Pondérations réalistes pour le diabète
    base_risk = 0.1
    
    # Âge : risque augmente avec l'âge
    age_factor = min(age / 80, 1.0) * 0.3
    
    # IMC : risque augmente avec l'obésité
    bmi_factor = 0
    if bmi < 18.5:      # Maigreur
        bmi_factor = 0.1
    elif bmi < 25:      # Normal
        bmi_factor = 0.05
    elif bmi < 30:      # Surpoids
        bmi_factor = 0.2
    else:               # Obésité
        bmi_factor = 0.4
    
    # Pression artérielle
    bp_factor = 0
    if systolic_bp < 120:    # Normal
        bp_factor = 0.05
    elif systolic_bp < 130:  # Élevé
        bp_factor = 0.15
    elif systolic_bp < 140:  # Hypertension stage 1
        bp_factor = 0.25
    else:                    # Hypertension stage 2
        bp_factor = 0.35
    
    # Glycémie à jeun (mg/dL)
    glucose_factor = 0
    if glucose_fasting < 100:   # Normal
        glucose_factor = 0.05
    elif glucose_fasting < 126: # Prédiabète
        glucose_factor = 0.4
    else:                       # Diabétique
        glucose_factor = 0.8
    
    # HbA1c (%)
    hba1c_factor = 0
    if hba1c < 5.7:     # Normal
        hba1c_factor = 0.05
    elif hba1c < 6.5:   # Prédiabète
        hba1c_factor = 0.5
    else:               # Diabétique
        hba1c_factor = 0.9
    
    # Antécédents familiaux
    family_factor = family_history * 0.15
    
    # Calcul du risque total
    total_risk = (
        base_risk + 
        age_factor + 
        bmi_factor + 
        bp_factor + 
        glucose_factor + 
        hba1c_factor + 
        family_factor
    )
    
    # Normalisation entre 0 et 1
    probability = min(max(total_risk, 0), 0.95)
    
    return probability

@router.post("/manual")
async def manual_prediction(input_data: PredictionInput):
    try:
        logger.info(f"📥 Données reçues: {input_data.dict()}")
        
        # Essayer de charger le vrai modèle d'abord
        model = load_model()
        
        if model:
            # Utiliser le vrai modèle ML
            features = np.array([[
                input_data.age,
                input_data.bmi, 
                input_data.systolic_bp,
                input_data.glucose_fasting,
                input_data.hba1c,
                input_data.family_history
            ]])
            probability = model.predict_proba(features)[0][1]  # Probabilité classe positive
        else:
            # Mode simulation avec logique réaliste
            probability = simulate_prediction(
                input_data.age,
                input_data.bmi,
                input_data.systolic_bp,
                input_data.glucose_fasting,
                input_data.hba1c,
                input_data.family_history
            )
        
        # Déterminer le résultat avec seuil à 0.5
        threshold = 0.5
        result = "Diabétique" if probability >= threshold else "Non diabétique"
        
        # Catégorie de risque
        risk_category = ""
        if probability < 0.3:
            risk_category = "Faible risque"
        elif probability < 0.7:
            risk_category = "Risque modéré"
        else:
            risk_category = "Haut risque"
        
        response_data = {
            "result": result,
            "probability": round(probability, 4),
            "probability_percent": round(probability * 100, 1),
            "threshold": threshold,
            "risk_category": risk_category,
            "status": "success",
            "model_used": "real" if model else "simulation",
            "latitude": input_data.latitude,
            "longitude": input_data.longitude
        }
        
        logger.info(f"📤 Réponse envoyée: {response_data}")
        return response_data
        
    except Exception as e:
        logger.error(f"❌ Erreur prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {str(e)}")