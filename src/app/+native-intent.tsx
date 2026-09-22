/**
 * Rewrites incoming deep links before Expo Router resolves them.
 * Use it to map legacy/marketing URLs or universal links onto routes.
 * https://docs.expo.dev/router/advanced/native-intent/
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    // Example: https://example.com/p/42  →  /item/42
    const url = new URL(path, 'placeholder://app');
    const product = url.pathname.match(/^\/p\/(\w+)$/);
    if (product) return `/item/${product[1]}`;
    return path;
  } catch {
    return '/';
  }
}
