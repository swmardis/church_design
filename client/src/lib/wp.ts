declare global {
  interface Window {
    PGLD?: {
      restUrl?: string;
      wpRestRoot?: string;
      nonce?: string;
      baseUrl?: string;
      pluginUrl?: string;
      isAdminRoute?: boolean;
    };
  }
}

export function wpApiUrl(path: string): string {
  const rest = window.PGLD?.restUrl || "/wp-json/pursue/v1";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/api/")) return `${rest}${path.replace(/^\/api/, "")}`;
  if (path.startsWith("/wp-json/")) return path;
  if (path.startsWith("/")) return `${rest}${path}`;
  return `${rest}/${path}`;
}

export function wpHeaders(extra: Record<string, string> = {}): HeadersInit {
  const nonce = window.PGLD?.nonce;
  return {
    ...(nonce ? { "X-WP-Nonce": nonce } : {}),
    ...extra,
  };
}

export async function wpFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let url = wpApiUrl(path);

  // Cache-bust all GET requests (and optionally others) to avoid browser/CF stale REST responses
  const method = (options.method || "GET").toUpperCase();
  if (method === "GET") {
    url += (url.includes("?") ? "&" : "?") + `cb=${Date.now()}`;
  }
  
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin", // REQUIRED for WP auth cookies
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...wpHeaders(),
      ...(options.headers || {}),
    },
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP REST ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as any;
  return (await res.json()) as T;
}
