// services/api.ts

const BASE_URL = "https://api.nthusa.tw";

export async function getJson<T>(endpoint: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    const err = error as { name?: string; message?: string } | null;
    if (err?.name === "AbortError") {
      throw new Error(
        "Waktu tunggu habis. Periksa koneksi internet lalu coba lagi."
      );
    }
    // Kesalahan jaringan: koneksi putus, DNS, atau fetch gagal di native
    if (
      error instanceof TypeError ||
      /network|fetch failed|jaringan|java\.net/i.test(err?.message ?? "")
    ) {
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}