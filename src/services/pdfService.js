import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

class PDFService {
  // Generate PDF from HTML element
  async generatePDFFromElement(elementId, filename) {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Element not found')
      }

      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      // Get canvas dimensions
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      let position = 0

      // Add image to PDF
      pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save PDF
      pdf.save(filename)
      
      return { success: true, message: 'PDF generated successfully' }
    } catch (error) {
      console.error('PDF generation error:', error)
      return { success: false, error: error.message }
    }
  }

  // Generate Invoice PDF
  async generateInvoicePDF(invoice) {
    const filename = `Invoice-${invoice.invoiceNumber}.pdf`
    return await this.generatePDFFromElement('invoice-content', filename)
  }

  // Generate Quote PDF
  async generateQuotePDF(quote) {
    const filename = `Quote-${quote.quoteNumber}.pdf`
    return await this.generatePDFFromElement('quote-content', filename)
  }

  // Generate simple PDF with custom content
  generateSimplePDF(content, filename) {
    try {
      const pdf = new jsPDF()
      
      // Set font
      pdf.setFont('helvetica')
      
      // Add content
      let yPosition = 20
      const lineHeight = 7
      const pageHeight = 280
      
      // Split content into lines
      const lines = pdf.splitTextToSize(content, 180)
      
      lines.forEach((line) => {
        if (yPosition > pageHeight) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(line, 20, yPosition)
        yPosition += lineHeight
      })
      
      // Save PDF
      pdf.save(filename)
      
      return { success: true, message: 'PDF generated successfully' }
    } catch (error) {
      console.error('Simple PDF generation error:', error)
      return { success: false, error: error.message }
    }
  }

  // Generate Invoice PDF with custom formatting
  generateInvoicePDFCustom(invoice) {
    try {
      const pdf = new jsPDF()
      
      // Set font
      pdf.setFont('helvetica')
      
      // Header
      pdf.setFontSize(20)
      pdf.text('INVOICE', 20, 30)
      
      pdf.setFontSize(12)
      pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40)
      pdf.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 20, 47)
      pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 54)
      
      // Client info
      pdf.text('Bill To:', 20, 70)
      pdf.text(`${invoice.client.firstName} ${invoice.client.lastName}`, 20, 77)
      pdf.text(invoice.client.email, 20, 84)
      
      if (invoice.company) {
        pdf.text(invoice.company.name, 20, 91)
      }
      
      // Items table header
      let yPos = 110
      pdf.setFontSize(10)
      pdf.text('Description', 20, yPos)
      pdf.text('Qty', 120, yPos)
      pdf.text('Price', 140, yPos)
      pdf.text('Total', 170, yPos)
      
      // Draw line
      pdf.line(20, yPos + 2, 190, yPos + 2)
      
      // Items
      yPos += 10
      invoice.items.forEach((item) => {
        pdf.text(item.description, 20, yPos)
        pdf.text(item.quantity.toString(), 120, yPos)
        pdf.text(`$${item.unitPrice.toFixed(2)}`, 140, yPos)
        pdf.text(`$${item.total.toFixed(2)}`, 170, yPos)
        yPos += 7
      })
      
      // Totals
      yPos += 10
      pdf.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, yPos)
      yPos += 7
      
      if (invoice.taxRate > 0) {
        pdf.text(`Tax (${invoice.taxRate}%): $${invoice.taxAmount.toFixed(2)}`, 140, yPos)
        yPos += 7
      }
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total: $${invoice.totalAmount.toFixed(2)}`, 140, yPos)
      
      // Notes
      if (invoice.notes) {
        yPos += 20
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.text('Notes:', 20, yPos)
        yPos += 7
        const notes = pdf.splitTextToSize(invoice.notes, 170)
        notes.forEach((line) => {
          pdf.text(line, 20, yPos)
          yPos += 5
        })
      }
      
      // Save PDF
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`)
      
      return { success: true, message: 'Invoice PDF generated successfully' }
    } catch (error) {
      console.error('Invoice PDF generation error:', error)
      return { success: false, error: error.message }
    }
  }

  // Generate Quote PDF with custom formatting
  generateQuotePDFCustom(quote) {
    try {
      const pdf = new jsPDF()
      
      // Set font
      pdf.setFont('helvetica')
      
      // Header
      pdf.setFontSize(20)
      pdf.text('QUOTE', 20, 30)
      
      pdf.setFontSize(12)
      pdf.text(`Quote #: ${quote.quoteNumber}`, 20, 40)
      pdf.text(`Date: ${new Date(quote.issueDate).toLocaleDateString()}`, 20, 47)
      pdf.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 20, 54)
      
      // Client info
      pdf.text('Quote To:', 20, 70)
      pdf.text(`${quote.client.firstName} ${quote.client.lastName}`, 20, 77)
      pdf.text(quote.client.email, 20, 84)
      
      if (quote.company) {
        pdf.text(quote.company.name, 20, 91)
      }
      
      // Items table header
      let yPos = 110
      pdf.setFontSize(10)
      pdf.text('Description', 20, yPos)
      pdf.text('Qty', 120, yPos)
      pdf.text('Price', 140, yPos)
      pdf.text('Total', 170, yPos)
      
      // Draw line
      pdf.line(20, yPos + 2, 190, yPos + 2)
      
      // Items
      yPos += 10
      quote.items.forEach((item) => {
        pdf.text(item.description, 20, yPos)
        pdf.text(item.quantity.toString(), 120, yPos)
        pdf.text(`$${item.unitPrice.toFixed(2)}`, 140, yPos)
        pdf.text(`$${item.total.toFixed(2)}`, 170, yPos)
        yPos += 7
      })
      
      // Totals
      yPos += 10
      pdf.text(`Subtotal: $${quote.subtotal.toFixed(2)}`, 140, yPos)
      yPos += 7
      
      if (quote.discountAmount > 0) {
        pdf.text(`Discount: -$${quote.discountAmount.toFixed(2)}`, 140, yPos)
        yPos += 7
      }
      
      if (quote.taxRate > 0) {
        pdf.text(`Tax (${quote.taxRate}%): $${quote.taxAmount.toFixed(2)}`, 140, yPos)
        yPos += 7
      }
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total: $${quote.totalAmount.toFixed(2)}`, 140, yPos)
      
      // Notes
      if (quote.notes) {
        yPos += 20
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        pdf.text('Notes:', 20, yPos)
        yPos += 7
        const notes = pdf.splitTextToSize(quote.notes, 170)
        notes.forEach((line) => {
          pdf.text(line, 20, yPos)
          yPos += 5
        })
      }
      
      // Terms
      if (quote.terms) {
        yPos += 10
        pdf.text('Terms & Conditions:', 20, yPos)
        yPos += 7
        const terms = pdf.splitTextToSize(quote.terms, 170)
        terms.forEach((line) => {
          pdf.text(line, 20, yPos)
          yPos += 5
        })
      }
      
      // Save PDF
      pdf.save(`Quote-${quote.quoteNumber}.pdf`)
      
      return { success: true, message: 'Quote PDF generated successfully' }
    } catch (error) {
      console.error('Quote PDF generation error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
const pdfService = new PDFService()
export default pdfService
