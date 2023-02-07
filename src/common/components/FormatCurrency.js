const FormatCurrency = ({ languageIsoCode, currencyIsoCode = 'USD', amount }) => {
  const formatter = new Intl.NumberFormat(languageIsoCode.replace('_', '-'), {
    style: 'currency',
    currency: currencyIsoCode,
  });
  return formatter.format(amount);
};

export default FormatCurrency;
