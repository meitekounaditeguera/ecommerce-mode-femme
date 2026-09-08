import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listerProduits } from '../services/produitService'
import { modifierProduit, supprimerProduit } from '../services/adminService'
import type { Produit } from '../types/produit'
import { urlImage } from '../services/api'

function AdminProduits() {
  const { utilisateur, chargement: chargementAuth } = useAuth()
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const [idEnEdition, setIdEnEdition] = useState<number | null>(null)
  const [nomEdite, setNomEdite] = useState('')
  const [prixEdite, setPrixEdite] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    listerProduits()
      .then(setProduits)
      .finally(() => setChargement(false))
  }, [])

  if (chargementAuth || chargement) return <p className="p-8 text-center">Chargement...</p>

  // Protection de la route : redirige si l'utilisateur n'est pas admin
  if (!utilisateur || utilisateur.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  function commencerEdition(produit: Produit) {
    setIdEnEdition(produit.id)
    setNomEdite(produit.nom)
    setPrixEdite(produit.prix)
    setErreur(null)
  }

  async function enregistrerEdition(id: number) {
    try {
      const produitMaj = await modifierProduit(id, {
        nom: nomEdite,
        prix: parseFloat(prixEdite),
      })
      setProduits((precedents) => precedents.map((p) => (p.id === id ? produitMaj : p)))
      setIdEnEdition(null)
    } catch {
      setErreur('Erreur lors de la modification')
    }
  }

  async function gererSuppression(id: number) {
    if (!confirm('Désactiver ce produit du catalogue ?')) return
    try {
      await supprimerProduit(id)
      setProduits((precedents) => precedents.filter((p) => p.id !== id))
    } catch {
      setErreur('Erreur lors de la suppression')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl mb-8">Gestion des produits ({produits.length})</h1>

      {erreur && <p className="text-bordeaux text-sm mb-4">{erreur}</p>}

      <div className="space-y-3">
        {produits.map((produit) => {
          const image = produit.images[0]
          const enEdition = idEnEdition === produit.id

          return (
            <div key={produit.id} className="flex items-center gap-4 border border-neutral-200 p-3">
              <div className="w-14 h-18 bg-neutral-100 shrink-0">
                {image && (
                  <img src={urlImage(image.url)} className="h-full w-full object-cover" />
                )}
              </div>

              {enEdition ? (
                <>
                  <input
                    value={nomEdite}
                    onChange={(e) => setNomEdite(e.target.value)}
                    className="flex-1 border border-neutral-300 px-2 py-1 text-sm"
                  />
                  <input
                    value={prixEdite}
                    onChange={(e) => setPrixEdite(e.target.value)}
                    className="w-28 border border-neutral-300 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => enregistrerEdition(produit.id)}
                    className="text-sm bg-bordeaux text-white px-3 py-1.5"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setIdEnEdition(null)}
                    className="text-sm text-neutral-500"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm">{produit.nom}</p>
                    <p className="text-xs text-neutral-400">{produit.categorie.nom}</p>
                    <p className="text-sm text-neutral-500">
                      {parseFloat(produit.prix).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <button
                    onClick={() => commencerEdition(produit)}
                    className="text-sm text-bordeaux underline"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => gererSuppression(produit.id)}
                    className="text-sm text-neutral-400 underline"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminProduits