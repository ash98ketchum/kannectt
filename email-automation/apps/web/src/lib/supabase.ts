// Browser-side Supabase client — re-exports the canonical utils client
export { createClient as createBrowserSupabaseClient } from "@/utils/supabase/client";

// Convenience singleton for use in Client Components
import { createClient } from "@/utils/supabase/client";
export const supabase = createClient();
