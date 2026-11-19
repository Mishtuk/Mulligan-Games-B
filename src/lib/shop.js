// Shop data helpers: split products.json into sealed and preorders, and name the games we stock.
export function splitProducts(products) {
  return { sealed: products.filter((p) => p.kind !== 'preorder'), preorders: products.filter((p) => p.kind === 'preorder') };
}
export function joinNames(games) {
  const n = games.map((g) => g.name);
  return n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n.at(-1)}`;
}
