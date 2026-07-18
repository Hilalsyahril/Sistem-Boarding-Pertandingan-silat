export interface Pesilat {
  id: string;
  nomor_partai: string;
  nama_pesilat: string; // Sudut Merah
  kontingen: string;    // Sudut Merah
  nama_pesilat_biru: string; // Sudut Biru
  kontingen_biru: string;    // Sudut Biru
  kelas: string;
  kategori: string;
  gender: string;
  arena: number;
  is_playing: boolean;
  timer_duration: number; // in seconds
  timer_seconds_left: number; // in seconds
  timer_running: boolean;
  timer_last_updated_at?: number;
  is_done?: boolean;
  created_at?: string;
}

export interface ConfigStatus {
  configured: boolean;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  mode: "supabase" | "local_fallback";
}
