export function getFavoriteLabel(name: string, isFavorite: boolean): string {
  return isFavorite //
    ? `Remove ${name} from favorites` //
    : `Mark ${name} as favorite`;
}
