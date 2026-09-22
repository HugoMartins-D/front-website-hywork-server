// Mantém dígitos latinos na interface e aceita entradas de dados legadas.
export const normalizeDigits = (value: string): string =>
  value.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

// Strings preservam zeros à esquerda, usados em horários e códigos.
export const formatNumber = (value: number | string): string =>
  typeof value === 'number'
    ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 20 }).format(value)
    : normalizeDigits(value);

// Os valores continuam na moeda original; localização não converte preços.
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('pt-BR').format(price);

export const formatRating = (rating: number): string =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
