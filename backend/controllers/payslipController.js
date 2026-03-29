const PDFDocument = require('pdfkit');
const Payroll = require('../models/Payroll');
const { toFiniteNumber } = require('../utils/payrollTax');

const rupees = (v) => {
  const n = toFiniteNumber(v);
  return `₹${n.toLocaleString('en-IN')}`;
};

const generatePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId');

    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    const emp = payroll.employeeId;
    if (!emp) {
      return res.status(400).json({ message: 'Employee record missing for this payroll' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    const safeName = String(emp.name || 'employee').replace(/[^\w\- ]+/g, '').trim() || 'employee';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${safeName}-${payroll.month}-${payroll.year}.pdf`);

    doc.pipe(res);

    // ---- Header ----
    doc.rect(0, 0, 612, 80).fill('#1a1f2e');
    doc.fillColor('#ffffff')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('HRMS', 50, 20);
    doc.fontSize(10)
      .font('Helvetica')
      .text('Human Resource Management System', 50, 50);
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text('PAYSLIP', 450, 30, { align: 'right' });

    // ---- Pay Period ----
    doc.fillColor('#1a1f2e')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`Pay Period: ${payroll.month}/${payroll.year}`, 50, 100);
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#718096')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 118);

    // ---- Employee Info Box ----
    doc.rect(50, 140, 512, 90).fill('#f7fafc').stroke('#e2e8f0');
    doc.fillColor('#1a1f2e')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Employee Information', 65, 152);

    doc.fontSize(10).font('Helvetica').fillColor('#4a5568');
    doc.text(`Name: ${emp.name}`, 65, 170);
    doc.text(`Email: ${emp.email}`, 65, 185);
    doc.text(`Department: ${emp.department || 'N/A'}`, 65, 200);

    doc.text(`Employee ID: ${emp.employeeId || 'N/A'}`, 320, 170);
    doc.text(`Designation: ${emp.designation || 'N/A'}`, 320, 185);
    doc.text(`Joining Date: ${emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}`, 320, 200);

    // ---- Earnings Table ----
    doc.fillColor('#1a1f2e')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Earnings', 50, 255);

    // Table header
    doc.rect(50, 270, 512, 25).fill('#4f8ef7');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
    doc.text('Component', 65, 278);
    doc.text('Amount', 480, 278, { align: 'right', width: 70 });

    // Earnings rows
    const earnings = [
      { label: 'Basic Salary', amount: toFiniteNumber(payroll.basicSalary) },
      { label: 'House Rent Allowance (HRA)', amount: toFiniteNumber(payroll.hra) },
      { label: 'Allowances', amount: toFiniteNumber(payroll.allowances) },
      { label: 'Bonus', amount: toFiniteNumber(payroll.bonus) },
    ];

    let y = 295;
    earnings.forEach((item, i) => {
      if (item.amount > 0) {
        doc.rect(50, y, 512, 22).fill(i % 2 === 0 ? '#ffffff' : '#f7fafc');
        doc.fillColor('#4a5568').fontSize(10).font('Helvetica');
        doc.text(item.label, 65, y + 6);
        doc.text(rupees(item.amount), 480, y + 6, { align: 'right', width: 70 });
        y += 22;
      }
    });

    // Gross total
    doc.rect(50, y, 512, 25).fill('#e6fffa');
    doc.fillColor('#2d3748').fontSize(10).font('Helvetica-Bold');
    doc.text('Gross Salary', 65, y + 7);
    doc.text(rupees(payroll.grossSalary), 480, y + 7, { align: 'right', width: 70 });
    y += 40;

    // ---- Deductions Table ----
    doc.fillColor('#1a1f2e')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Deductions', 50, y);
    y += 15;

    doc.rect(50, y, 512, 25).fill('#e53e3e');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
    doc.text('Component', 65, y + 8);
    doc.text('Amount', 480, y + 8, { align: 'right', width: 70 });
    y += 25;

    const deductions = [
      { label: 'Provident Fund (PF)', amount: toFiniteNumber(payroll.providentFund) },
      { label: 'Tax Deduction (TDS)', amount: toFiniteNumber(payroll.tax) },
      { label: 'Other Deductions', amount: toFiniteNumber(payroll.otherDeductions) },
    ];

    deductions.forEach((item, i) => {
      if (item.amount > 0) {
        doc.rect(50, y, 512, 22).fill(i % 2 === 0 ? '#ffffff' : '#fff5f5');
        doc.fillColor('#4a5568').fontSize(10).font('Helvetica');
        doc.text(item.label, 65, y + 6);
        doc.text(rupees(item.amount), 480, y + 6, { align: 'right', width: 70 });
        y += 22;
      }
    });

    // Total deductions (numeric — avoid string + number concatenation)
    const totalDeductions =
      toFiniteNumber(payroll.providentFund) + toFiniteNumber(payroll.tax) + toFiniteNumber(payroll.otherDeductions);
    doc.rect(50, y, 512, 25).fill('#fff5f5');
    doc.fillColor('#e53e3e').fontSize(10).font('Helvetica-Bold');
    doc.text('Total Deductions', 65, y + 7);
    doc.text(rupees(totalDeductions), 480, y + 7, { align: 'right', width: 70 });
    y += 40;

    // ---- Net Salary Box ----
    doc.rect(50, y, 512, 45).fill('#1a1f2e');
    doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold');
    doc.text('NET SALARY (Take Home)', 65, y + 14);
    doc.fontSize(16)
      .text(rupees(payroll.netSalary), 480, y + 12, { align: 'right', width: 70 });
    y += 65;

    // ---- Status ----
    doc.fontSize(10).font('Helvetica').fillColor('#718096');
    doc.text(`Payment Status: ${payroll.status.toUpperCase()}`, 50, y);
    if (payroll.paidOn) {
      doc.text(`Paid On: ${payroll.paidOn}`, 50, y + 15);
    }

    // ---- Footer ----
    doc.rect(0, 760, 612, 30).fill('#1a1f2e');
    doc.fillColor('#a0aec0').fontSize(9).font('Helvetica')
      .text('This is a system generated payslip. No signature required.', 50, 769, { align: 'center', width: 512 });

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error generating payslip', error: err.message });
  }
};

module.exports = { generatePayslip };