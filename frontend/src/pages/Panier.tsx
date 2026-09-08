import { Link, useNavigate } from 'react-router-dom'
import { usePanier } from '../context/PanierContext'
import { urlImage } from '../services/api'

function Panier() {
  const { articles, retirerArticle, modifierQuantite, total } = usePanier()
  const navigate = useNavigate()

  if (articles.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl mb-3">Votre panier est vide</p>
          <p className="text-neutral-500 text-sm mb-6">
            Découvrez notre collection et trouvez votre prochaine tenue.
          </p>
          <Link
            to="/"
            className="inline-block bg-bordeaux text-white px-6 py-3 hover:bg-[#5e1e29] transition-colors"
          >
            Découvrir la collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-3xl mb-1">Votre panier</h1>
      <p className="text-neutral-500 text-sm mb-10">
        {articles.length} article{articles.length > 1 ? 's' : ''}
      </p>

      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.produitVarianteId}
            className="flex gap-5 border-b border-neutral-200 pb-6"
          >
            <div className="w-24 h-32 bg-neutral-100 shrink-0 overflow-hidden">
              {article.imageUrl && (
                <img
                  src={urlImage(article.imageUrl)}
                  alt={article.nom}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg leading-snug">{article.nom}</h3>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {article.couleur} · {article.taille}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    modifierQuantite(article.produitVarianteId, Math.max(1, article.quantite - 1))
                  }
                  className="w-7 h-7 border border-neutral-300 text-sm hover:border-bordeaux transition-colors"
                >
                  −
                </button>
                <span className="text-sm w-4 text-center">{article.quantite}</span>
                <button
                  onClick={() =>
                    modifierQuantite(
                      article.produitVarianteId,
                      Math.min(article.stockDisponible, article.quantite + 1)
                    )
                  }
                  disabled={article.quantite >= article.stockDisponible}
                  className="w-7 h-7 border border-neutral-300 text-sm hover:border-bordeaux transition-colors disabled:opacity-30 disabled:hover:border-neutral-300"
                >
                  +
                </button>

                <button
                  onClick={() => retirerArticle(article.produitVarianteId)}
                  className="ml-4 text-xs text-neutral-400 underline hover:text-bordeaux transition-colors"
                >
                  Retirer
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium">
                {(article.prixUnitaire * article.quantite).toLocaleString('fr-FR')} FCFA
              </p>
              {article.quantite > 1 && (
                <p className="text-xs text-neutral-400 mt-0.5">
                  {article.prixUnitaire.toLocaleString('fr-FR')} / unité
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-neutral-200 pt-6">
        <span className="font-display text-xl">Total</span>
        <span className="font-display text-xl text-bordeaux">
          {total.toLocaleString('fr-FR')} FCFA
        </span>
      </div>

      <button
        onClick={() => navigate('/commande')}
        className="mt-6 w-full bg-bordeaux text-white py-3.5 hover:bg-[#5e1e29] transition-colors"
      >
        Valider la commande
      </button>
    </div>
  )
}

export default Panier