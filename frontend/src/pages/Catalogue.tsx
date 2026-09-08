import { useEffect, useState } from 'react'
import { listerProduits } from '../services/produitService'
import { listerCategories } from '../services/categorieService'
import type { Produit, Categorie } from '../types/produit'
import CarteProduit from '../components/CarteProduit'
import SkeletonCarteProduit from '../components/SkeletonCarteProduit'

function Catalogue() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [categorieChoisie, setCategorieChoisie] = useState<number | null>(null)
  const [pageActuelle, setPageActuelle] = useState(1)
  const PAR_PAGE = 12

  useEffect(() => {
    Promise.all([listerProduits(), listerCategories()])
      .then(([donneesProduits, donneesCategories]) => {
        setProduits(donneesProduits)
        setCategories(donneesCategories)
      })
      .finally(() => setChargement(false))
  }, [])

  useEffect(() => {
    setPageActuelle(1)
  }, [recherche, categorieChoisie])

  if (chargement) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-3xl mb-8">Notre collection</h1>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCarteProduit key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Filtrage côté client : sur le nom (recherche texte) ET la catégorie (si choisie)
  const produitsFiltres = produits.filter((produit) => {
    const correspondNom = produit.nom.toLowerCase().includes(recherche.toLowerCase())
    const correspondCategorie = categorieChoisie === null || produit.categorie_id === categorieChoisie
    return correspondNom && correspondCategorie
  })

  const nbPages = Math.ceil(produitsFiltres.length / PAR_PAGE)
  const produitsAffiches = produitsFiltres.slice(
    (pageActuelle - 1) * PAR_PAGE,
    pageActuelle * PAR_PAGE
  )

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl mb-6">Notre collection</h1>

      {/* Barre de recherche */}
      <input
        type="text"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un article..."
        className="w-full border border-neutral-300 px-4 py-2 mb-4"
      />

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategorieChoisie(null)}
          className={`px-3 py-1.5 text-sm border ${
            categorieChoisie === null
              ? 'border-bordeaux text-bordeaux'
              : 'border-neutral-300 text-neutral-600'
          }`}
        >
          Tout
        </button>
        {categories.map((categorie) => (
          <button
            key={categorie.id}
            onClick={() => setCategorieChoisie(categorie.id)}
            className={`px-3 py-1.5 text-sm border ${
              categorieChoisie === categorie.id
                ? 'border-bordeaux text-bordeaux'
                : 'border-neutral-300 text-neutral-600'
            }`}
          >
            {categorie.nom}
          </button>
        ))}
      </div>

      {produitsFiltres.length === 0 ? (
        <p className="text-neutral-500">Aucun article ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {produitsAffiches.map((produit) => (
            <CarteProduit key={produit.id} produit={produit} />
          ))}
        </div>
      )}

      {nbPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-12">
    <button
      onClick={() => setPageActuelle((p) => Math.max(1, p - 1))}
      disabled={pageActuelle === 1}
      className="px-3 py-1.5 text-sm border border-neutral-300 disabled:opacity-30"
    >
      Précédent
    </button>
    {Array.from({ length: nbPages }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        onClick={() => setPageActuelle(n)}
        className={`w-8 h-8 text-sm border ${
          n === pageActuelle
            ? 'border-bordeaux text-bordeaux'
            : 'border-neutral-300 text-neutral-600'
        }`}
      >
        {n}
      </button>
    ))}
    <button
      onClick={() => setPageActuelle((p) => Math.min(nbPages, p + 1))}
      disabled={pageActuelle === nbPages}
      className="px-3 py-1.5 text-sm border border-neutral-300 disabled:opacity-30"
    >
      Suivant
    </button>
  </div>
)}
    </div>
  )
}

export default Catalogue