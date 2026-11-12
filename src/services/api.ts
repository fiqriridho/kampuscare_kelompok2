// services/api.ts

const BASE_URL = "https://api.nthusa.tw";

export async function getJson<T>(endpoint: string, timeoutMs = 8000): Promise<T> {
  // Promise ini merepresentasikan proses pengambilan data API.
  // Saat operasi berhasil, resolve() dipanggil; saat gagal, reject() dipanggil.
  const fetchData = () =>
    new Promise<T>((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Gunakan async/await dan fetch() agar tetap sesuai dengan implementasi yang sudah ada.
      (async () => {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = (await response.json()) as T;
          resolve(data); // resolve() ketika data berhasil diambil
        } catch (error) {
          const err = error as { name?: string; message?: string } | null;

          // Timeout: request terlalu lama atau koneksi timeout
          if (err?.name === "AbortError") {
            reject(
              new Error(
                "Waktu tunggu habis. Periksa koneksi internet lalu coba lagi."
              )
            );
            return;
          }

          // Kesalahan jaringan: koneksi putus, DNS, atau fetch gagal di native
          if (
            error instanceof TypeError ||
            /network|fetch failed|jaringan|java\.net/i.test(err?.message ?? "")
          ) {
            reject(
              new Error(
                "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
              )
            );
            return;
          }

          reject(error); // reject() ketika API gagal diproses
        } finally {
          clearTimeout(timeoutId);
        }
      })();
    });

  // Promise chain untuk menunjukkan penggunaan .then() dan .catch() dalam materi Promise.
  return fetchData()
    .then((data) => data)
    .catch((error) => {
      throw error;
    });
}