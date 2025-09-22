import { supabase } from './config.js';
import { AuthManager } from './auth.js';

export class ShopManager {
    // Créer une boutique
    static async createShop(shopData) {
        try {
            const user = await AuthManager.getCurrentUser();
            if (!user) throw new Error('Utilisateur non connecté');

            const { data, error } = await supabase
                .from('shops')
                .insert([{
                    ...shopData,
                    user_id: user.id,
                    slug: shopData.slug.toLowerCase().replace(/[^a-z0-9]/g, '-')
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Boutiques de l'utilisateur
    static async getUserShops() {
        try {
            const user = await AuthManager.getCurrentUser();
            if (!user) throw new Error('Utilisateur non connecté');

            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Toutes les boutiques actives
    static async getActiveShops() {
        try {
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}