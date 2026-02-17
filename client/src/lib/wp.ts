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
