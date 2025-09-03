import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DENTAL_CONDITIONS, TOOTH_NUMBERS } from '../data/dentalConditions';

export const exportDentalChartToPDF = async (toothConditions, patientId = null) => {
  try {
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('ЗУБНАЯ ФОРМУЛА', pageWidth / 2, 25, { align: 'center' });
    
    if (patientId) {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Пациент ID: ${patientId}`, pageWidth / 2, 35, { align: 'center' });
    }

    // Add date
    const currentDate = new Date().toLocaleDateString('ru-RU');
    pdf.setFontSize(10);
    pdf.text(`Дата: ${currentDate}`, pageWidth - 15, 15, { align: 'right' });

    // Try to capture the dental chart SVG first
    const dentalChartElement = document.querySelector('[data-dental-chart]');
    
    if (dentalChartElement) {
      try {
        // Capture the dental chart as canvas
        const canvas = await html2canvas(dentalChartElement, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          width: dentalChartElement.scrollWidth,
          height: dentalChartElement.scrollHeight,
          backgroundColor: '#ffffff'
        });

        // Calculate dimensions to fit the chart nicely
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the chart image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 45, imgWidth, Math.min(imgHeight, 120));
        
        // Position legend below the chart
        let yPosition = Math.min(imgHeight + 55, 175);
        
        // Add legend
        addLegend(pdf, toothConditions, yPosition);
        
      } catch (canvasError) {
        console.warn('Failed to capture dental chart, using text-based export:', canvasError);
        // Fallback to text-based export
        addTextBasedChart(pdf, toothConditions, 50);
      }
    } else {
      // Fallback to text-based export if chart element not found
      addTextBasedChart(pdf, toothConditions, 50);
    }

    // Save the PDF
    const fileName = `dental-chart-${patientId || 'patient'}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting dental chart to PDF:', error);
    throw error;
  }
};

const addLegend = (pdf, toothConditions, startY) => {
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Легенда состояний:', 15, startY);

  // Get unique conditions from the chart
  const usedConditions = new Set();
  Object.values(toothConditions).forEach(tooth => {
    Object.values(tooth).forEach(condition => {
      if (condition && DENTAL_CONDITIONS[condition]) {
        usedConditions.add(condition);
      }
    });
  });

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  
  let yPos = startY + 10;
  let xPos = 15;
  const colWidth = 90;
  
  Array.from(usedConditions).forEach((conditionKey, index) => {
    const condition = DENTAL_CONDITIONS[conditionKey];
    
    // Add color box
    pdf.setFillColor(condition.color);
    pdf.rect(xPos, yPos - 3, 4, 4, 'F');
    
    // Add condition label
    pdf.text(condition.label, xPos + 8, yPos);
    
    // Move to next position
    if ((index + 1) % 2 === 0) {
      yPos += 8;
      xPos = 15;
    } else {
      xPos += colWidth;
    }
  });
};

const addTextBasedChart = (pdf, toothConditions, startY) => {
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Состояние зубов:', 15, startY);

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');

  let yPos = startY + 15;
  
  // Upper jaw
  pdf.setFont(undefined, 'bold');
  pdf.text('Верхняя челюсть:', 15, yPos);
  yPos += 8;
  
  pdf.setFont(undefined, 'normal');
  TOOTH_NUMBERS.upper.forEach(toothNumber => {
    if (toothConditions[toothNumber]) {
      const conditions = Object.entries(toothConditions[toothNumber])
        .filter(([_, condition]) => condition && DENTAL_CONDITIONS[condition])
        .map(([surface, condition]) => `${surface}: ${DENTAL_CONDITIONS[condition].label}`)
        .join(', ');
      
      if (conditions) {
        pdf.text(`Зуб ${toothNumber}: ${conditions}`, 20, yPos);
        yPos += 6;
      }
    }
  });

  yPos += 5;
  
  // Lower jaw
  pdf.setFont(undefined, 'bold');
  pdf.text('Нижняя челюсть:', 15, yPos);
  yPos += 8;
  
  pdf.setFont(undefined, 'normal');
  TOOTH_NUMBERS.lower.forEach(toothNumber => {
    if (toothConditions[toothNumber]) {
      const conditions = Object.entries(toothConditions[toothNumber])
        .filter(([_, condition]) => condition && DENTAL_CONDITIONS[condition])
        .map(([surface, condition]) => `${surface}: ${DENTAL_CONDITIONS[condition].label}`)
        .join(', ');
      
      if (conditions) {
        pdf.text(`Зуб ${toothNumber}: ${conditions}`, 20, yPos);
        yPos += 6;
      }
    }
  });
};