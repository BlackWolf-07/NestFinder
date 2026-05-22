const PDFDocument = require('pdfkit');

/**
 * Generates a rental agreement PDF
 * @param {Object} data - { tenantName, ownerName, propertyTitle, address, rentAmount, date }
 * @returns {Promise<Buffer>}
 */
const generateAgreement = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Header
    doc
      .fontSize(25)
      .text('RENTAL AGREEMENT', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Date: ${data.date || new Date().toLocaleDateString()}`, { align: 'right' })
      .moveDown();

    // Parties
    doc
      .fontSize(14)
      .text('BETWEEN:', { underline: true })
      .fontSize(12)
      .text(`OWNER: ${data.ownerName}`)
      .moveDown(0.5)
      .fontSize(14)
      .text('AND:', { underline: true })
      .fontSize(12)
      .text(`TENANT: ${data.tenantName}`)
      .moveDown();

    // Property Details
    doc
      .fontSize(14)
      .text('PROPERTY DETAILS:', { underline: true })
      .fontSize(12)
      .text(`Property: ${data.propertyTitle}`)
      .text(`Address: ${data.address}`)
      .moveDown();

    // Terms
    doc
      .fontSize(14)
      .text('TERMS AND CONDITIONS:', { underline: true })
      .fontSize(12)
      .text(`1. The monthly rent for the premises shall be ${data.rentAmount}.`)
      .text('2. The tenant shall pay the rent on or before the 5th of every month.')
      .text('3. This agreement is valid for 11 months from the date of signing.')
      .text('4. The tenant shall not make any structural changes to the property.')
      .moveDown();

    // Signatures
    doc.moveDown(4);
    
    const startY = doc.y;
    doc.text('__________________________', 50, startY);
    doc.text('Owner Signature', 50, startY + 15);

    doc.text('__________________________', 350, startY);
    doc.text('Tenant Signature', 350, startY + 15);

    doc.end();
  });
};

module.exports = { generateAgreement };
