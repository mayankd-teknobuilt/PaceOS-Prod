function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toClassName(slug) {
  let name = slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  if (/^\d/.test(name)) {
    name = `Module${name}`;
  }

  return name;
}

module.exports = { toSlug, toClassName };
