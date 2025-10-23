import { supabase } from './supabase';

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  url: string;
  is_featured: boolean;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export class ProductImageService {
  // Récupérer toutes les images d'un produit
  static async getByProductId(productId: string): Promise<ProductImage[]> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) {
        // Ne pas logger les erreurs si c'est juste qu'il n'y a pas d'images
        if (error.code !== 'PGRST116') { // Code pour "no rows found"
          console.warn('⚠️ Erreur lors de la récupération des images:', error);
        }
        return [];
      }

      return data || [];
    } catch (error) {
      // En cas d'erreur réseau ou autre, retourner un tableau vide
      console.warn('Erreur lors de la récupération des images:', error);
      return [];
    }
  }

  // Ajouter une nouvelle image
  static async create(imageData: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'>): Promise<ProductImage> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .insert([imageData])
        .select()
        .single();

      if (error) {
        // Ne pas logger les erreurs de création si c'est juste une contrainte
        if (error.code !== '23505') { // Code pour "unique violation"
          console.warn('⚠️ Erreur lors de la création de l\'image:', error);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.warn('Erreur lors de la création de l\'image:', error);
      throw error;
    }
  }

  // Mettre à jour une image
  static async update(id: string, updates: Partial<ProductImage>): Promise<ProductImage> {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Erreur lors de la mise à jour de l\'image:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.warn('Erreur lors de la mise à jour de l\'image:', error);
      throw error;
    }
  }

  // Supprimer une image
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Erreur lors de la suppression de l\'image:', error);
        throw error;
      }
    } catch (error) {
      console.warn('Erreur lors de la suppression de l\'image:', error);
      throw error;
    }
  }

  // Définir une image comme featured (et désactiver les autres)
  static async setFeatured(productId: string, imageId: string): Promise<void> {
    // Désactiver toutes les images featured du produit
    await supabase
      .from('product_images')
      .update({ is_featured: false })
      .eq('product_id', productId);

    // Activer l'image sélectionnée
    const { error } = await supabase
      .from('product_images')
      .update({ is_featured: true })
      .eq('id', imageId);

    if (error) {
      console.warn('⚠️ Erreur lors de la définition de l\'image featured:', error);
      throw error;
    }
  }

  // Supprimer toutes les images d'un produit
  static async deleteByProductId(productId: string): Promise<void> {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (error) {
      console.warn('⚠️ Erreur lors de la suppression des images du produit:', error);
      throw error;
    }
  }
}
