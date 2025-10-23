import { supabase, Product, Category } from './supabase';

// Services pour gérer les produits
export const ProductService = {
  // Récupérer tous les produits
  async getAll(): Promise<Product[]> {
    console.log('📦 ProductService.getAll() - Début requête...');
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ Erreur lors du chargement des produits:', error);
      return [];
    }

    console.log('✅ ProductService.getAll() - Références récupérées:', data?.length || 0);
    console.log('Données:', data);
    return data || [];
  },

  // Récupérer un produit par code-barres
  async getByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('barcode', barcode)
      .single();

    if (error) {
      console.warn('⚠️ Erreur lors du chargement du produit:', error);
      return null;
    }

    return data;
  },

  // Créer un nouveau produit
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    console.log('➕ ProductService.create() - Création référence:', product);
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Erreur lors de la création du produit:', error);
      return null;
    }

    console.log('✅ ProductService.create() - Référence créée:', data);

    // Ajouter à l'historique
    await this.addHistory(data.id, 'added', null, `Produit ajouté: ${product.name}`);

    return data;
  },

  // Mettre à jour un produit
  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    console.log('📝 [ProductService.update] Données reçues:', updates);
    
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [ProductService.update] Erreur Supabase:');
      console.error('❌ Message:', error.message);
      console.error('❌ Code:', error.code);
      console.error('❌ Détails:', error.details);
      console.error('❌ Hint:', error.hint);
      console.error('❌ Données envoyées:', updates);
      return null;
    }

    await this.addHistory(id, 'updated', null, 'Produit mis à jour');

    console.log('✅ [ProductService.update] Produit mis à jour:', data);
    return data;
  },

  // Mettre à jour la quantité
  async updateQuantity(id: string, quantityChange: number): Promise<boolean> {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      console.warn('⚠️ Erreur lors du chargement du produit pour mise à jour quantité:', fetchError);
      return false;
    }

    const newQuantity = product.quantity + quantityChange;

    const { error } = await supabase
      .from('products')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.warn('⚠️ Erreur lors de la mise à jour de la quantité:', error);
      return false;
    }

    await this.addHistory(
      id, 
      'stock_change', 
      quantityChange, 
      `Changement de stock: ${quantityChange > 0 ? '+' : ''}${quantityChange}`
    );

    return true;
  },

  // Supprimer un produit
  async delete(id: string): Promise<boolean> {
    await this.addHistory(id, 'deleted', null, 'Produit supprimé');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('⚠️ Erreur lors de la suppression du produit:', error);
      return false;
    }

    return true;
  },

  // Rechercher des produits
  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .or(`name.ilike.%${query}%,barcode.ilike.%${query}%,internal_ref.ilike.%${query}%,manufacturer.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ Erreur lors de la recherche de produits:', error);
      return [];
    }

    return data || [];
  },

  // Ajouter à l'historique
  async addHistory(
    productId: string, 
    action: 'added' | 'updated' | 'deleted' | 'stock_change',
    quantityChange: number | null = null,
    notes: string | null = null
  ): Promise<void> {
    await supabase
      .from('product_history')
      .insert([{
        product_id: productId,
        action,
        quantity_change: quantityChange,
        notes,
      }]);
  },
};

// Services pour gérer les catégories
export const CategoryService = {
  // Récupérer toutes les catégories
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('⚠️ Erreur lors du chargement des catégories:', error);
      return [];
    }

    return data || [];
  },

  // Créer une nouvelle catégorie
  async create(name: string, description: string | null = null): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Erreur lors de la création de catégorie:', error);
      return null;
    }

    return data;
  },
};


