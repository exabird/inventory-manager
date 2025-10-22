import { supabase } from './supabase';

export interface StockOperation {
  id: string;
  product_id: string;
  operation_type: 'add' | 'remove' | 'adjust' | 'set';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason: string;
  notes?: string;
  user_id?: string;
  created_at: string;
}

export interface StockReason {
  id: string;
  operation_type: 'add' | 'remove' | 'adjust' | 'set';
  reason_code: string;
  reason_label: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface StockOperationData {
  product_id: string;
  operation_type: 'add' | 'remove' | 'adjust' | 'set';
  quantity_change: number;
  reason: string;
  notes?: string;
}

export const StockService = {
  // Récupérer toutes les raisons disponibles
  async getReasons(operationType?: string): Promise<StockReason[]> {
    let query = supabase
      .from('stock_reasons')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (operationType) {
      query = query.eq('operation_type', operationType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Récupérer l'historique des opérations pour un produit
  async getOperationsByProduct(productId: string): Promise<StockOperation[]> {
    const { data, error } = await supabase
      .from('stock_operations')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Effectuer une opération de stock
  async performOperation(operationData: StockOperationData): Promise<StockOperation> {
    // Récupérer le stock actuel du produit
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', operationData.product_id)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Produit non trouvé');

    const quantityBefore = product.quantity || 0;
    let quantityAfter: number;

    // Calculer la nouvelle quantité selon le type d'opération
    switch (operationData.operation_type) {
      case 'add':
        quantityAfter = quantityBefore + operationData.quantity_change;
        break;
      case 'remove':
        quantityAfter = quantityBefore - operationData.quantity_change;
        break;
      case 'adjust':
        quantityAfter = quantityBefore + operationData.quantity_change;
        break;
      case 'set':
        quantityAfter = operationData.quantity_change;
        break;
      default:
        throw new Error('Type d\'opération invalide');
    }

    // Vérifier que la quantité finale n'est pas négative
    if (quantityAfter < 0) {
      throw new Error('La quantité finale ne peut pas être négative');
    }

    // Commencer une transaction
    const { data: operation, error: operationError } = await supabase
      .from('stock_operations')
      .insert({
        product_id: operationData.product_id,
        operation_type: operationData.operation_type,
        quantity_change: operationData.quantity_change,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        reason: operationData.reason,
        notes: operationData.notes,
        user_id: null, // TODO: Ajouter l'utilisateur connecté
      })
      .select()
      .single();

    if (operationError) throw operationError;

    // Mettre à jour la quantité du produit
    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: quantityAfter })
      .eq('id', operationData.product_id);

    if (updateError) throw updateError;

    return operation;
  },

  // Mettre à jour directement la quantité (pour modification directe)
  async updateQuantity(productId: string, newQuantity: number, reason: string, notes?: string): Promise<StockOperation> {
    // Récupérer le stock actuel
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Produit non trouvé');

    const quantityBefore = product.quantity || 0;
    const quantityChange = newQuantity - quantityBefore;

    if (quantityChange === 0) {
      throw new Error('Aucun changement de quantité');
    }

    // Pour l'opération 'set', quantity_change doit contenir la nouvelle valeur finale
    // Le calcul du changement réel sera fait dans l'historique
    const actualChange = newQuantity - quantityBefore;

    // Créer l'opération directement sans passer par performOperation
    const { data: operation, error: operationError } = await supabase
      .from('stock_operations')
      .insert({
        product_id: productId,
        operation_type: 'set',
        quantity_change: actualChange, // Le vrai changement pour l'historique
        quantity_before: quantityBefore,
        quantity_after: newQuantity,
        reason,
        notes,
        user_id: null,
      })
      .select()
      .single();

    if (operationError) throw operationError;

    // Mettre à jour la quantité du produit
    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', productId);

    if (updateError) throw updateError;

    return operation;
  },

  // Ajouter du stock
  async addStock(productId: string, quantity: number, reason: string, notes?: string): Promise<StockOperation> {
    const operationData: StockOperationData = {
      product_id: productId,
      operation_type: 'add',
      quantity_change: quantity,
      reason,
      notes,
    };

    return this.performOperation(operationData);
  },

  // Retirer du stock
  async removeStock(productId: string, quantity: number, reason: string, notes?: string): Promise<StockOperation> {
    const operationData: StockOperationData = {
      product_id: productId,
      operation_type: 'remove',
      quantity_change: quantity,
      reason,
      notes,
    };

    return this.performOperation(operationData);
  },

  // Mettre à jour les paramètres de stock minimum
  async updateMinStockSettings(productId: string, minStockRequired: boolean, minStockQuantity: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({
        min_stock_required: minStockRequired,
        min_stock_quantity: minStockQuantity,
      })
      .eq('id', productId);

    if (error) throw error;
  },
};
