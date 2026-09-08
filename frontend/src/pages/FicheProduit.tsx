import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { obtenirProduit } from '../services/produitService'
import { urlImage } from '../services/api'
import { usePanier } from '../context/PanierContext'
import { listerAvisProduit } from '../services/avisService'
import { useAuth } from '../context/AuthContext'
import { listerMesCommandes } from '../services/commandeService'
import { creerAvis } from '../services/avisService'
import type { Avis } from '../types/avis'
import type { Produit, Couleur, Taille } from '../types/produit'

function FicheProduit() {
  const { id } = useParams<{ id: string }>()
  const [produit, setProduit] = useState<Produit | null>(null)
  const [chargement, setChargement] = useState(true)
  const [couleurChoisie, setCouleurChoisie] = useState<Couleur | null>(null)
  const [tailleChoisie, setTailleChoisie] = useState<Taille | null>(null)
  const [quantite, setQuantite] = useState(1)
  const [messageAjout, setMessageAjout] = useState<string | null>(null)
  const { ajouterArticle } = usePanier()
  const [avis, setAvis] = useState<Avis[]>([])
  const { utilisateur } = useAuth()
  const [commandeEligible, setCommandeEligible] = useState<number | null>(null)
  const [noteChoisie, setNoteChoisie] = useState(0)
  const [commentaireSaisi, setCommentaireSaisi] = useState('')
  const [envoiAvisEnCours, setEnvoiAvisEnCours] = useState(false)
  const [erreurAvis, setErreurAvis] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    obtenirProduit(Number(id)).then((donnees) => {
      setProduit(donnees)
      const premiereCouleur = donnees.variantes[0]?.couleur ?? null
      setCouleurChoisie(premiereCouleur)
      setChargement(false)
    })
  }, [id])

  useEffect(() => {
    if (!id) return
    listerAvisProduit(Number(id)).then(setAvis)
  }, [id])


  useEffect(() => {
  if (!utilisateur || !id) return
  listerMesCommandes().then((commandes) => {
    const commandePayee = commandes.find(
      (c) =>
        c.statut === 'payee' &&
        c.lignes.some((l) => l.produit_variante.produit.id === Number(id))
    )
    setCommandeEligible(commandePayee?.id ?? null)
  })
}, [utilisateur, id])

  if (chargement) return <p className="p-8 text-center">Chargement...</p>
  if (!produit) return <p className="p-8 text-center">Produit introuvable</p>

  // Liste des couleurs distinctes disponibles pour ce produit
  const couleursDisponibles = Array.from(
    new Map(produit.variantes.map((v) => [v.couleur.id, v.couleur])).values()
  )

  // Tailles disponibles pour la couleur actuellement choisie, avec leur stock
  const taillesPourCouleur = produit.variantes.filter(
    (v) => v.couleur.id === couleurChoisie?.id
  )

  // Images à afficher : celles liées à la couleur choisie
  const imagesAffichees = produit.images.filter(
    (img) => img.couleur?.id === couleurChoisie?.id
  )

  const varianteSelectionnee = produit.variantes.find(
    (v) => v.couleur.id === couleurChoisie?.id && v.taille.id === tailleChoisie?.id
  )
  const stockDisponible = varianteSelectionnee?.stock ?? 0

  function gererChangementCouleur(couleur: Couleur) {
    setCouleurChoisie(couleur)
    setTailleChoisie(null) // on force à re-choisir une taille, le stock diffère par couleur
    setMessageAjout(null)
  }

  function gererAjoutPanier() {
    if (!produit || !varianteSelectionnee || !couleurChoisie || !tailleChoisie) return
    ajouterArticle({
      produitVarianteId: varianteSelectionnee.id,
      nom: produit.nom,
      couleur: couleurChoisie.nom,
      taille: tailleChoisie.nom,
      prixUnitaire: parseFloat(produit.prix),
      quantite,
      stockDisponible: varianteSelectionnee.stock,
      imageUrl: imagesAffichees[0]?.url ?? null,
    })
    setMessageAjout('Ajouté au panier')
    setQuantite(1)
  }

  async function gererEnvoiAvis() {
    if (!commandeEligible || noteChoisie === 0) return
    setEnvoiAvisEnCours(true)
    setErreurAvis(null)
    try {
      const nouvelAvis = await creerAvis(Number(id), commandeEligible, noteChoisie, commentaireSaisi)
      setAvis((precedents) => [...precedents, nouvelAvis])
      setNoteChoisie(0)
      setCommentaireSaisi('')
      setCommandeEligible(null) // un seul avis par commande/produit : on masque le formulaire après envoi
    } catch (err: any) {
      setErreurAvis(err.response?.data?.detail ?? "Erreur lors de l'envoi de l'avis")
    } finally {
      setEnvoiAvisEnCours(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 grid gap-10 md:grid-cols-2">
      {/* Galerie */}
      <div>
        <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
          {imagesAffichees[0] ? (
            <img
              src={urlImage(imagesAffichees[0].url)}
              alt={produit.nom}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              Pas d'image
            </div>
          )}
        </div>
        {imagesAffichees.length > 1 && (
          <div className="mt-3 flex gap-2">
            {imagesAffichees.map((img) => (
              <img
                key={img.id}
                src={urlImage(img.url)}
                className="h-16 w-16 object-cover cursor-pointer"
              />
            ))}
          </div>
        )}
      </div>

      {/* Détails */}
      <div>
        <h1 className="font-display text-2xl mb-2">{produit.nom}</h1>
        <p className="text-bordeaux text-xl font-medium mb-4">
          {parseFloat(produit.prix).toLocaleString('fr-FR')} FCFA
        </p>
        {produit.description && <p className="text-neutral-600 mb-6">{produit.description}</p>}

        {/* Couleurs */}
        <div className="mb-5">
          <p className="text-sm font-medium mb-2">Couleur : {couleurChoisie?.nom}</p>
          <div className="flex gap-2">
            {couleursDisponibles.map((couleur) => (
              <button
                key={couleur.id}
                onClick={() => gererChangementCouleur(couleur)}
                className={`px-3 py-1.5 text-sm border ${
                  couleur.id === couleurChoisie?.id
                    ? 'border-bordeaux text-bordeaux'
                    : 'border-neutral-300 text-neutral-600'
                }`}
              >
                {couleur.nom}
              </button>
            ))}
          </div>
        </div>

        {/* Tailles */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Taille</p>
          <div className="flex flex-wrap gap-2">
            {taillesPourCouleur.map((variante) => {
              const enRupture = variante.stock === 0
              return (
                <button
                  key={variante.taille.id}
                  disabled={enRupture}
                  onClick={() => setTailleChoisie(variante.taille)}
                  className={`px-3 py-1.5 text-sm border ${
                    enRupture
                      ? 'border-neutral-200 text-neutral-300 cursor-not-allowed line-through'
                      : variante.taille.id === tailleChoisie?.id
                      ? 'border-bordeaux text-bordeaux'
                      : 'border-neutral-300 text-neutral-600'
                  }`}
                >
                  {variante.taille.nom}
                </button>
              )
            })}
          </div>
        </div>

        {tailleChoisie && (
          <p className="text-sm text-neutral-500 mb-4">
            {stockDisponible} en stock
          </p>
        )}

        {/* Quantité */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setQuantite((q) => Math.max(1, q - 1))}
            className="w-8 h-8 border border-neutral-300"
          >
            −
          </button>
          <span>{quantite}</span>
          <button
            onClick={() => setQuantite((q) => Math.min(stockDisponible, q + 1))}
            disabled={quantite >= stockDisponible}
            className="w-8 h-8 border border-neutral-300 disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          onClick={gererAjoutPanier}
          disabled={!tailleChoisie || stockDisponible === 0}
          className="w-full bg-bordeaux text-white py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Ajouter au panier
        </button>

        {messageAjout && <p className="mt-3 text-sm text-bordeaux">{messageAjout}</p>}
      </div>

      {/* Avis clients */}
<div className="md:col-span-2 mt-10 border-t border-neutral-200 pt-8">
  <h2 className="font-display text-xl mb-4">
    Avis clients {avis.length > 0 && `(${avis.length})`}
  </h2>

  {commandeEligible && (
  <div className="border border-neutral-200 p-4 mb-6">
    <p className="text-sm font-medium mb-2">Laisser un avis</p>
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setNoteChoisie(n)}
          className={`text-2xl leading-none ${n <= noteChoisie ? 'text-or' : 'text-neutral-200'}`}
        >
          ★
        </button>
      ))}
    </div>
    <textarea
      value={commentaireSaisi}
      onChange={(e) => setCommentaireSaisi(e.target.value)}
      placeholder="Votre commentaire (optionnel)"
      rows={3}
      className="w-full border border-neutral-300 px-3 py-2 text-sm mb-3"
    />
    {erreurAvis && <p className="text-bordeaux text-sm mb-2">{erreurAvis}</p>}
    <button
      type="button"
      onClick={gererEnvoiAvis}
      disabled={noteChoisie === 0 || envoiAvisEnCours}
      className="bg-bordeaux text-white px-4 py-2 text-sm disabled:opacity-40"
    >
      {envoiAvisEnCours ? 'Envoi...' : 'Publier mon avis'}
    </button>
  </div>
)}

  {avis.length === 0 ? (
    <p className="text-neutral-500 text-sm">Aucun avis pour l'instant sur cet article.</p>
  ) : (
    <div className="space-y-4">
      {avis.map((a) => (
        <div key={a.id} className="border border-neutral-200 p-4">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= a.note ? 'text-or' : 'text-neutral-200'}>
                ★
              </span>
            ))}
          </div>
          {a.commentaire && <p className="text-sm text-neutral-600">{a.commentaire}</p>}
        </div>
      ))}
    </div>
  )}
</div>

    </div>
  )
}

export default FicheProduit