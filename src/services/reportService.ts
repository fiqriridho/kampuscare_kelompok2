import { supabase } from "../lib/supabase";

/**
 * Ubah nama tabel ini sesuai dengan nama tabel di Supabase saat live coding
 * (misalnya: "missions", "notes", "feedbacks", atau "facility_reports").
 */
export const CLOUD_TABLE_NAME = "facility_reports";

/**
 * Interface baris tabel Supabase (tanpa `any`).
 * Sesuaikan properti di bawah ini dengan kolom tabel pada soal live coding.
 */
export interface FacilityReportRow {
  id: string;
  location: string;
  description: string;
  user_id: string | null;
  created_at: string;
}

export interface CreateFacilityReportInput {
  location: string;
  description: string;
  userId?: string | null;
}

export const reportService = {
  /**
   * Mengambil daftar data dari tabel Supabase (pola SELECT + ORDER).
   */
  async getReports(): Promise<FacilityReportRow[]> {
    const { data, error } = await supabase
      .from(CLOUD_TABLE_NAME)
      .select("id, location, description, user_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as FacilityReportRow[];
  },

  /**
   * Menyimpan baris baru ke tabel Supabase (pola INSERT + sanitasi .trim() + user_id).
   */
  async createReport(
    input: CreateFacilityReportInput
  ): Promise<FacilityReportRow> {
    const trimmedLocation = input.location.trim();
    const trimmedDescription = input.description.trim();

    if (!trimmedLocation || !trimmedDescription) {
      throw new Error("Lokasi dan deskripsi wajib diisi.");
    }

    let resolvedUserId = input.userId ?? null;
    if (!resolvedUserId) {
      const { data: userData } = await supabase.auth.getUser();
      resolvedUserId = userData.user?.id ?? null;
    }

    const { data, error } = await supabase
      .from(CLOUD_TABLE_NAME)
      .insert([
        {
          location: trimmedLocation,
          description: trimmedDescription,
          ...(resolvedUserId ? { user_id: resolvedUserId } : {}),
        },
      ])
      .select("id, location, description, user_id, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as FacilityReportRow;
  },
};

// Langkah 3 — Atur RLS (Row Level Security)

// Masuk ke Authentication → Policies → pilih tabel facility_reports.

// Buat 2 policy:

// Policy 1 — INSERT (siapa pun yang login bisa lapor):

// sql
// CREATE POLICY "Allow insert for authenticated users"
// ON facility_reports
// FOR INSERT
// TO authenticated
// WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

// Policy 2 — SELECT (semua data bisa dibaca yang login):

// sql
// CREATE POLICY "Allow select for authenticated users"
// ON facility_reports
// FOR SELECT
// TO authenticated
// USING (true);