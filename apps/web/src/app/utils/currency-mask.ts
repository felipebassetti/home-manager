export const formatCurrencyInput = (value: string | number | null | undefined) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  return `R$ ${Number(digits).toLocaleString('pt-BR')}`;
};

export const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : null;
};
