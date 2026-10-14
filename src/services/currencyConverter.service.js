import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY_CODE } from '@/shared/currencies';

/**
 * Pure calculation service for multi-currency conversions and rate formatting.
 */
export const convertCurrency = (amount, fromCode = DEFAULT_CURRENCY_CODE, toCode = DEFAULT_CURRENCY_CODE) => {
  const numAmount = Number(amount) || 0;

  const fromCurrency = SUPPORTED_CURRENCIES[fromCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY_CODE];
  const toCurrency = SUPPORTED_CURRENCIES[toCode] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY_CODE];

  // Convert from source to USD base, then from USD to target
  const amountInUSD = numAmount * fromCurrency.rateToUSD;
  const convertedAmount = amountInUSD / toCurrency.rateToUSD;

  return {
    originalAmount: numAmount,
    fromCode,
    toCode,
    convertedAmount: Number(convertedAmount.toFixed(2)),
    symbol: toCurrency.symbol,
  };
};
