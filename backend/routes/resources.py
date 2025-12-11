import os
import inspect
import zipfile
import io
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse, StreamingResponse, FileResponse

router = APIRouter()

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))

@router.get("/")
def list_files():
    """
    Liste tous les fichiers Python du backend (routes, services, utils).
    """
    files_list = []
    for root, _, files in os.walk(BACKEND_DIR):
        for f in files:
            if f.endswith(".py"):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, BACKEND_DIR)
                files_list.append(rel_path)
    return {"files": sorted(files_list)}

@router.get("/view", response_class=PlainTextResponse)
def view_file(path: str = Query(..., description="Chemin relatif du fichier à afficher, ex: routes/prediction.py")):
    """
    Affiche le contenu d'un fichier backend.
    """
    file_path = os.path.join(BACKEND_DIR, path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable.")
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

@router.get("/download")
def download_file(path: str = Query(..., description="Chemin relatif du fichier à télécharger, ex: routes/prediction.py")):
    """
    Télécharge un fichier spécifique du backend.
    """
    file_path = os.path.join(BACKEND_DIR, path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable.")
    return FileResponse(file_path, filename=os.path.basename(path), media_type="text/plain")

@router.get("/download-all")
def download_all():
    """
    Télécharge le backend complet sous forme de fichier ZIP.
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(BACKEND_DIR):
            for f in files:
                if f.endswith(".py"):
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, BACKEND_DIR)
                    z.write(full_path, rel_path)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=TTK-StatTestIA-backend.zip"},
    )

@router.get("/info")
def backend_info():
    """
    Renvoie des informations sur la version du backend et ses modules.
    """
    return {
        "app_name": "TTK StatTestIA",
        "description": "Backend API pour l'analyse et la prédiction du diabète (FastAPI).",
        "modules": ["data", "prediction", "stats_tests", "visualization", "resources"],
    }
