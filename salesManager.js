import { supabase } from './config.js';
import { AuthManager } from './auth.js';

export class SalesManager {
    // Traiter une vente (simulée pour l'exemple)
    static async processSale(productId) {
        try {
            const user = await AuthManager.getCurrentUser();
            if (!user) throw new Error('Non authentifié');

            // Simuler un ID de paiement Stripe (à remplacer par vrai intégration)
            const stripePaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

            const { data, error } = await supabase.rpc('process_sale_secure', {
                p_product_id: productId,
                p_buyer_id: user.id,
                p_stripe_payment_intent_id: stripePaymentIntentId
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Achats de l'utilisateur
    static async getUserPurchases() {
        try {
            const user = await AuthManager.getCurrentUser();
            if (!user) throw new Error('Non authentifié');

            const { data, error } = await supabase
                .from('sales')
                .select(`
                    *,
                    products (
                        name,
                        description,
                        file_name,
                        file_type
                    ),
                    shops (
                        name,
                        slug
                    )
                `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Générer lien de téléchargement
    static async getDownloadLink(saleId) {
        try {
            const user = await AuthManager.getCurrentUser();
            if (!user) throw new Error('Non authentifié');

            // Vérifier droits et récupérer infos
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .select(`
                    *,
                    products (
                        file_url,
                        file_name
                    )
                `)
                .eq('id', saleId)
                .eq('buyer_id', user.id)
                .single();

            if (saleError) throw saleError;

            // Générer URL signée
            const { data: signedUrl, error: urlError } = await supabase.storage
                .from('products')
                .createSignedUrl(saleData.products.file_url, 3600); // 1 heure

            if (urlError) throw urlError;

            return { 
                success: true, 
                data: {
                    downloadUrl: signedUrl.signedUrl,
                    fileName: saleData.products.file_name
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}