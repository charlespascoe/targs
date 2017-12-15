export function without<T>(items: T[], withoutItems: T[]): T[] {
  const withoutItemsSet = new Set(withoutItems);

  return items.filter(item => !withoutItemsSet.has(item));
}
