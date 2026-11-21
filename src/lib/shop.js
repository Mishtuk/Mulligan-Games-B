// Hold requests: the link every release ad uses, and the line it prefills in the want list (Shop, public/js/hold.js).
export const holdHref = (id) => `/shop/?hold=${id}#hold-${id}`;
export const holdLine = (r, out) => `Hold: ${r.name} (${r.types ?? (out ? 'sealed product' : 'preorder')})`;
export const productHref = (id) => `/shop/${id}/`;
