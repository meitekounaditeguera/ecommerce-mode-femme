import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'
import { useAuth } from '../context/AuthContext'
import { creerCommande, payerCommande } from '../services/commandeService'
import { urlImage } from '../services/api'

function Commande() {
  const { articles, total, viderPanier } = usePanier()
  const { utilisateur, chargement: chargementAuth } = useAuth()
  const navigate = useNavigate()
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  if (chargementAuth) return <p className="p-8 text-center text-neutral-500">Chargement...</p>

  if (!utilisateur) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-display text-2xl mb-3">Connectez-vous pour continuer</p>
          <p className="text-neutral-500 text-sm mb-6">
            Vous devez avoir un compte pour valider votre commande.
          </p>
          <button
            onClick={() => navigate('/connexion', { state: { retourApres: '/commande' } })}
            className="bg-bordeaux text-white px-6 py-3 hover:bg-[#5e1e29] transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-neutral-500">Votre panier est vide.</p>
      </div>
    )
  }

  async function validerEtPayer() {
    setEnCours(true)
    setErreur(null)
    try {
      const commande = await creerCommande(articles)
      const paiement = await payerCommande(commande.id)

      if (paiement.statut === 'reussi') {
        viderPanier()
        navigate('/mon-compte')
      } else {
        setErreur('Le paiement a échoué. Veuillez réessayer.')
      }
    } catch (err: any) {
      setErreur(err.response?.data?.detail ?? 'Une erreur est survenue')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl mb-10">Récapitulatif de commande</h1>

      <div className="space-y-4 mb-8">
        {articles.map((article) => (
          <div key={article.produitVarianteId} className="flex items-center gap-4">
            <div className="w-14 h-18 bg-neutral-100 shrink-0 overflow-hidden">
              {article.imageUrl && (
                <img
                  src={urlImage(article.imageUrl)}
                  alt={article.nom}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium">{article.nom}</p>
              <p className="text-neutral-500">
                {article.couleur}, {article.taille} × {article.quantite}
              </p>
            </div>
            <span className="text-sm">
              {(article.prixUnitaire * article.quantite).toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline border-t border-neutral-200 pt-6 mb-8">
        <span className="font-display text-xl">Total</span>
        <span className="font-display text-xl text-bordeaux">
          {total.toLocaleString('fr-FR')} FCFA
        </span>
      </div>

      {erreur && (
        <p className="text-bordeaux text-sm bg-red-50 px-3 py-2 rounded mb-4">{erreur}</p>
      )}

      <button
        onClick={validerEtPayer}
        disabled={enCours}
        className="w-full bg-bordeaux text-white py-3.5 hover:bg-[#5e1e29] transition-colors disabled:opacity-50"
      >
        {enCours ? 'Traitement en cours...' : 'Payer maintenant'}
      </button>
    </div>
  )
}

export default Commande