// Small, dependency-free validation helpers. The previous prototype relied
// only on HTML `required` attributes, which any direct API call bypasses —
// these run server-side, on every request, regardless of what the frontend does.

export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function missingFields(body, fields) {
  return fields.filter((f) => {
    const v = body?.[f];
    return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  });
}

export function isValidDate(value) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

export function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      out[key] = obj[key];
    }
  }
  return out;
}
