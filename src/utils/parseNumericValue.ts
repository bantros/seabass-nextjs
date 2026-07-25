export const parseNumericValue = (
  value: string | number | undefined | null
) => {
  const numeric =
    typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(numeric) ? numeric : 0;
};
