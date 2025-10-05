import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';

// Initialize PDFMake with fonts
pdfMake.vfs = vfsFonts.vfs;

// Add Roboto font configuration with CDN URLs for better Cyrillic support
pdfMake.fonts = {
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
  }
};

export const exportMedicalDocumentPDFMake = (appointmentData, clientData, doctorData) => {
  const appointmentDate = new Date(appointmentData.date_time);

  // Create document definition with Cyrillic support
  const docDefinition = {
    content: [
      // Header
      {
        table: {
          widths: ['*'],
          body: [
            [{
              text: 'МЕДИЦИНСКАЯ КАРТА ПАЦИЕНТА',
              style: 'header',
              alignment: 'center',
              fillColor: '#f5f8ff',
              border: [true, true, true, false]
            }],
            [{
              text: 'Стоматологическая клиника "ШАНС"',
              style: 'subheader',
              alignment: 'center',
              fillColor: '#f5f8ff',
              border: [true, false, true, true]
            }]
          ]
        },
        layout: {
          defaultBorder: false,
          fillColor: '#f5f8ff'
        },
        margin: [0, 0, 0, 10]
      },

      // Document info
      {
        columns: [
          {
            text: `№ ${appointmentData.id?.toString().slice(-8) || 'N/A'}`,
            style: 'documentInfo'
          },
          {
            text: `от ${appointmentDate.toLocaleDateString('ru-RU')}`,
            style: 'documentInfo',
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 8]
      },

      // Patient Information
      {
        text: 'ДАННЫЕ ПАЦИЕНТА',
        style: 'sectionHeader',
        fillColor: '#fafafa',
        margin: [0, 5, 0, 5]
      },
      {
        table: {
          widths: ['auto', '*'],
          body: [
            [
              { text: 'ФИО пациента:', style: 'label' },
              { text: clientData.full_name || 'Не указано', style: 'value' }
            ],
            [
              { text: 'Дата рождения:', style: 'label' },
              {
                text: clientData.birth_date ?
                  new Date(clientData.birth_date).toLocaleDateString('ru-RU') :
                  'Не указано',
                style: 'value'
              }
            ],
            [
              { text: 'Пол:', style: 'label' },
              {
                text: clientData.gender === 'male' ? 'Мужской' :
                      clientData.gender === 'female' ? 'Женский' : 'Не указано',
                style: 'value'
              }
            ],
            [
              { text: 'Телефон:', style: 'label' },
              { text: clientData.phone_number || 'Не указано', style: 'value' }
            ],
            [
              { text: 'Адрес:', style: 'label' },
              { text: clientData.address || 'Не указано', style: 'value' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10]
      },

      // Appointment Information
      {
        text: 'ИНФОРМАЦИЯ О ПРИЁМЕ',
        style: 'sectionHeader',
        fillColor: '#fafafa',
        margin: [0, 5, 0, 5]
      },
      {
        table: {
          widths: ['auto', '*'],
          body: [
            [
              { text: 'Дата приёма:', style: 'label' },
              { text: appointmentDate.toLocaleDateString('ru-RU'), style: 'value' }
            ],
            [
              { text: 'Время:', style: 'label' },
              {
                text: appointmentDate.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                style: 'value'
              }
            ],
            [
              { text: 'Длительность:', style: 'label' },
              { text: `${appointmentData.duration_minutes || 30} минут`, style: 'value' }
            ],
            [
              { text: 'Лечащий врач:', style: 'label' },
              { text: doctorData.full_name || 'Не указано', style: 'value' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10]
      }
    ],

    // Page settings - reduced margins to minimize blank space
    pageSize: 'A4',
    pageMargins: [30, 40, 30, 40],

    // Default font - Roboto (PDFMake default) supports Cyrillic
    defaultStyle: {
      font: 'Roboto',
      fontSize: 9
    },

    // Compact styles to minimize space
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        color: '#003366',
        margin: [0, 2, 0, 2]
      },
      subheader: {
        fontSize: 10,
        margin: [0, 0, 0, 3]
      },
      sectionHeader: {
        fontSize: 10,
        bold: true,
        margin: [2, 2, 2, 2]
      },
      documentInfo: {
        fontSize: 7,
        italics: true
      },
      label: {
        fontSize: 8,
        bold: true
      },
      value: {
        fontSize: 8
      }
    }
  };

  // Add medical information if available
  if (appointmentData.completed_data || appointmentData.anamnesis ||
      appointmentData.complaint || appointmentData.diagnosis || appointmentData.treatment) {

    docDefinition.content.push(
      {
        text: 'МЕДИЦИНСКАЯ ИНФОРМАЦИЯ',
        style: 'sectionHeader',
        fillColor: '#fafafa',
        margin: [0, 10, 0, 5]
      }
    );

    // Anamnesis
    const anamnesis = appointmentData.completed_data?.anamnesis || appointmentData.anamnesis;
    if (anamnesis) {
      docDefinition.content.push(
        {
          columns: [
            { text: 'Анамнез:', style: 'label', width: 'auto' },
            { text: String(anamnesis).trim(), style: 'value', width: '*' }
          ],
          margin: [0, 1, 0, 3]
        }
      );
    }

    // Complaint
    const complaintText = appointmentData.completed_data?.custom_complaint ||
                         appointmentData.completed_data?.complaint?.title ||
                         appointmentData.complaint?.title ||
                         'Не указано';
    docDefinition.content.push(
      {
        columns: [
          { text: 'Жалобы:', style: 'label', width: 'auto' },
          { text: String(complaintText).trim(), style: 'value', width: '*' }
        ],
        margin: [0, 1, 0, 3]
      }
    );

    // Diagnosis
    const diagnosis = appointmentData.completed_data?.diagnosis || appointmentData.diagnosis;
    if (diagnosis) {
      const diagnosisText = diagnosis.title ?
        `${diagnosis.title}${diagnosis.code ? ` (${diagnosis.code})` : ''}` :
        diagnosis;
      docDefinition.content.push(
        {
          columns: [
            { text: 'Диагноз:', style: 'label', width: 'auto' },
            { text: String(diagnosisText).trim(), style: 'value', width: '*' }
          ],
          margin: [0, 1, 0, 3]
        }
      );
    }

    // Treatment
    const treatment = appointmentData.completed_data?.treatment || appointmentData.treatment;
    if (treatment) {
      const treatmentText = treatment.title ?
        `${treatment.title}${treatment.code ? ` (${treatment.code})` : ''}` :
        treatment;
      docDefinition.content.push(
        {
          columns: [
            { text: 'Лечение:', style: 'label', width: 'auto' },
            { text: String(treatmentText).trim(), style: 'value', width: '*' }
          ],
          margin: [0, 1, 0, 3]
        }
      );
    }

    // Comments
    const comment = appointmentData.completed_data?.comment || appointmentData.comment;
    if (comment) {
      docDefinition.content.push(
        {
          columns: [
            { text: 'Комментарии:', style: 'label', width: 'auto' },
            { text: String(comment).trim(), style: 'value', width: '*' }
          ],
          margin: [0, 1, 0, 3]
        }
      );
    }
  }

  // Footer with signature
  docDefinition.content.push(
    {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            {
              stack: [
                { text: 'Лечащий врач:', style: 'label', margin: [0, 0, 0, 5] },
                {
                  text: doctorData.full_name || 'Не указано',
                  style: { fontSize: 9, italics: true },
                  margin: [0, 0, 0, 5]
                },
                {
                  canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }],
                  margin: [0, 5, 0, 2]
                },
                { text: '(подпись)', style: { fontSize: 7, alignment: 'center' } }
              ]
            },
            {
              stack: [
                {
                  canvas: [
                    { type: 'rect', x: 0, y: 0, w: 60, h: 40, lineWidth: 1 }
                  ]
                },
                { text: 'М.П.', style: { fontSize: 12, alignment: 'center' }, margin: [0, -25, 0, 0] }
              ]
            }
          ]
        ]
      },
      layout: 'noBorders',
      margin: [0, 10, 0, 5]
    },
    {
      text: `Дата выдачи: ${new Date().toLocaleDateString('ru-RU')}`,
      style: { fontSize: 7 },
      margin: [0, 5, 0, 3]
    },
    {
      text: 'Документ выдан на основании медицинской карты пациента',
      style: { fontSize: 6, italics: true, color: '#666666' },
      alignment: 'center',
      margin: [0, 2, 0, 0]
    }
  );

  // Generate and download PDF
  const clientName = clientData.full_name ?
    String(clientData.full_name).trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') :
    'Patient';
  const dateString = appointmentDate.toISOString().split('T')[0];
  const fileName = `Medical_Record_${clientName}_${dateString}.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);
};

export default exportMedicalDocumentPDFMake;