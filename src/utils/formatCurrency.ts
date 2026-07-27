export const formatCurrency = (
  amount: number,
  currency: 'GBP' | 'USD',
  style: 'currency' | 'decimal'
) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: style,
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
  return formattedAmount;
};
