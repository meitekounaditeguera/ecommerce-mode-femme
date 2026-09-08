// Ce fichier ne contient que des "interfaces" TypeScript : ce sont des
// définitions de forme de données (quels champs, quel type), il n'y a pas de
// code exécuté ici. Elles servent à décrire ce que renvoie l'API backend
// (FastAPI) pour que TypeScript puisse vérifier qu'on utilise bien ces
// données correctement (autocomplétion, erreurs à la compilation, etc.).

export interface Categorie {
  id: number
  nom: string
  slug: string
}

export interface Couleur {
  id: number
  nom: string
}

export interface Taille {
  id: number
  nom: string
}

// Une "variante" représente une combinaison couleur/taille précise d'un
// produit, avec son propre stock (ex: T-shirt rouge, taille M, 5 en stock).
export interface ProduitVariante {
  id: number
  couleur: Couleur
  taille: Taille
  stock: number
}

export interface ImageProduit {
  id: number
  url: string
  couleur: Couleur | null
  ordre: number
  est_principale: boolean
}

export interface Produit {
  id: number
  nom: string
  description: string | null
  prix: string          // ex: "15000.00" — Decimal renvoyé en string par FastAPI
  categorie_id: number
  actif: boolean
  categorie: Categorie
  variantes: ProduitVariante[]
  images: ImageProduit[]
}