const fs = require('fs');
const { buildInvoice } = require('./utils/generatePdf');

async function testPdfGeneration() {
  try {
    const mockOrder = {
      _id: '64d3b5c4f1a2b3c4d5e6f7g8',
      createdAt: new Date(),
      paymentMethod: 'Credit Card',
      shippingAddress: {
        fullName: 'John Doe',
        addressLine: '123 Test Street',
        city: 'Metropolis',
        state: 'NY',
        zipCode: '10001'
      },
      items: [
        { name: 'Test Product 1', quantity: 2, price: 15.50 },
        { name: 'Test Product 2', quantity: 1, price: 45.00 }
      ],
      subtotal: 76.00,
      gstAmount: 13.68,
      totalPrice: 89.68
    };

    console.log('Generating PDF invoice...');
    const pdfBuffer = await buildInvoice(mockOrder);
    
    const filePath = './test-invoice.pdf';
    fs.writeFileSync(filePath, pdfBuffer);
    
    console.log(`✅ PDF successfully generated and saved to: ${filePath}`);
    console.log(`Open the file to verify the layout and details.`);
  } catch (err) {
    console.error('❌ Failed to generate PDF:', err);
  }
}

testPdfGeneration();
