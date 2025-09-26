
export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string,
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  const formatter = new Intl.NumberFormat(locale, { ...defaultOptions, ...options });
  return formatter.format(amount);
};