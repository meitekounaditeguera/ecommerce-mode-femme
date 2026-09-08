import { useEffect, useState } from 'react'
import { listerMesCommandes } from '../services/commandeService'
import { urlImage } from '../services/api'
import type { Commande } from '../types/commande'
import SkeletonCommande from '../components/SkeletonCommande'

const LIBELLES_STATUT: Record<string, string> = {
  en_attente: 'En attente de paiement',
  payee: 'Payée',
  expediee: 'Expédiée',
  annulee: 'Annulée',
}

const STYLES_STATUT: Record<string, string> = {
  en_attente: 'bg-amber-50 text-amber-700',
  payee: 'bg-green-50 text-green-700',
  expediee: 'bg-blue-50 text-blue-700',
  annulee: 'bg-neutral-100 text-neutral-500',
}

function MonCompte() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [chargement, setChargement] = useState(true)
  const [pageActuelle, setPageActuelle] = useState(1)
  const PAR_PAGE = 5

  useEffect(() => {
    listerMesCommandes()
      .then(setCommandes)
      .finally(() => setChargement(false))
  }, [])

  if (chargement) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-display text-3xl mb-10">Mes commandes</h1>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCommande key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (commandes.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <p className="font-display text-2xl text-center">Aucune commande pour l'instant</p>
      </div>
    )
  }

  const nbPages = Math.ceil(commandes.length / PAR_PAGE)
  const commandesAffichees = commandes.slice(
    (pageActuelle - 1) * PAR_PAGE,
    pageActuelle * PAR_PAGE
  )

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl mb-10">Mes commandes</h1>

      <div className="space-y-6">
        {commandesAffichees.map((commande) => (
          <div key={commande.id} className="border border-neutral-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <span className="font-display text-lg">Commande #{commande.id}</span>
              <span
                className={`text-xs px-2.5 py-1 rounded ${
                  STYLES_STATUT[commande.statut] ?? 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {LIBELLES_STATUT[commande.statut] ?? commande.statut}
              </span>
            </div>

            <div className="space-y-3 mb-5">
              {commande.lignes.map((ligne) => (
                <div key={ligne.id} className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-neutral-100 shrink-0 overflow-hidden">
                    {ligne.produit_variante.image_url && (
                      <img
                        src={urlImage(ligne.produit_variante.image_url)}
                        alt={ligne.produit_variante.produit.nom}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{ligne.produit_variante.produit.nom}</p>
                    <p className="text-neutral-500">
                      {ligne.produit_variante.couleur.nom}, {ligne.produit_variante.taille.nom} × {ligne.quantite}
                    </p>
                  </div>
                  <span className="text-sm">
                    {(parseFloat(ligne.prix_unitaire) * ligne.quantite).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-medium border-t border-neutral-200 pt-4">
              <span className="text-sm">Total</span>
              <span className="text-bordeaux">
                {parseFloat(commande.total).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        ))}
      </div>

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

export default MonCompte