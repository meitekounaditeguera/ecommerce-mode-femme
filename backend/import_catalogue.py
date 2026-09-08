"""
Script d'import du catalogue complet.
A placer et executer depuis la racine du projet backend (a cote de app/, venv/, app.db).

Prerequis avant de lancer :
1. copier ce fichier + manifest_images.py + catalogue_produits.xlsx a la racine de backend/
2. copier le dossier "Images-projet" (avec ses 4 sous-dossiers) a la racine de backend/
3. pip install openpyxl pandas --break-system-packages (ou sans ce flag si deja dans le venv)
4. avoir ajoute le mount StaticFiles dans main.py (voir instructions fournies a part)

Lancement :  python import_catalogue.py
"""
import shutil
from pathlib import Path
from decimal import Decimal

import openpyxl

from app.core.database import SessionLocal
from app.models import Categorie, Couleur, Taille, Produit, ProduitVariante, ImageProduit

from manifest_images import MANIFEST

XLSX_PATH = "catalogue_produits.xlsx"
IMAGES_SRC_ROOT = Path("Images-projet")
UPLOADS_DIR = Path("app/static/uploads")
TAILLES_STANDARD = ["S", "M", "L", "XL", "XXL", "XXXL", "4XL"]


def normaliser_couleur(nom: str) -> str:
    """'Blanc (haut)' -> 'Blanc' ; 'Noir ' -> 'Noir'"""
    return nom.split("(")[0].strip()


def get_or_create_categorie(db, nom: str) -> Categorie:
    slug = nom.lower().replace(" ", "-").replace("é", "e")
    cat = db.query(Categorie).filter(Categorie.nom == nom).first()
    if cat is None:
        cat = Categorie(nom=nom, slug=slug)
        db.add(cat)
        db.flush()
    return cat


def get_or_create_couleur(db, nom: str, cache: dict) -> Couleur:
    nom = normaliser_couleur(nom)
    if nom in cache:
        return cache[nom]
    coul = db.query(Couleur).filter(Couleur.nom == nom).first()
    if coul is None:
        coul = Couleur(nom=nom)
        db.add(coul)
        db.flush()
    cache[nom] = coul
    return coul


def get_or_create_tailles(db) -> dict:
    cache = {}
    for nom in TAILLES_STANDARD:
        t = db.query(Taille).filter(Taille.nom == nom).first()
        if t is None:
            t = Taille(nom=nom)
            db.add(t)
            db.flush()
        cache[nom] = t
    return cache


def copier_image(fichier_relatif: str) -> str | None:
    src = IMAGES_SRC_ROOT / fichier_relatif
    if not src.exists():
        print(f"   ATTENTION fichier introuvable : {src}")
        return None
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    nom_fichier = src.name.replace(" ", "_")
    dest = UPLOADS_DIR / nom_fichier
    if not dest.exists():
        shutil.copy2(src, dest)
    return f"/static/uploads/{nom_fichier}"


def main():
    db = SessionLocal()
    couleurs_cache = {}
    tailles_cache = get_or_create_tailles(db)

    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    ws = wb["Catalogue"]

    nb_produits = 0
    nb_variantes = 0
    nb_images = 0
    nb_exclus = 0
    nb_erreurs = []

    for row in ws.iter_rows(min_row=2, values_only=True):
        numero, categorie_nom, nom, couleurs_str, description, prix, stock, dossier, statut = row

        if statut and str(statut).startswith("EXCLU"):
            nb_exclus += 1
            continue

        if prix is None:
            nb_erreurs.append(f"Produit #{numero} '{nom}' : prix manquant, ignore")
            continue

        categorie = get_or_create_categorie(db, categorie_nom)

        produit = Produit(
            nom=nom,
            description=description,
            prix=Decimal(str(prix)),
            categorie_id=categorie.id,
            actif=True,
        )
        db.add(produit)
        db.flush()
        nb_produits += 1

        couleurs_liste = [c.strip() for c in couleurs_str.split(";")]
        images_par_couleur = MANIFEST.get(numero, {})

        for couleur_nom in couleurs_liste:
            couleur = get_or_create_couleur(db, couleur_nom, couleurs_cache)

            for taille_nom, taille_obj in tailles_cache.items():
                variante = ProduitVariante(
                    produit_id=produit.id,
                    couleur_id=couleur.id,
                    taille_id=taille_obj.id,
                    stock=int(stock) if stock else 1,
                )
                db.add(variante)
                nb_variantes += 1

            fichiers = images_par_couleur.get(couleur_nom) or images_par_couleur.get(normaliser_couleur(couleur_nom))
            if not fichiers:
                nb_erreurs.append(f"Produit #{numero} '{nom}' couleur '{couleur_nom}' : pas d'image dans le manifest")
                continue

            for ordre, fichier in enumerate(fichiers):
                url = copier_image(fichier)
                if url is None:
                    continue
                image = ImageProduit(
                    produit_id=produit.id,
                    couleur_id=couleur.id,
                    url=url,
                    ordre=ordre,
                    est_principale=(ordre == 0),
                )
                db.add(image)
                nb_images += 1

        db.commit()
        print(f"OK  #{numero} {nom} ({len(couleurs_liste)} couleur(s))")

    print("\n--- Résumé ---")
    print(f"Produits créés   : {nb_produits}")
    print(f"Variantes créées : {nb_variantes}")
    print(f"Images copiées   : {nb_images}")
    print(f"Lignes exclues   : {nb_exclus}")
    if nb_erreurs:
        print(f"\n{len(nb_erreurs)} avertissement(s) :")
        for e in nb_erreurs:
            print(" -", e)

    db.close()


if __name__ == "__main__":
    main()
