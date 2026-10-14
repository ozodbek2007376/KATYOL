export const getActiveCurrency = () => {
  try {
    const prefix = 'kotyol_erp_';
    const companyCurr = localStorage.getItem(`${prefix}company_currency`) || localStorage.getItem('company_currency');
    if (companyCurr) {
      const clean = companyCurr.replace(/"/g, '').trim().toUpperCase();
      if (clean) return clean;
    }
    const userProfile = localStorage.getItem('user_profile');
    if (userProfile) {
      const parsed = JSON.parse(userProfile);
      const curr = parsed?.currency || parsed?.organization_currency;
      if (curr) return String(curr).trim().toUpperCase();
    }
    const savedRaw = localStorage.getItem(`${prefix}selected_currency`);
    if (savedRaw) {
      const parsed = JSON.parse(savedRaw);
      if (parsed) return String(parsed).trim().toUpperCase();
    }
  } catch (_err) {
    // Ignore storage parse errors
  }
  return 'UZS';
};

export const setActiveCurrency = (currencyCode) => {
  if (!currencyCode) return;
  const clean = String(currencyCode).trim().toUpperCase();
  const prefix = 'kotyol_erp_';
  localStorage.setItem(`${prefix}company_currency`, clean);
  localStorage.setItem('company_currency', clean);
  try {
    const userProfile = localStorage.getItem('user_profile');
    if (userProfile) {
      const parsed = JSON.parse(userProfile);
      parsed.currency = clean;
      localStorage.setItem('user_profile', JSON.stringify(parsed));
    }
  } catch (_err) {
    // Ignore storage write errors
  }
  window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: clean } }));
};

export const getCurrencyRate = (fromCurrency = 'USD', toCurrency) => {
  const to = (toCurrency || getActiveCurrency()).toUpperCase();
  const from = fromCurrency.toUpperCase();
  if (from === to) return 1;

  try {
    // Check saved rates from CurrencySettingsPage
    const ratesRaw = localStorage.getItem('kotyol_erp_currency_rates');
    if (ratesRaw) {
      const rates = JSON.parse(ratesRaw);
      const key = `${from}_${to}`;
      if (rates[key]) return Number(rates[key]);
      const reverseKey = `${to}_${from}`;
      if (rates[reverseKey]) return 1 / Number(rates[reverseKey]);
    }
  } catch (_err) {
    // Ignore
  }

  // Default fallback rates
  if (from === 'USD' && to === 'UZS') return 12800;
  if (from === 'UZS' && to === 'USD') return 1 / 12800;
  return 1;
};

export const setCurrencyRate = (fromCurrency, toCurrency, rate) => {
  try {
    const ratesRaw = localStorage.getItem('kotyol_erp_currency_rates') || '{}';
    const rates = JSON.parse(ratesRaw);
    const key = `${fromCurrency.toUpperCase()}_${toCurrency.toUpperCase()}`;
    rates[key] = Number(rate);
    const reverseKey = `${toCurrency.toUpperCase()}_${fromCurrency.toUpperCase()}`;
    rates[reverseKey] = rate > 0 ? 1 / Number(rate) : 0;
    localStorage.setItem('kotyol_erp_currency_rates', JSON.stringify(rates));
  } catch (_err) {
    // Ignore
  }
};

export const parseRawNumber = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const clean = String(val).replace(/[\s\u00A0]/g, '').replace(/,/g, '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const num = parseRawNumber(amount);
  const rate = getCurrencyRate(fromCurrency, toCurrency);
  return num * rate;
};

export const getCurrencySymbol = (customCurrency) => {
  const code = (customCurrency || getActiveCurrency()).toUpperCase();
  if (code === 'USD' || code === '$') return '$';
  if (code === 'UZS') return "so'm";
  if (code === 'EUR') return '€';
  if (code === 'RUB') return '₽';
  return code;
};

export const formatCurrency = (amount, customCurrency) => {
  const num = parseRawNumber(amount);
  const code = (customCurrency || getActiveCurrency()).toUpperCase();

  if (code === 'USD' || code === '$') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (code === 'UZS') {
    return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;
  }
  if (code === 'EUR') {
    return `€${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (code === 'RUB') {
    return `${num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  }
  return `${num.toLocaleString()} ${code}`;
};

/**
 * Format amount in active currency, converting from source currency if needed
 * Example: formatConverted(100, 'USD') → when active is UZS → "1,280,000 so'm"
 */
export const formatConverted = (amount, sourceCurrency) => {
  const active = getActiveCurrency();
  const source = (sourceCurrency || 'USD').toUpperCase();
  if (source === active) return formatCurrency(amount);
  const converted = convertCurrency(amount, source, active);
  return formatCurrency(converted);
};
