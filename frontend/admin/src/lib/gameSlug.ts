/** Lowercase hyphenated slug for S3 game folder keys; mirrors server-side normalization closely enough for previews. */
export function slugifyForGameFolder(title: string): string {
  const t = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
  return t || 'game';
}
