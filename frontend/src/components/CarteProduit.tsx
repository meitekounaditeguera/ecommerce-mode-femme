import { Link } from 'react-router-dom'
import type { Produit } from '../types/produit'
import { urlImage } from '../services/api'

function CarteProduit({ produit }: { produit: Produit }) {
  const imagePrincipale = produit.images.find((img) => img.est_principale) ?? produit.images[0]

  return (
    <Link to={`/produits/${produit.id}`} className="group block">
      <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
        {imagePrincipale ? (
          <img
            src={urlImage(imagePrincipale.url)}
            alt={produit.nom}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Pas d'image
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-display text-base leading-snug">{produit.nom}</h3>
        <p className="text-bordeaux font-medium">
          {parseFloat(produit.prix).toLocaleString('fr-FR')} FCFA
        </p>
      </div>
    </Link>
  )
}

export default CarteProduit