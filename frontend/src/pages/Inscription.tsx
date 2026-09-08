import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Inscription() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)
  const { sInscrire } = useAuth()
  const navigate = useNavigate()

  async function gererSoumission(e: FormEvent) {
    e.preventDefault()
    setErreur(null)

    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }
    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setEnCours(true)
    try {
      await sInscrire(email, motDePasse)
      navigate('/')
    } catch (err: any) {
      const detail = err.response?.data?.detail
      setErreur(detail ?? "Une erreur est survenue lors de l'inscription")
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] grid md:grid-cols-2">
      {/* Panneau image — masqué sur mobile */}
      <div className="hidden md:block relative bg-neutral-900">
        <img
          src="http://127.0.0.1:8000/static/uploads/ensembles-haut-pantalon_e70fdca9c7b190a4.jpg"
          alt=""
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <p className="font-display text-3xl leading-tight mb-2">
            Rejoignez-nous
          </p>
          <p className="text-sm text-white/80">
            Créez votre compte pour suivre vos commandes et vos coups de cœur.
          </p>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl mb-2">Créer un compte</h1>
          <p className="text-neutral-500 text-sm mb-8">
            Rejoignez la collection en quelques instants
          </p>

          <form onSubmit={gererSoumission} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-b border-neutral-300 py-2 focus:border-bordeaux outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                className="w-full border-b border-neutral-300 py-2 focus:border-bordeaux outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
                className="w-full border-b border-neutral-300 py-2 focus:border-bordeaux outline-none transition-colors"
              />
            </div>

            {erreur && (
              <p className="text-bordeaux text-sm bg-red-50 px-3 py-2 rounded">{erreur}</p>
            )}

            <button
              type="submit"
              disabled={enCours}
              className="w-full bg-bordeaux text-white py-3 mt-2 hover:bg-[#5e1e29] transition-colors disabled:opacity-50"
            >
              {enCours ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-sm text-neutral-500 mt-8 text-center">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-bordeaux underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Inscription