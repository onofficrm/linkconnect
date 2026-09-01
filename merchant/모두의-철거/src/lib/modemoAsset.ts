/** Asset URL — files live in public/images and sync into imports/modemo/images. */

/**
 * @param rel e.g. "images/logo_black.png" or "logo_black.png"
 */
export function modemoAsset(rel: string): string {
  let path = rel.replace(/^\/+/, '');
  if (!path.startsWith('images/') && !path.startsWith('favicon')) {
    path = `images/${path}`;
  }
  // Vite base: /plugin/onoff-builder-bridge/imports/modemo/
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path}`;
}
