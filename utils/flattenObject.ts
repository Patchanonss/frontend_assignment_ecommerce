type Primitive = string | number | boolean | null;
type Flattenable = Record<string, unknown>;

export function flattenObject(obj: Flattenable, prefix = ''): Record<string, Primitive> {
  const result: Record<string, Primitive> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[fullKey] = null;
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${fullKey}.${index}`;
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          Object.assign(result, flattenObject(item as Flattenable, arrayKey));
        } else {
          result[arrayKey] = item as Primitive;
        }
      });
    } else if (typeof value === 'object') {
      Object.assign(result, flattenObject(value as Flattenable, fullKey));
    } else {
      result[fullKey] = value as Primitive;
    }
  }

  return result;
}
