const PDFDocument = require('pdfkit');

function buildInvoice(order, res) {
  const doc = new PDFDocument({ margin: 50 });

  // Stream the output directly back to the Express response
  doc.pipe(res);

  // 1. Draw Company Header
  doc
    .fillColor('#0071ce')
    .fontSize(28)
    .text('WALMART CLONE', 50, 45)
    .fillColor('#333333')
    .fontSize(10)
    .text('123 Retail Ave', 200, 50, { align: 'right' })
    .text('Bentonville, AR 72716', 200, 65, { align: 'right' })
    .moveDown();

  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 90).lineTo(550, 90).stroke();

  // 2. Draw Customer Details
  doc
    .fontSize(20)
    .fillColor('#333333')
    .text('OFFICIAL RECEIPT', 50, 110)
    .fontSize(10)
    .text(`Order ID: ${order._id}`, 50, 140)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 155)
    .text(`Payment Method: ${order.paymentMethod}`, 50, 170)

    .text('Billed To:', 300, 140)
    .font('Helvetica-Bold')
    .text(order.shippingAddress.fullName, 300, 155)
    .font('Helvetica')
    .text(order.shippingAddress.addressLine, 300, 170)
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 300, 185);

  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 210).lineTo(550, 210).stroke();

  // 3. Draw Item Table Headers
  let invoiceTableTop = 240;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item Description',
    'Qty',
    'Unit Price',
    'Line Total'
  );

  doc.strokeColor('#dddddd').lineWidth(1).moveTo(50, invoiceTableTop + 20).lineTo(550, invoiceTableTop + 20).stroke();
  doc.font('Helvetica');

  // 4. Draw Rows dynamically
  let i = 0;
  for (i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name.substring(0, 45) + (item.name.length > 45 ? '...' : ''),
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    );
  }

  // 5. Calculate Subtotals (Assume 0 tax/shipping for clone logic)
  const subtotalPosition = invoiceTableTop + (i + 1) * 30 + 20;

  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, subtotalPosition - 10).lineTo(550, subtotalPosition - 10).stroke();
  doc.font('Helvetica-Bold');
  generateTableRow(doc, subtotalPosition, '', '', 'Grand Total:', `$${order.totalPrice.toFixed(2)}`);

  // 6. Draw Footer
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#888888')
    .text('Thank you for your business. For return policy inquiries, please visit Walmart Clone Support.', 50, 700, { align: 'center' });

  // Finalize PDF rendering (This closes the stream, triggering browser download)
  doc.end();
}

function generateTableRow(doc, y, item, qty, unit, total) {
  doc
    .fontSize(10)
    .text(item, 50, y, { width: 250 })
    .text(qty, 300, y, { width: 50, align: 'right' })
    .text(unit, 400, y, { width: 70, align: 'right' })
    .text(total, 480, y, { width: 70, align: 'right' });
}

module.exports = { buildInvoice };
