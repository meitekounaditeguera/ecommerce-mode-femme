import { Link } from 'react-router-dom'


function PageIntrouvable() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-display text-6xl text-bordeaux mb-4">404</p>
        <p className="font-display text-2xl mb-3">Page introuvable</p>
        <p className="text-neutral-500 text-sm mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-block bg-bordeaux text-white px-6 py-3 hover:bg-[#5e1e29] transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default PageIntrouvable