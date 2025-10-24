import { supabase, Product, Category, Brand } from './supabase';

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

  // Récupérer un produit par ID
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('⚠️ Erreur lors du chargement du produit:', error);
      return null;
    }

    return data;
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
  async create(product: Omit<Product, 'created_at' | 'updated_at'> | Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    console.log('➕ ProductService.create() - Création référence:', product);
    
    // ⚠️ IMPORTANT : Nettoyer les champs vides pour éviter les contraintes unique
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanProduct: any = { ...product };
    // 🆕 Accepter un ID pré-généré (utile pour les nouveaux produits avec fetch IA avant sauvegarde)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('🆔 [ProductService.create] ID fourni:', (product as any).id || 'Non fourni (auto-généré)');
    if (cleanProduct.barcode === '' || cleanProduct.barcode === null) {
      delete cleanProduct.barcode;
      console.log('⚠️ [ProductService.create] Barcode vide retiré');
    }
    if (cleanProduct.internal_ref === '' || cleanProduct.internal_ref === null) {
      delete cleanProduct.internal_ref;
      console.log('⚠️ [ProductService.create] Internal_ref vide retiré');
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([cleanProduct])
      .select()
      .single();

    if (error) {
      console.error('❌ [ProductService.create] Erreur:', error.message, error.code, error.hint);
      return null;
    }

    console.log('✅ ProductService.create() - Référence créée:', data);

    // Ajouter à l'historique
    await this.addHistory(data.id, 'added', null, `Produit ajouté: ${product.name}`);

    return data;
  },

  // Mettre à jour un produit
  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    console.log('📝 [ProductService.update] Mise à jour produit:', id);
    
    // ⚠️ IMPORTANT : Supprimer barcode si vide pour éviter la contrainte unique
    const cleanUpdates = { ...updates };
    if (cleanUpdates.barcode === '' || cleanUpdates.barcode === null) {
      delete cleanUpdates.barcode;
      console.log('⚠️ [ProductService.update] Barcode vide retiré pour éviter conflit');
    }
    
    const { data, error } = await supabase
      .from('products')
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [ProductService.update] Erreur Supabase:', error.message, error.code);
      return null;
    }

    await this.addHistory(id, 'updated', null, 'Produit mis à jour');

    console.log('✅ [ProductService.update] Produit mis à jour avec succès');
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

// Services pour gérer les marques
export const BrandService = {
  // Récupérer toutes les marques
  async getAll(): Promise<Brand[]> {
    console.log('🏷️ [BrandService.getAll] Début requête');
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ [BrandService.getAll] Erreur:', error);
      return [];
    }

    console.log('✅ [BrandService.getAll] Marques récupérées:', data?.length || 0);
    return data || [];
  },

  // Récupérer une marque par ID
  async getById(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn('⚠️ [BrandService.getById] Erreur:', error);
      return null;
    }

    return data;
  },

  // Récupérer une marque par slug
  async getBySlug(slug: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.warn('⚠️ [BrandService.getBySlug] Erreur:', error);
      return null;
    }

    return data;
  },

  // Créer une nouvelle marque
  async create(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand | null> {
    console.log('➕ [BrandService.create] Création marque:', brand.name);
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single();

    if (error) {
      console.error('❌ [BrandService.create] Erreur:', error);
      return null;
    }

    console.log('✅ [BrandService.create] Marque créée:', data.id);
    return data;
  },

  // Mettre à jour une marque
  async update(id: string, updates: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>): Promise<Brand | null> {
    console.log('✏️ [BrandService.update] Mise à jour marque:', id);
    console.log('📝 [BrandService.update] Données:', JSON.stringify(updates, null, 2));
    
    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [BrandService.update] Erreur complète:', error);
      console.error('❌ Code:', error.code);
      console.error('❌ Message:', error.message);
      console.error('❌ Détails:', error.details);
      console.error('❌ Hint:', error.hint);
      return null;
    }

    console.log('✅ [BrandService.update] Marque mise à jour:', id);
    return data;
  },

  // Supprimer une marque
  async delete(id: string): Promise<boolean> {
    console.log('🗑️ [BrandService.delete] Suppression marque:', id);
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [BrandService.delete] Erreur:', error);
      return false;
    }

    console.log('✅ [BrandService.delete] Marque supprimée:', id);
    return true;
  },
};


