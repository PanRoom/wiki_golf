// SupabaseプロジェクトのURLとanonキーを環境変数から取得します。
// Vercelにデプロイする際に、これらの環境変数を設定してください。
// ローカルでの開発時には、直接ここに値を記述するか、.envファイルを使用してください。
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Vercelのビルド時に置換されます
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Vercelのビルド時に置換されます

// CDNでグローバルに提供されるsupabaseオブジェクトを使用
export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
