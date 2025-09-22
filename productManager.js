import { supabase } from './config.js';
import { AuthManager } from './auth.js';

export class ProductManager {
    // Uploader fichier
    static async uploadProductFile(file, shopId) {
        try {
            const user = await AuthManager.getCurrentUser();
            if (!user) throw new Error('Non authentifié');

            // Vérifier taille fichier (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                throw new Error('Fichier trop volumineux (max 100MB)');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${shopId}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;
            return { success: true, filePath: `products/${filePath}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Créer produit
    static async createProduct(productData, file) {
        try {
            const user = await AuthManager.getCurrentUser();
            if (!user) throw new Error('Non authentifié');

            // Upload fichier
            const uploadResult = await this.uploadProductFile(file, productData.shop_id);
            if (!uploadResult.success) throw new Error(uploadResult.error);

            // Créer produit
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    ...productData,
                    file_url: uploadResult.filePath,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    price: parseFloat(productData.price)
                }])
                .select()
                .single();

            if (error) {
                // Nettoyer fichier en cas d'erreur
                await supabase.storage.from('products').remove([uploadResult.filePath.replace('products/', '')]);
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Produits publiés
    static async getPublishedProducts() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    shops (
                        name,
                        slug,
                        logo_url
                    )
                `)
                .eq('is_published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Produits de la boutique
    static async getShopProducts(shopId) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('shop_id', shopId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}