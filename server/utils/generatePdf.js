const PDFDocument = require('pdfkit');

function buildInvoice(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    /* =========================
       COLORS & CONSTANTS
    ========================= */
    const primary = '#0071ce';
    const textColor = '#333';
    const lightGray = '#f5f6f7';

    let currentY = 40;

    /* =========================
       HEADER
    ========================= */
    doc
      .fillColor(primary)
      .fontSize(26)
      .font('Helvetica-Bold')
      .text('WALMART CLONE', 40, currentY);

    doc
      .fillColor(textColor)
      .fontSize(10)
      .font('Helvetica')
      .text('123 Retail Ave', 400, currentY)
      .text('Bentonville, AR 72716', 400, currentY + 12);

    currentY += 40;

    doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#ccc');

    /* =========================
       TITLE
    ========================= */
    currentY += 15;

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor(textColor)
      .text('OFFICIAL RECEIPT', 40, currentY);

    currentY += 25;

    /* =========================
       LEFT: ORDER DETAILS
    ========================= */
    doc.fontSize(10).font('Helvetica');

    const leftX = 40;
    let leftY = currentY;

    const invoiceNo = `INV-2026-${order._id.toString().substring(0, 6).toUpperCase()}`;

    drawKeyValue(doc, leftX, leftY, 'Invoice #:', invoiceNo);
    leftY += 15;
    drawKeyValue(doc, leftX, leftY, 'Order ID:', order._id);
    leftY += 15;
    drawKeyValue(doc, leftX, leftY, 'Date:', new Date(order.createdAt).toLocaleDateString());
    leftY += 15;
    drawKeyValue(doc, leftX, leftY, 'Payment:', order.paymentMethod);
    leftY += 15;
    drawKeyValue(doc, leftX, leftY, 'Status:', 'Pending');

    /* =========================
       RIGHT: SHIPPING DETAILS
    ========================= */
    const rightX = 300;
    let rightY = currentY;

    drawKeyValue(doc, rightX, rightY, 'Shipping:', 'Standard Delivery');
    rightY += 15;
    drawKeyValue(doc, rightX, rightY, 'Estimated:', '3–5 Days');
    rightY += 15;
    drawKeyValue(doc, rightX, rightY, 'Shipping Cost:', 'Free');
    rightY += 15;

    rightY += 5;

    drawKeyValue(doc, rightX, rightY, 'GSTIN:', '29AAACDE12234F1XZ');
    rightY += 15;
    drawKeyValue(doc, rightX, rightY, 'Support:', 'support@walmartclone.com');
    rightY += 15;
    drawKeyValue(doc, rightX, rightY, 'Phone:', '+1 800-123-4567');

    /* =========================
       BILLING ADDRESS
    ========================= */
    currentY = Math.max(leftY, rightY) + 20;

    doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#ccc');

    currentY += 10;

    doc.font('Helvetica-Bold').text('Billed To:', 40, currentY);

    currentY += 15;

    doc
      .font('Helvetica')
      .text(order.shippingAddress.fullName, 40, currentY)
      .text(order.shippingAddress.addressLine, 40, currentY + 12)
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
        40,
        currentY + 24
      );

    currentY += 50;

    /* =========================
       TABLE HEADER
    ========================= */
    const tableTop = currentY;

    doc
      .rect(40, tableTop, 515, 20)
      .fill(lightGray)
      .fillColor('#000')
      .font('Helvetica-Bold');

    tableRow(doc, tableTop + 5, 'Item', 'Qty', 'Price', 'Total');

    currentY = tableTop + 25;

    /* =========================
       TABLE ROWS
    ========================= */
    doc.font('Helvetica');

    order.items.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.rect(40, currentY - 5, 515, 20).fill('#fafafa').fillColor('#000');
      }

      tableRow(
        doc,
        currentY,
        item.name.substring(0, 40),
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`
      );

      currentY += 20;
    });

    /* =========================
       TOTAL SECTION
    ========================= */
    currentY += 10;

    doc.moveTo(40, currentY).lineTo(555, currentY).stroke('#ccc');

    currentY += 10;

    const subtotal = order.totalPrice;
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;

    summaryRow(doc, currentY, 'Subtotal:', subtotal);
    currentY += 15;

    summaryRow(doc, currentY, 'Sales Tax (8.25%):', tax);
    currentY += 15;

    summaryRow(doc, currentY, 'Shipping:', 0);
    currentY += 20;

    // Highlight Grand Total
    doc.rect(350, currentY - 5, 205, 25).fill(lightGray);

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text('Grand Total:', 360, currentY)
      .text(`$${total.toFixed(2)}`, 450, currentY, { align: 'right' });

    /* =========================
       FOOTER
    ========================= */
    currentY += 50;

    doc
      .fontSize(9)
      .fillColor('#777')
      .text(
        'Thank you for shopping with Walmart Clone. This is a system-generated invoice.',
        40,
        currentY,
        { align: 'center', width: 515 }
      );

    doc.end();
  }); // end Promise
} // end buildInvoice

/* =========================
   HELPERS
========================= */
function drawKeyValue(doc, x, y, key, value) {
  doc.font('Helvetica-Bold').text(key, x, y);
  doc.font('Helvetica').text(value, x + 110, y);
}

function tableRow(doc, y, item, qty, price, total) {
  doc
    .fontSize(10)
    .text(item, 45, y, { width: 250 })
    .text(qty, 300, y, { width: 50, align: 'right' })
    .text(price, 380, y, { width: 70, align: 'right' })
    .text(total, 460, y, { width: 80, align: 'right' });
}

function summaryRow(doc, y, label, value) {
  doc
    .font('Helvetica')
    .text(label, 360, y)
    .text(value === 0 ? 'FREE' : `$${value.toFixed(2)}`, 450, y, {
      align: 'right',
    });
}

module.exports = { buildInvoice };