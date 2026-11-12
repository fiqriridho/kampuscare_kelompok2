const BASE_URL = "https://api.nthusa.tw";

export async function getJson<T>(endpoint: string, timeoutMs = 8000): Promise<T> {
  const fetchData = () =>
    new Promise<T>((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
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
          resolve(data); 
        } catch (error) {
          const err = error as { name?: string; message?: string } | null;

          if (err?.name === "AbortError") {
            reject(
              new Error(
                "Waktu tunggu habis. Periksa koneksi internet lalu coba lagi."
              )
            );
            return;
          }
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

          reject(error);
        } finally {
          clearTimeout(timeoutId);
        }
      })();
    });

  return fetchData()
    .then((data) => data)
    .catch((error) => {
      throw error;
    });
}