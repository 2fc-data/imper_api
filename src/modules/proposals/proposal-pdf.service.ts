import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { Proposal } from './entities/proposal.entity.js';
import type { Opportunity } from '../opportunities/entities/opportunity.entity.js';
import type { User } from '../users/entities/user.entity.js';

@Injectable()
export class ProposalPdfService {
  async generatePdf(
    proposal: Proposal,
    opportunity: Opportunity | null,
    createdBy: User | null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Header ──────────────────────────────────────────────
      doc
        .rect(50, 50, doc.page.width - 100, 60)
        .fill('#1a1a2e');

      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#ffffff')
        .text('Imper - Engenharia em Impermeabilização', 70, 65, { align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#cccccc')
        .text('CNPJ: XX.XXX.XXX/XXXX-XX', 70, 95, { align: 'center' });

      // ── Title ───────────────────────────────────────────────
      let y = 130;

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#1a1a2e')
        .text('PROPOSTA COMERCIAL', 50, y, { align: 'center' });

      y += 35;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#555555')
        .text(`Número: ${proposal.number}`, 50, y, { align: 'center' });

      y += 15;
      const createdDate = proposal.createdAt
        ? new Date(proposal.createdAt).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');
      doc.text(`Data: ${createdDate}`, 50, y, { align: 'center' });

      y += 15;
      const validUntil = proposal.validUntil
        ? new Date(proposal.validUntil).toLocaleDateString('pt-BR')
        : '-';
      doc.text(`Válido até: ${validUntil}`, 50, y, { align: 'center' });

      y += 30;
      this.drawSeparator(doc, y);
      y += 15;

      // ── CLIENT ──────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#1a1a2e')
        .text('CLIENTE', 50, y);

      y += 18;
      const clientName = opportunity?.title || '-';
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333333')
        .text(clientName, 50, y);

      y += 25;
      this.drawSeparator(doc, y);
      y += 15;

      // ── ESCOPO ──────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#1a1a2e')
        .text('ESCOPO DO SERVIÇO', 50, y);

      y += 18;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333333')
        .text(proposal.scope || '-', 50, y, {
          width: doc.page.width - 100,
          align: 'justify',
        });

      y = doc.y + 15;
      this.drawSeparator(doc, y);
      y += 15;

      // ── ITENS ───────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#1a1a2e')
        .text('ITENS', 50, y);

      y += 22;
      this.drawItemsTable(doc, proposal, y);

      y = doc.y + 5;

      // ── Totals ──────────────────────────────────────────────
      const totalsX = 350;
      const valuesX = 480;

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333333')
        .text('Subtotal:', totalsX, y);
      doc.text(this.formatCurrency(proposal.totalValue), valuesX, y, {
        align: 'right',
      });

      y += 16;
      if (proposal.discountPercent > 0) {
        doc.text(`Desconto (${proposal.discountPercent}%):`, totalsX, y);
        const discountValue =
          Number(proposal.totalValue) * (Number(proposal.discountPercent) / 100);
        doc.text(`-${this.formatCurrency(discountValue)}`, valuesX, y, {
          align: 'right',
        });
        y += 16;
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#1a1a2e')
        .text('TOTAL:', totalsX, y);
      doc.text(this.formatCurrency(proposal.finalValue), valuesX, y, {
        align: 'right',
      });

      y += 30;
      this.drawSeparator(doc, y);
      y += 15;

      // ── CONDIÇÕES ──────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#1a1a2e')
        .text('CONDIÇÕES', 50, y);

      y += 18;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333333')
        .text(proposal.terms || '-', 50, y, {
          width: doc.page.width - 100,
          align: 'justify',
        });

      y = doc.y + 15;
      this.drawSeparator(doc, y);
      y += 15;

      // ── ASSINATURA ──────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#1a1a2e')
        .text('ASSINATURA', 50, y);

      y += 20;
      // Signature line
      doc
        .moveTo(50, y + 30)
        .lineTo(250, y + 30)
        .lineWidth(1)
        .stroke('#333333');

      y += 38;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333333')
        .text(
          `Assinado por: ${proposal.signedBy || '-'}`,
          50,
          y,
        );

      y += 15;
      doc.text(
        `Documento: ${proposal.signedDocument || '-'}`,
        50,
        y,
      );

      y += 15;
      const signedAt = proposal.signedAt
        ? new Date(proposal.signedAt).toLocaleDateString('pt-BR')
        : '-';
      doc.text(`Data: ${signedAt}`, 50, y);

      y += 30;
      this.drawSeparator(doc, y);
      y += 15;

      // ── Footer ──────────────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#999999')
        .text(
          `Gerado por Imper - Engenharia em Impermeabilização em ${new Date().toLocaleDateString('pt-BR')}`,
          50,
          y,
          { align: 'center', width: doc.page.width - 100 },
        );

      doc.end();
    });
  }

  private drawSeparator(doc: PDFKit.PDFDocument, y: number): void {
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .lineWidth(0.5)
      .stroke('#cccccc');
  }

  private drawItemsTable(
    doc: PDFKit.PDFDocument,
    proposal: Proposal,
    startY: number,
  ): void {
    const tableLeft = 50;
    const tableWidth = doc.page.width - 100;
    const colWidths = [30, 230, 50, 70, 80]; // #, Desc, Qtd, Unit, Total
    const headers = ['#', 'Descrição', 'Qtd', 'Unit.', 'Total'];
    const rowHeight = 20;

    let y = startY;

    // Header row
    doc
      .rect(tableLeft, y, tableWidth, rowHeight)
      .fill('#1a1a2e');

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff');

    let x = tableLeft;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x + 5, y + 5, {
        width: colWidths[i] - 10,
        align: i === 0 ? 'center' : i >= 2 ? 'right' : 'left',
      });
      x += colWidths[i];
    }

    y += rowHeight;

    // Data rows
    const items = proposal.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const bgColor = i % 2 === 0 ? '#f8f8f8' : '#ffffff';

      doc
        .rect(tableLeft, y, tableWidth, rowHeight)
        .fill(bgColor);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#333333');

      x = tableLeft;
      const rowData = [
        String(i + 1),
        item.description || '',
        String(item.quantity),
        this.formatCurrency(item.unitPrice),
        this.formatCurrency(item.total),
      ];

      for (let j = 0; j < rowData.length; j++) {
        doc.text(rowData[j], x + 5, y + 5, {
          width: colWidths[j] - 10,
          align: j === 0 ? 'center' : j >= 2 ? 'right' : 'left',
          lineBreak: false,
        });
        x += colWidths[j];
      }

      y += rowHeight;
    }

    // Bottom border
    doc
      .moveTo(tableLeft, y)
      .lineTo(tableLeft + tableWidth, y)
      .lineWidth(0.5)
      .stroke('#cccccc');

    // Update doc.y to position after table
    (doc as any).y = y;
  }

  private formatCurrency(value: number | string | undefined | null): string {
    const num = Number(value) || 0;
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
