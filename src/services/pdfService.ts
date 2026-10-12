import { jsPDF } from 'jspdf';
import { Order } from '../types';

/**
 * Formats numbers into Colombian Peso currency string
 */
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-CO')}`;
}

/**
 * Generates and downloads a clean, artisan-styled PDF invoice for a customer order.
 */
export async function generateArtisanInvoicePDF(order: Order): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // --- Background subtle header banner ---
  doc.setFillColor(250, 240, 255); // #faf0ff
  doc.rect(margin, margin, contentWidth, 36, 'F');

  // Decorative border around top banner
  doc.setDrawColor(222, 183, 255); // #deb7ff
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, margin, contentWidth, 36, 4, 4, 'D');

  // Top header text
  doc.setTextColor(97, 0, 164); // #6100a4 (Deep brand purple)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MARAÑA AMIGURUMIS & CROCHET', margin + 6, margin + 11);

  doc.setTextColor(123, 44, 191); // #7b2cbf
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Taller Artesanal de Tejido Creativo · Neiva, Huila, Colombia', margin + 6, margin + 17);
  doc.setFontSize(8.5);
  doc.setTextColor(100, 85, 115);
  doc.text('WhatsApp: +57 318 692 8410 · Instagram: @marana.crochet · NIT Simplificado', margin + 6, margin + 22);

  // Badge on the top right
  doc.setFillColor(123, 44, 191);
  doc.roundedRect(pageWidth - margin - 58, margin + 6, 52, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FACTURA ARTESANAL', pageWidth - margin - 32, margin + 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`#${order.id}`, pageWidth - margin - 32, margin + 18, { align: 'center' });
  doc.setFontSize(7);
  doc.text(order.date, pageWidth - margin - 32, margin + 24, { align: 'center' });

  let y = margin + 44;

  // --- Section 1: Customer & Shipping Information ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 215, 245);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'D');

  // Header band for customer info
  doc.setFillColor(246, 233, 255); // #f6e9ff
  doc.roundedRect(margin, y, contentWidth, 7, 3, 3, 'F');
  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DATOS DE LA CLIENTA Y DESTINO DEL ENVÍO', margin + 4, y + 5);

  y += 12;
  doc.setFontSize(8.5);
  doc.setTextColor(60, 50, 70);

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.text('Clienta:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName || 'Cliente General', margin + 20, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerPhone || 'Registrado en WhatsApp', margin + 20, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Estado:', margin + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 124, 58); // Green
  doc.text(order.statusLabel || 'En proceso', margin + 20, y + 12);

  // Column 2
  doc.setTextColor(60, 50, 70);
  const col2X = margin + (contentWidth / 2);
  doc.setFont('helvetica', 'bold');
  doc.text('Ciudad/Zona:', col2X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerLocation || 'Neiva, Huila', col2X + 24, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', col2X, y + 6);
  doc.setFont('helvetica', 'normal');
  const shortAddress = order.customerAddress
    ? order.customerAddress.length > 40
      ? order.customerAddress.substring(0, 38) + '...'
      : order.customerAddress
    : 'Entrega acordada';
  doc.text(shortAddress, col2X + 24, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Transporte:', col2X, y + 12);
  doc.setFont('helvetica', 'normal');
  const carrierInfo = `${order.carrier}${order.trackingNumber ? ` (Guía #${order.trackingNumber})` : ''}`;
  const shortCarrier = carrierInfo.length > 40 ? carrierInfo.substring(0, 38) + '...' : carrierInfo;
  doc.text(shortCarrier, col2X + 24, y + 12);

  y += 28;

  // --- Section 2: Items Table ---
  // Table Header
  doc.setFillColor(123, 44, 191); // #7b2cbf
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DESCRIPCIÓN DEL AMIGURUMI / PIEZA ARTESANAL', margin + 4, y + 5.5);
  doc.text('CANT.', margin + 115, y + 5.5, { align: 'center' });
  doc.text('VR. UNITARIO', margin + 145, y + 5.5, { align: 'right' });
  doc.text('TOTAL', margin + contentWidth - 4, y + 5.5, { align: 'right' });

  y += 8;

  let subtotal = 0;

  // Table Rows
  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // Alternate background row
    if (index % 2 === 1) {
      doc.setFillColor(252, 248, 255);
      doc.rect(margin, y, contentWidth, 12, 'F');
    }

    // Border line under row
    doc.setDrawColor(240, 225, 250);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 12, margin + contentWidth, y + 12);

    doc.setTextColor(33, 22, 48);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(item.name, margin + 4, y + 5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.2);
    doc.setTextColor(110, 95, 125);
    const specText = item.specs || '100% Algodón mercerizado · Relleno siliconado hipoalergénico';
    doc.text(specText, margin + 4, y + 9.5);

    doc.setTextColor(40, 30, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(String(item.quantity), margin + 115, y + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(item.price), margin + 145, y + 6.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(97, 0, 164);
    doc.text(formatCurrency(itemTotal), margin + contentWidth - 4, y + 6.5, { align: 'right' });

    y += 12;
  });

  // Section 3: Summary Totals & Special Notes
  y += 4;
  const summaryBoxWidth = 75;
  const summaryBoxX = margin + contentWidth - summaryBoxWidth;
  const notesWidth = contentWidth - summaryBoxWidth - 8;

  // Notes box on the left
  doc.setFillColor(250, 243, 255);
  doc.setDrawColor(222, 183, 255);
  doc.roundedRect(margin, y, notesWidth, 38, 3, 3, 'FD');

  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('NOTA ARTESANAL Y DEDICATORIA:', margin + 4, y + 6);

  doc.setTextColor(70, 55, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const noteLines = order.specialNote
    ? doc.splitTextToSize(order.specialNote, notesWidth - 8)
    : doc.splitTextToSize(
        'Elaborado con amor en Neiva por Maraña Crochet. Cada puntada lleva dedicación y magia para alegrar tu hogar.',
        notesWidth - 8
      );
  doc.text(noteLines, margin + 4, y + 12);

  doc.setTextColor(123, 44, 191);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('✓ Comprobante verificado por la artesana', margin + 4, y + 33);

  // Totals box on the right
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 183, 255);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, 38, 3, 3, 'D');

  doc.setTextColor(70, 55, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const shipping = order.shippingCost || 0;
  const total = subtotal + shipping;

  doc.text('Subtotal Amigurumis:', summaryBoxX + 4, y + 8);
  doc.text(formatCurrency(subtotal), summaryBoxX + summaryBoxWidth - 4, y + 8, { align: 'right' });

  doc.text('Envío Especial:', summaryBoxX + 4, y + 15);
  doc.text(shipping > 0 ? formatCurrency(shipping) : 'Incluido', summaryBoxX + summaryBoxWidth - 4, y + 15, {
    align: 'right',
  });

  doc.setDrawColor(222, 183, 255);
  doc.line(summaryBoxX + 4, y + 20, summaryBoxX + summaryBoxWidth - 4, y + 20);

  doc.setFillColor(246, 233, 255);
  doc.roundedRect(summaryBoxX + 2, y + 22, summaryBoxWidth - 4, 13, 2, 2, 'F');

  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TOTAL PAGADO:', summaryBoxX + 5, y + 30);
  doc.setFontSize(11);
  doc.text(formatCurrency(total), summaryBoxX + summaryBoxWidth - 5, y + 30, { align: 'right' });

  y += 46;

  // --- Section 4: Care Guide for Handcrafted Amigurumis ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(215, 195, 235);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'D');

  doc.setFillColor(246, 233, 255);
  doc.roundedRect(margin, y, contentWidth, 6.5, 3, 3, 'F');
  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('GUÍA Y CUIDADOS ESPECIALES DE TU AMIGURUMI (100% HECHO A MANO)', margin + 4, y + 4.8);

  y += 11;
  doc.setTextColor(60, 50, 70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);

  const tips = [
    '• Lavar a mano únicamente con agua fría y jabón líquido suave o champú para prendas delicadas.',
    '• No retorcer ni exprimir con fuerza para proteger la forma del tejido y el relleno siliconado.',
    '• Secar de forma horizontal a la sombra sobre una toalla limpia. No usar secadora ni plancha.',
    '• Ojos y piezas ensambladas con costura reforzada y trabas de seguridad de estándar infantil.',
  ];

  tips.forEach((tip, idx) => {
    doc.text(tip, margin + 4, y + idx * 5.2);
  });

  y += 28;

  // --- Footer / Signature & Legal Artisan Note ---
  doc.setDrawColor(222, 183, 255);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;
  doc.setTextColor(120, 100, 135);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.2);
  doc.text(
    'Maraña Crochet · Documento artesanal equivalente a cuenta de cobro y garantía de elaboración manual. Neiva, Huila.',
    margin,
    y
  );
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    margin + contentWidth,
    y,
    { align: 'right' }
  );

  // Trigger download with clear descriptive filename
  const filename = `Factura_Artesanal_Marana_${order.id}.pdf`;
  doc.save(filename);
}

