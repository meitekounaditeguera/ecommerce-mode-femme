// ============================================================================
// PanierContext : gère l'état du panier d'achat pour toute l'application,
// avec le même principe de "Context API" que AuthContext.tsx (voir ce fichier
// pour une explication plus détaillée du concept).
//
// Contrairement à AuthContext, il n'y a pas d'appel API ici : le panier vit
// uniquement en mémoire côté frontend (donc perdu si on recharge la page —
// on pourrait plus tard le sauvegarder dans localStorage comme le token).
// ============================================================================

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ArticlePanier } from '../types/panier'

interface PanierContextType {
  articles: ArticlePanier[]
  ajouterArticle: (article: ArticlePanier) => void
  retirerArticle: (produitVarianteId: number) => void
  modifierQuantite: (produitVarianteId: number, quantite: number) => void
  viderPanier: () => void
  total: number
}

const PanierContext = createContext<PanierContextType | undefined>(undefined)

export function PanierProvider({ children }: { children: ReactNode }) {
  // La liste des articles est stockée dans un state React : chaque fois
  // qu'on la modifie (via setArticles), React redessine automatiquement tous
  // les composants qui affichent le panier.
  const [articles, setArticles] = useState<ArticlePanier[]>([])

  // Ajoute un article au panier. Si une variante identique (même couleur +
  // même taille) est déjà présente, on additionne simplement les quantités
  // au lieu de créer une ligne en double.
  //
  // Important : en React, on ne modifie JAMAIS le state directement
  // (ex: articles.push(...) serait interdit). On crée systématiquement un
  // NOUVEAU tableau/objet, ici via .map()/.filter()/le spread [...]. C'est ce
  // qui permet à React de détecter le changement et de rafraîchir l'affichage.
  //
  // La forme `setArticles((precedents) => ...)` (avec une fonction plutôt
  // qu'une valeur directe) garantit qu'on part bien de la dernière version du
  // panier, même si plusieurs mises à jour arrivent rapidement.
  function ajouterArticle(nouvelArticle: ArticlePanier) {
    setArticles((precedents) => {
      const existant = precedents.find(
        (a) => a.produitVarianteId === nouvelArticle.produitVarianteId
      )
      if (existant) {
        return precedents.map((a) =>
          a.produitVarianteId === nouvelArticle.produitVarianteId
            ? { ...a, quantite: a.quantite + nouvelArticle.quantite } // { ...a } copie l'objet, puis on écrase juste "quantite"
            : a
        )
      }
      return [...precedents, nouvelArticle]
    })
  }

  // Retire complètement une ligne du panier (ex: bouton "supprimer").
  function retirerArticle(produitVarianteId: number) {
    setArticles((precedents) =>
      precedents.filter((a) => a.produitVarianteId !== produitVarianteId)
    )
  }

  // Change la quantité d'une ligne existante (ex: champ numérique +/- dans le panier).
  function modifierQuantite(produitVarianteId: number, quantite: number) {
    setArticles((precedents) =>
      precedents.map((a) =>
        a.produitVarianteId === produitVarianteId ? { ...a, quantite } : a
      )
    )
  }

  // Vide le panier (ex: après validation d'une commande).
  function viderPanier() {
    setArticles([])
  }

  // Calcule le total à payer. .reduce() parcourt tous les articles pour les
  // "réduire" à une seule valeur (ici une somme), en partant de 0.
  const total = articles.reduce((somme, a) => somme + a.prixUnitaire * a.quantite, 0)

  return (
    <PanierContext.Provider
      value={{ articles, ajouterArticle, retirerArticle, modifierQuantite, viderPanier, total }}
    >
      {children}
    </PanierContext.Provider>
  )
}

// Hook personnalisé pour consommer le contexte facilement, par exemple :
//   const { articles, ajouterArticle, total } = usePanier()
export function usePanier() {
  const contexte = useContext(PanierContext)
  if (!contexte) throw new Error("usePanier doit être utilisé à l'intérieur de PanierProvider")
  return contexte
}