// What a photo slot renders. A real photo is always an <img>. A null photo is a marked placeholder on a normal build and
// NOTHING on a deploy build (DEPLOY=1 / npm run build:deploy), so a live site never says "Photo coming".
export const photoMode = (photo, deploy = !!process.env.DEPLOY) => (photo ? 'img' : deploy ? 'none' : 'placeholder');
