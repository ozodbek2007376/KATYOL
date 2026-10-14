/**
 * Pure calculation service for employee payroll, bonuses, tax deductions, and net salary.
 */
export const calculateNetSalary = ({
  baseSalary = 0,
  overtimeHours = 0,
  overtimeRate = 1.5,
  hourlyBaseRate = 0,
  bonus = 0,
  taxRatePercentage = 10,
  pensionRatePercentage = 5,
}) => {
  const base = Number(baseSalary) || 0;
  const overtimePay = (Number(overtimeHours) || 0) * (Number(hourlyBaseRate) || 0) * Number(overtimeRate);
  const grossSalary = base + overtimePay + (Number(bonus) || 0);

  const taxDeduction = (grossSalary * (Number(taxRatePercentage) || 0)) / 100;
  const pensionDeduction = (grossSalary * (Number(pensionRatePercentage) || 0)) / 100;
  const totalDeductions = taxDeduction + pensionDeduction;

  const netSalary = grossSalary - totalDeductions;

  return {
    baseSalary: base,
    overtimePay: Number(overtimePay.toFixed(2)),
    grossSalary: Number(grossSalary.toFixed(2)),
    taxDeduction: Number(taxDeduction.toFixed(2)),
    pensionDeduction: Number(pensionDeduction.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netSalary: Number(netSalary.toFixed(2)),
  };
};
