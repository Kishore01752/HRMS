/**
 * Illustrative India new-regime progressive tax on annual taxable income (₹).
 * Slabs: 0–3L nil, 3–6L 5%, 6–9L 10%, 9–12L 15%, 12–15L 20%, >15L 30%.
 * Not legal advice — verify with your CA for production payroll.
 */
function computeAnnualIncomeTax(annualTaxable) {
  const x = Math.max(0, Math.round(annualTaxable));
  if (x <= 300000) return 0;

  let tax = 0;
  const s1 = Math.min(x, 600000) - 300000;
  if (s1 > 0) tax += s1 * 0.05;
  const s2 = Math.min(x, 900000) - 600000;
  if (s2 > 0) tax += s2 * 0.10;
  const s3 = Math.min(x, 1200000) - 900000;
  if (s3 > 0) tax += s3 * 0.15;
  const s4 = Math.min(x, 1500000) - 1200000;
  if (s4 > 0) tax += s4 * 0.20;
  if (x > 1500000) tax += (x - 1500000) * 0.30;

  return Math.round(tax);
}

function toFiniteNumber(v) {
  const n = typeof v === 'string' ? parseFloat(v.replace(/,/g, '').trim()) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Monthly CTC → components + monthly TDS (new regime illustrative).
 * @param {number} monthlyCtc - Monthly cost-to-company
 */
function computeMonthlyPayrollBreakdown(monthlyCtc, extraAllowances = 0, extraBonus = 0, otherDeductions = 0) {
  const ctc = toFiniteNumber(monthlyCtc);
  const extraA = toFiniteNumber(extraAllowances);
  const extraB = toFiniteNumber(extraBonus);
  const otherD = toFiniteNumber(otherDeductions);

  const basicSalary = ctc * 0.5;
  const hra = ctc * 0.2;
  const providentFund = basicSalary * 0.12;

  // All operands must be numbers — mixing with strings causes string concatenation (e.g. 280000 + "1500" → "2800001500").
  const grossSalary = basicSalary + hra + extraA + extraB;

  const annualGrossEstimate = grossSalary * 12;
  const annualPFEmployee = providentFund * 12;
  const standardDeduction = 75000;
  const annualTaxable = Math.max(0, annualGrossEstimate - standardDeduction - annualPFEmployee);
  const annualTax = computeAnnualIncomeTax(annualTaxable);
  const tax = annualTax / 12;

  const netSalary = grossSalary - providentFund - tax - otherD;

  return {
    basicSalary: Math.round(basicSalary * 100) / 100,
    hra: Math.round(hra * 100) / 100,
    providentFund: Math.round(providentFund * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    grossSalary: Math.round(grossSalary * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
    annualTaxableEstimate: Math.round(annualTaxable),
    annualTaxEstimate: annualTax
  };
}

module.exports = { computeAnnualIncomeTax, computeMonthlyPayrollBreakdown, toFiniteNumber };
