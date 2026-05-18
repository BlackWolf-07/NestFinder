const PDFDocument = require('pdfkit');

exports.generateRentalAgreement = (res, data) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream the PDF directly to the response
  doc.pipe(res);

  // Header
  doc.fontSize(25).text('RENTAL AGREEMENT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(2);

  // Parties
  doc.fontSize(14).font('Helvetica-Bold').text('BETWEEN:');
  doc.fontSize(12).font('Helvetica').text(`Landlord/Owner: ${data.ownerName}`);
  doc.text(`Address: ${data.ownerAddress || 'N/A'}`);
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text('AND:');
  doc.fontSize(12).font('Helvetica').text(`Tenant/Renter: ${data.renterName}`);
  doc.text(`Address: ${data.renterEmail}`);
  doc.moveDown(2);

  // Property Details
  doc.fontSize(14).font('Helvetica-Bold').text('1. THE PROPERTY');
  doc.fontSize(12).font('Helvetica').text(`The Landlord agrees to rent the property located at:`);
  doc.font('Helvetica-Oblique').text(`${data.propertyTitle}, ${data.propertyAddress}, ${data.city}`);
  doc.moveDown();

  // Financials
  doc.fontSize(14).font('Helvetica-Bold').text('2. RENT & DEPOSIT');
  doc.fontSize(12).font('Helvetica').text(`The monthly rent for the property is $${data.rentAmount}.`);
  doc.text(`A security deposit of $${data.rentAmount * 2} shall be paid before occupancy.`);
  doc.moveDown();

  // Terms
  doc.fontSize(14).font('Helvetica-Bold').text('3. TERMS AND CONDITIONS');
  doc.fontSize(10).font('Helvetica').text(`
    - The tenant shall maintain the property in clean and good condition.
    - No structural changes or loud modifications are allowed.
    - The tenant is responsible for any damage caused by negligence.
    - Notice period for vacation is 30 days.
  `, { indent: 20 });
  doc.moveDown(4);

  // Signatures
  const startY = doc.y;
  doc.lineCap('butt').moveTo(50, startY).lineTo(200, startY).stroke();
  doc.text('Landlord Signature', 50, startY + 10);

  doc.lineCap('butt').moveTo(350, startY).lineTo(500, startY).stroke();
  doc.text('Tenant Signature', 350, startY + 10);

  doc.end();
};
