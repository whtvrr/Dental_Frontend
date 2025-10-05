import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DENTAL_CONDITIONS, TOOTH_NUMBERS } from '../data/dentalConditions';

// Complete Russian to ASCII transliteration map
const transliterate = (text) => {
  if (!text) return '';

  const ruToLat = {
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  return text.replace(/[А-Яа-яЁё]/g, function(match) {
    return ruToLat[match] || match;
  });
};

// Helper function to add ASCII text safely
const addText = (pdf, text, x, y, options = {}) => {
  if (!text) return;

  // Convert to ASCII
  const asciiText = transliterate(String(text));

  if (options.align === 'center') {
    pdf.text(asciiText, x, y, { align: 'center' });
  } else if (options.align === 'right') {
    pdf.text(asciiText, x, y, { align: 'right' });
  } else {
    pdf.text(asciiText, x, y);
  }
};

export const exportDentalChartToPDF = async (toothConditions, patientId = null) => {
  try {
    // Create PDF document with standard settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Use standard font that works reliably
    pdf.setFont('helvetica', 'normal');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    addText(pdf, 'DENTAL CHART - ZUBNAYA FORMULA', pageWidth / 2, 25, { align: 'center' });

    if (patientId) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      addText(pdf, `Patient ID: ${patientId}`, pageWidth / 2, 35, { align: 'center' });
    }

    // Add date
    const currentDate = new Date().toLocaleDateString('en-US');
    pdf.setFontSize(9);
    addText(pdf, `Date: ${currentDate}`, pageWidth - 15, 15, { align: 'right' });

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
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  addText(pdf, 'LEGEND - Dental Conditions:', 15, startY);

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
  pdf.setFont('helvetica', 'normal');

  let yPos = startY + 10;
  let xPos = 15;
  const colWidth = 90;

  Array.from(usedConditions).forEach((conditionKey, index) => {
    const condition = DENTAL_CONDITIONS[conditionKey];

    // Add color box
    pdf.setFillColor(condition.color);
    pdf.rect(xPos, yPos - 3, 4, 4, 'F');

    // Add condition label
    addText(pdf, transliterate(condition.label), xPos + 8, yPos);

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
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  addText(pdf, 'TOOTH CONDITIONS:', 15, startY);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  let yPos = startY + 12;

  // Upper jaw
  pdf.setFont('helvetica', 'bold');
  addText(pdf, 'Upper Jaw (Verkhnyaya chelyust):', 15, yPos);
  yPos += 6;

  pdf.setFont('helvetica', 'normal');
  TOOTH_NUMBERS.upper.forEach(toothNumber => {
    if (toothConditions[toothNumber]) {
      const conditions = Object.entries(toothConditions[toothNumber])
        .filter(([_, condition]) => condition && DENTAL_CONDITIONS[condition])
        .map(([surface, condition]) => `${surface}: ${transliterate(DENTAL_CONDITIONS[condition].label)}`)
        .join(', ');

      if (conditions) {
        addText(pdf, `Tooth ${toothNumber}: ${conditions}`, 20, yPos);
        yPos += 5;
      }
    }
  });

  yPos += 4;

  // Lower jaw
  pdf.setFont('helvetica', 'bold');
  addText(pdf, 'Lower Jaw (Nizhnyaya chelyust):', 15, yPos);
  yPos += 6;

  pdf.setFont('helvetica', 'normal');
  TOOTH_NUMBERS.lower.forEach(toothNumber => {
    if (toothConditions[toothNumber]) {
      const conditions = Object.entries(toothConditions[toothNumber])
        .filter(([_, condition]) => condition && DENTAL_CONDITIONS[condition])
        .map(([surface, condition]) => `${surface}: ${transliterate(DENTAL_CONDITIONS[condition].label)}`)
        .join(', ');

      if (conditions) {
        addText(pdf, `Tooth ${toothNumber}: ${conditions}`, 20, yPos);
        yPos += 5;
      }
    }
  });
};