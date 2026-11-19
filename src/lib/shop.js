// Shop data helpers: split products.json into sealed and preorders.
export function splitProducts(products) {
  return { sealed: products.filter((p) => p.kind !== 'preorder'), preorders: products.filter((p) => p.kind === 'preorder') };
}
