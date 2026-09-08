"""
Corrige le bug de collision de noms de fichiers (ex: OIP.webp present dans
plusieurs dossiers, ecrasant silencieusement la bonne image).

Ce script :
1. Supprime TOUTES les images actuellement en base (ImageProduit) et sur le disque
2. Les recopie depuis Images-projet/ avec un nom de fichier rendu UNIQUE
   (prefixe = nom du dossier source), pour qu'aucune collision ne soit plus possible
3. Ne touche a AUCUN produit, prix, variante ou stock -- uniquement les images

A lancer une seule fois, a la racine de backend :
    python reparer_images.py
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
    # CORRECTIF : on prefixe avec le dossier source pour garantir un nom UNIQUE,
    # meme si deux photos de dossiers differents s'appellent pareil (ex: OIP.webp)
    prefixe = src.parent.name
    nom_fichier = f"{prefixe}_{src.name}".replace(" ", "_")
    dest = UPLOADS_DIR / nom_fichier
    shutil.copy2(src, dest)  # on ecrase si besoin, on repart propre
    return f"/static/uploads/{nom_fichier}"


def main():
    db = SessionLocal()

    # Etape 1 : on vide tout (images en base + fichiers sur disque)
    nb_supprimees = db.query(ImageProduit).delete()
    db.commit()
    print(f"{nb_supprimees} ancienne(s) image(s) supprimee(s) de la base")

    if UPLOADS_DIR.exists():
        for f in UPLOADS_DIR.iterdir():
            f.unlink()
        print("Ancien contenu du dossier uploads/ supprime")

    # Etape 2 : on recopie tout, proprement
    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    ws = wb["Catalogue"]

    nb_images = 0
    nb_erreurs = []

    for row in ws.iter_rows(min_row=2, values_only=True):
        numero, categorie_nom, nom, couleurs_str, description, prix, stock, dossier, statut = row

        if statut and str(statut).startswith("EXCLU"):
            continue
        if prix is None:
            continue

        produit = db.query(Produit).filter(Produit.nom == nom).first()
        if produit is None:
            continue

        couleurs_liste = [c.strip() for c in couleurs_str.split(";")]
        images_par_couleur = MANIFEST.get(numero, {})

        images_ce_produit = 0
        for couleur_nom in couleurs_liste:
            couleur_norm = normaliser_couleur(couleur_nom)
            couleur = db.query(Couleur).filter(Couleur.nom == couleur_norm).first()
            if couleur is None:
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
                    est_principale=(ordre == 0 and images_ce_produit == 0),
                )
                db.add(image)
                nb_images += 1
                images_ce_produit += 1

        db.commit()
        print(f"OK  #{numero} {nom} : {images_ce_produit} image(s)")

    print("\n--- Résumé ---")
    print(f"Images copiées et liées : {nb_images}")
    if nb_erreurs:
        print(f"\n{len(nb_erreurs)} avertissement(s) :")
        for e in nb_erreurs:
            print(" -", e)

    db.close()


if __name__ == "__main__":
    main()
