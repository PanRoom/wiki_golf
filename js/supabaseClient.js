// SupabaseプロジェクトのURLとanonキーを環境変数から取得します。
// Vercelにデプロイする際に、これらの環境変数を設定してください。
// ローカルでの開発時には、直接ここに記述するか、.envファイルを使用してください。
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// CDNでグローバルに提供されるsupabaseオブジェクトを使用
export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
