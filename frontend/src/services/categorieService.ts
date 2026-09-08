import api from './api'
import type { Categorie } from '../types/produit'

export async function listerCategories(): Promise<Categorie[]> {
  const reponse = await api.get<Categorie[]>('/categories/')
  return reponse.data
}