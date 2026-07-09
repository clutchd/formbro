export function escapeCsvCell(value: string) {
  const safeValue = /^(?:[\t\r\n]|[\u0000-\u0020]*[=+\-@])/.test(value) ? `'${value}` : value;
  if (!/[",\n\r]/.test(safeValue)) return safeValue;
  return `"${safeValue.replace(/"/g, '""')}"`;
}
