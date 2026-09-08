"""
Script de reprise : ajoute UNIQUEMENT les images aux produits deja crees en base
(utile apres un premier import ou les images n'avaient pas ete trouvees).

A placer a cote de import_catalogue.py (meme dossier), et lancer :
    python import_images_uniquement.py
"""
import shutil
from pathlib import Path

import openpyxl

from app.core.database import SessionLocal
from app.models import Couleur, Produit, ImageProduit

from manifest_images import MANIFEST

XLSX_PATH = "catalogue_produits.xlsx"
IMAGES_SRC_ROOT = Path("Images-projet")
UPLOADS_DIR = Path("app/static/uploads")


def normaliser_couleur(nom: str) -> str:
    return nom.split("(")[0].strip()


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

    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    ws = wb["Catalogue"]

    nb_images = 0
    nb_erreurs = []
    nb_produits_introuvables = []

    for row in ws.iter_rows(min_row=2, values_only=True):
        numero, categorie_nom, nom, couleurs_str, description, prix, stock, dossier, statut = row

        if statut and str(statut).startswith("EXCLU"):
            continue
        if prix is None:
            continue

        produit = db.query(Produit).filter(Produit.nom == nom).first()
        if produit is None:
            nb_produits_introuvables.append(f"#{numero} {nom}")
            continue

        # Ne rien faire si ce produit a deja des images (evite les doublons si relance)
        deja_present = db.query(ImageProduit).filter(ImageProduit.produit_id == produit.id).count()
        if deja_present > 0:
            print(f"IGNORE #{numero} {nom} : {deja_present} image(s) deja presente(s)")
            continue

        couleurs_liste = [c.strip() for c in couleurs_str.split(";")]
        images_par_couleur = MANIFEST.get(numero, {})

        images_ajoutees_ce_produit = 0
        for couleur_nom in couleurs_liste:
            couleur_norm = normaliser_couleur(couleur_nom)
            couleur = db.query(Couleur).filter(Couleur.nom == couleur_norm).first()
            if couleur is None:
                nb_erreurs.append(f"#{numero} {nom} : couleur '{couleur_norm}' introuvable en base")
                continue

            fichiers = images_par_couleur.get(couleur_nom) or images_par_couleur.get(couleur_norm)
            if not fichiers:
                nb_erreurs.append(f"#{numero} {nom} couleur '{couleur_nom}' : pas d'image dans le manifest")
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
                    est_principale=(ordre == 0 and images_ajoutees_ce_produit == 0),
                )
                db.add(image)
                nb_images += 1
                images_ajoutees_ce_produit += 1

        db.commit()
        print(f"OK  #{numero} {nom} : {images_ajoutees_ce_produit} image(s) ajoutee(s)")

    print("\n--- Résumé ---")
    print(f"Images copiées et liées : {nb_images}")
    if nb_produits_introuvables:
        print(f"\nProduits introuvables en base ({len(nb_produits_introuvables)}) :")
        for p in nb_produits_introuvables:
            print(" -", p)
    if nb_erreurs:
        print(f"\n{len(nb_erreurs)} avertissement(s) :")
        for e in nb_erreurs:
            print(" -", e)

    db.close()


if __name__ == "__main__":
    main()