/**
 * Returns a data URI of the PDF for live in-app preview
 */
export async function generateArtisanInvoiceDataUrl(order: Order): Promise<string> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Banner
  doc.setFillColor(250, 240, 255);
  doc.rect(margin, margin, contentWidth, 36, 'F');
  doc.setDrawColor(222, 183, 255);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, margin, contentWidth, 36, 4, 4, 'D');

  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MARAÑA AMIGURUMIS & CROCHET', margin + 6, margin + 11);

  doc.setTextColor(123, 44, 191);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Taller Artesanal de Tejido Creativo · Neiva, Huila, Colombia', margin + 6, margin + 17);
  doc.setFontSize(8.5);
  doc.setTextColor(100, 85, 115);
  doc.text('WhatsApp: +57 318 692 8410 · Instagram: @marana.crochet · NIT Simplificado', margin + 6, margin + 22);

  // Badge
  doc.setFillColor(123, 44, 191);
  doc.roundedRect(pageWidth - margin - 58, margin + 6, 52, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FACTURA ARTESANAL', pageWidth - margin - 32, margin + 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`#${order.id}`, pageWidth - margin - 32, margin + 18, { align: 'center' });
  doc.setFontSize(7);
  doc.text(order.date, pageWidth - margin - 32, margin + 24, { align: 'center' });

  let y = margin + 44;

  // Customer info
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 215, 245);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'D');

  doc.setFillColor(246, 233, 255);
  doc.roundedRect(margin, y, contentWidth, 7, 3, 3, 'F');
  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DATOS DE LA CLIENTA Y DESTINO DEL ENVÍO', margin + 4, y + 5);

  y += 12;
  doc.setFontSize(8.5);
  doc.setTextColor(60, 50, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Clienta:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerName || 'Cliente General', margin + 20, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerPhone || 'Registrado en WhatsApp', margin + 20, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Estado:', margin + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 124, 58);
  doc.text(order.statusLabel || 'En proceso', margin + 20, y + 12);

  const col2X = margin + (contentWidth / 2);
  doc.setTextColor(60, 50, 70);
  doc.setFont('helvetica', 'bold');
  doc.text('Ciudad/Zona:', col2X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerLocation || 'Neiva, Huila', col2X + 24, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', col2X, y + 6);
  doc.setFont('helvetica', 'normal');
  const shortAddress = order.customerAddress
    ? order.customerAddress.length > 40
      ? order.customerAddress.substring(0, 38) + '...'
      : order.customerAddress
    : 'Entrega acordada';
  doc.text(shortAddress, col2X + 24, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Transporte:', col2X, y + 12);
  doc.setFont('helvetica', 'normal');
  const carrierInfo = `${order.carrier}${order.trackingNumber ? ` (Guía #${order.trackingNumber})` : ''}`;
  const shortCarrier = carrierInfo.length > 40 ? carrierInfo.substring(0, 38) + '...' : carrierInfo;
  doc.text(shortCarrier, col2X + 24, y + 12);

  y += 28;

  // Items table
  doc.setFillColor(123, 44, 191);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DESCRIPCIÓN DEL AMIGURUMI / PIEZA ARTESANAL', margin + 4, y + 5.5);
  doc.text('CANT.', margin + 115, y + 5.5, { align: 'center' });
  doc.text('VR. UNITARIO', margin + 145, y + 5.5, { align: 'right' });
  doc.text('TOTAL', margin + contentWidth - 4, y + 5.5, { align: 'right' });

  y += 8;
  let subtotal = 0;

  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    if (index % 2 === 1) {
      doc.setFillColor(252, 248, 255);
      doc.rect(margin, y, contentWidth, 12, 'F');
    }

    doc.setDrawColor(240, 225, 250);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 12, margin + contentWidth, y + 12);

    doc.setTextColor(33, 22, 48);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(item.name, margin + 4, y + 5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.2);
    doc.setTextColor(110, 95, 125);
    const specText = item.specs || '100% Algodón mercerizado · Relleno siliconado hipoalergénico';
    doc.text(specText, margin + 4, y + 9.5);

    doc.setTextColor(40, 30, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(String(item.quantity), margin + 115, y + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(item.price), margin + 145, y + 6.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(97, 0, 164);
    doc.text(formatCurrency(itemTotal), margin + contentWidth - 4, y + 6.5, { align: 'right' });

    y += 12;
  });

  y += 4;
  const summaryBoxWidth = 75;
  const summaryBoxX = margin + contentWidth - summaryBoxWidth;
  const notesWidth = contentWidth - summaryBoxWidth - 8;

  doc.setFillColor(250, 243, 255);
  doc.setDrawColor(222, 183, 255);
  doc.roundedRect(margin, y, notesWidth, 38, 3, 3, 'FD');

  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('NOTA ARTESANAL Y DEDICATORIA:', margin + 4, y + 6);

  doc.setTextColor(70, 55, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const noteLines = order.specialNote
    ? doc.splitTextToSize(order.specialNote, notesWidth - 8)
    : doc.splitTextToSize(
        'Elaborado con amor en Neiva por Maraña Crochet. Cada puntada lleva dedicación y magia para alegrar tu hogar.',
        notesWidth - 8
      );
  doc.text(noteLines, margin + 4, y + 12);

  doc.setTextColor(123, 44, 191);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('✓ Comprobante verificado por la artesana', margin + 4, y + 33);

  // Totals
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 183, 255);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, 38, 3, 3, 'D');

  const shipping = order.shippingCost || 0;
  const total = subtotal + shipping;

  doc.setTextColor(70, 55, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Subtotal Amigurumis:', summaryBoxX + 4, y + 8);
  doc.text(formatCurrency(subtotal), summaryBoxX + summaryBoxWidth - 4, y + 8, { align: 'right' });

  doc.text('Envío Especial:', summaryBoxX + 4, y + 15);
  doc.text(shipping > 0 ? formatCurrency(shipping) : 'Incluido', summaryBoxX + summaryBoxWidth - 4, y + 15, {
    align: 'right',
  });

  doc.setDrawColor(222, 183, 255);
  doc.line(summaryBoxX + 4, y + 20, summaryBoxX + summaryBoxWidth - 4, y + 20);

  doc.setFillColor(246, 233, 255);
  doc.roundedRect(summaryBoxX + 2, y + 22, summaryBoxWidth - 4, 13, 2, 2, 'F');

  doc.setTextColor(97, 0, 164);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TOTAL PAGADO:', summaryBoxX + 5, y + 30);
  doc.setFontSize(11);
  doc.text(formatCurrency(total), summaryBoxX + summaryBoxWidth - 5, y + 30, { align: 'right' });

  return doc.output('datauristring');
}
