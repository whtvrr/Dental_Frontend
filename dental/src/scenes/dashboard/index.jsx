import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  useTheme,
  Alert,
  CircularProgress,
  useMediaQuery
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import DentalChart from "../../components/dental-chart/DentalChart";
import { useStatusContext } from "../../context/StatusContext";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const chartRef = useRef(null);
  const { statusesLookup } = useStatusContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [heading, setHeading] = useState('Зубная формула пациента');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [dentalChartData, setDentalChartData] = useState({});

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportMessage('');

    try {
      // Dynamic import for PDF libraries
      const html2canvas = await import('html2canvas');
      const jsPDF = await import('jspdf');
      const pdf = new jsPDF.default('l', 'mm', 'a4'); // landscape orientation

      const chartElement = chartRef.current;
      if (!chartElement) {
        throw new Error('Chart element not found');
      }

      // Find upper and lower jaw sections
      const upperJawSection = chartElement.querySelector('[data-jaw="upper"]');
      const lowerJawSection = chartElement.querySelector('[data-jaw="lower"]');

      if (!upperJawSection || !lowerJawSection) {
        // Fallback: capture the whole chart and split it
        await createFullChartPDF(pdf, chartElement, html2canvas);
      } else {
        // Capture each jaw separately
        await createSeparateJawsPDF(pdf, upperJawSection, lowerJawSection, html2canvas);
      }

      // Save PDF
      pdf.save(`dental-chart-${new Date().toISOString().split('T')[0]}.pdf`);

      setExportMessage('PDF успешно экспортирован!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportMessage('Ошибка при экспорте PDF. Попробуйте еще раз.');
    } finally {
      setIsExporting(false);
    }
  };

  const createFullChartPDF = async (pdf, chartElement, html2canvas) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - (margin * 2);
    const maxImageHeight = pageHeight - 50;

    // Try to find separate jaw sections first
    const upperJawSection = chartElement.querySelector('[data-jaw="upper"]');
    const lowerJawSection = chartElement.querySelector('[data-jaw="lower"]');

    if (upperJawSection && lowerJawSection) {
      // Use separate jaw sections if available
      await createSeparateJawsPDF(pdf, upperJawSection, lowerJawSection, html2canvas);
      return;
    }

    // Fallback: manually crop the chart
    // First, find the chart container dimensions
    const chartRect = chartElement.getBoundingClientRect();
    const chartHeight = chartRect.height;
    const upperJawHeight = chartHeight * 0.45; // Approximate upper jaw area
    const lowerJawHeight = chartHeight * 0.45; // Approximate lower jaw area
    const centerGap = chartHeight * 0.1; // Gap between jaws

    // Page 1: Heading + Upper Jaw
    pdf.setFontSize(20);
    pdf.text(heading, pageWidth / 2, 20, { align: 'center' });

    // Capture just the upper portion
    const upperCanvas = await html2canvas.default(chartElement, {
      backgroundColor: theme.palette.mode === 'dark' ? '#1F2A40' : '#FFFFFF',
      scale: 4,
      useCORS: true,
      logging: false,
      height: upperJawHeight,
      y: 0
    });

    const upperImgData = upperCanvas.toDataURL('image/png');
    const upperAspectRatio = upperCanvas.width / upperCanvas.height;

    let upperImgWidth = maxWidth;
    let upperImgHeight = maxWidth / upperAspectRatio;

    if (upperImgHeight > maxImageHeight) {
      upperImgHeight = maxImageHeight;
      upperImgWidth = upperImgHeight * upperAspectRatio;
    }

    const upperXPos = (pageWidth - upperImgWidth) / 2;
    pdf.addImage(upperImgData, 'PNG', upperXPos, 30, upperImgWidth, upperImgHeight);

    // Page 2: Lower Jaw only
    pdf.addPage();

    // Capture just the lower portion
    const lowerCanvas = await html2canvas.default(chartElement, {
      backgroundColor: theme.palette.mode === 'dark' ? '#1F2A40' : '#FFFFFF',
      scale: 4,
      useCORS: true,
      logging: false,
      height: lowerJawHeight,
      y: upperJawHeight + centerGap
    });

    const lowerImgData = lowerCanvas.toDataURL('image/png');
    const lowerAspectRatio = lowerCanvas.width / lowerCanvas.height;

    let lowerImgWidth = maxWidth;
    let lowerImgHeight = maxWidth / lowerAspectRatio;

    if (lowerImgHeight > maxImageHeight) {
      lowerImgHeight = maxImageHeight;
      lowerImgWidth = lowerImgHeight * lowerAspectRatio;
    }

    const lowerXPos = (pageWidth - lowerImgWidth) / 2;
    pdf.addImage(lowerImgData, 'PNG', lowerXPos, 20, lowerImgWidth, lowerImgHeight);
  };

  const createSeparateJawsPDF = async (pdf, upperJawSection, lowerJawSection, html2canvas) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - (margin * 2);
    const maxImageHeight = pageHeight - 50;

    // Page 1: Heading + Upper Jaw
    pdf.setFontSize(20);
    pdf.text(heading, pageWidth / 2, 20, { align: 'center' });

    // Capture upper jaw at very high resolution
    const upperCanvas = await html2canvas.default(upperJawSection, {
      backgroundColor: theme.palette.mode === 'dark' ? '#1F2A40' : '#FFFFFF',
      scale: 4,
      useCORS: true,
      logging: false
    });

    const upperImgData = upperCanvas.toDataURL('image/png');
    const upperAspectRatio = upperCanvas.width / upperCanvas.height;

    let upperImgWidth = maxWidth;
    let upperImgHeight = maxWidth / upperAspectRatio;

    if (upperImgHeight > maxImageHeight) {
      upperImgHeight = maxImageHeight;
      upperImgWidth = upperImgHeight * upperAspectRatio;
    }

    const upperXPos = (pageWidth - upperImgWidth) / 2;
    pdf.addImage(upperImgData, 'PNG', upperXPos, 30, upperImgWidth, upperImgHeight);

    // Page 2: Lower Jaw only
    pdf.addPage();

    // Capture lower jaw at very high resolution
    const lowerCanvas = await html2canvas.default(lowerJawSection, {
      backgroundColor: theme.palette.mode === 'dark' ? '#1F2A40' : '#FFFFFF',
      scale: 4,
      useCORS: true,
      logging: false
    });

    const lowerImgData = lowerCanvas.toDataURL('image/png');
    const lowerAspectRatio = lowerCanvas.width / lowerCanvas.height;

    let lowerImgWidth = maxWidth;
    let lowerImgHeight = maxWidth / lowerAspectRatio;

    if (lowerImgHeight > maxImageHeight) {
      lowerImgHeight = maxImageHeight;
      lowerImgWidth = lowerImgHeight * lowerAspectRatio;
    }

    const lowerXPos = (pageWidth - lowerImgWidth) / 2;
    pdf.addImage(lowerImgData, 'PNG', lowerXPos, 20, lowerImgWidth, lowerImgHeight);
  };

  return (
    <Box m={isMobile ? "10px" : "20px"}>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        mb={3}
        sx={{
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0
        }}
      >
        <Header title="ЗУБНАЯ ФОРМУЛА" subtitle="Интерактивная карта состояния зубов" />

        <Box
          display="flex"
          gap={isMobile ? 1 : 2}
          alignItems={isMobile ? "stretch" : "center"}
          sx={{
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto"
          }}
        >
          <TextField
            label="Заголовок для PDF"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              width: isMobile ? "100%" : 250,
              '& .MuiOutlinedInput-root': {
                color: colors.grey[100]
              },
              '& .MuiInputLabel-root': {
                color: colors.grey[200]
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.grey[400]
              }
            }}
          />

          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            fullWidth={isMobile}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: "bold",
              padding: isMobile ? "8px 16px" : "10px 20px",
              '&:hover': {
                backgroundColor: colors.blueAccent[800]
              },
              '&:disabled': {
                backgroundColor: colors.grey[600]
              }
            }}
          >
            {isExporting ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              <DownloadOutlinedIcon sx={{ mr: isMobile ? "5px" : "10px" }} />
            )}
            {isExporting ? 'Экспорт...' : 'Экспорт в PDF'}
          </Button>
        </Box>
      </Box>

      {/* Export Status Message */}
      {exportMessage && (
        <Box mb={2}>
          <Alert
            severity={exportMessage.includes('Ошибка') ? 'error' : 'success'}
            onClose={() => setExportMessage('')}
          >
            {exportMessage}
          </Alert>
        </Box>
      )}

      {/* DENTAL CHART */}
      <Paper
        ref={chartRef}
        sx={{
          backgroundColor: colors.primary[400],
          borderRadius: 2,
          overflow: 'hidden',
          p: isMobile ? 1 : 2
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            textAlign: 'center',
            color: colors.grey[100],
            fontWeight: 600
          }}
        >
          {heading}
        </Typography>

        <DentalChart
          patientId="dashboard-chart"
          readOnly={false}
          onFormulaChange={(formulaData) => {
            // Convert formula data to conditions format
            if (formulaData && formulaData.teeth) {
              const conditions = {};
              formulaData.teeth.forEach(tooth => {
                const toothNumber = tooth.number;
                conditions[toothNumber] = {};

                if (tooth.gum && tooth.gum.status_id) {
                  conditions[toothNumber].jaw = tooth.gum.status_id;
                }

                if (tooth.whole && tooth.whole.status_id) {
                  conditions[toothNumber].crown = tooth.whole.status_id;
                }

                if (tooth.roots && Array.isArray(tooth.roots)) {
                  tooth.roots.forEach((root, index) => {
                    if (root && root.status_id) {
                      conditions[toothNumber][`root_${index + 1}`] = root.status_id;
                    }

                    if (root && root.channels && Array.isArray(root.channels)) {
                      root.channels.forEach((channel, channelIndex) => {
                        if (channel && channel.status_id) {
                          conditions[toothNumber][`channel_${index + 1}_${channelIndex + 1}`] = channel.status_id;
                        }
                      });
                    }
                  });
                }

                if (tooth.segments) {
                  const segmentMapping = {
                    'mid': 'pulp',
                    'rt': 'occlusal',
                    'rb': 'distal',
                    'lb': 'cervical',
                    'lt': 'mesial'
                  };

                  Object.entries(segmentMapping).forEach(([backendKey, frontendKey]) => {
                    if (tooth.segments[backendKey] && tooth.segments[backendKey].status_id) {
                      conditions[toothNumber][frontendKey] = tooth.segments[backendKey].status_id;
                    }
                  });
                }
              });
              setDentalChartData(conditions);
            }
          }}
        />
      </Paper>

      {/* Instructions */}
      <Box mt={3}>
        <Typography variant="body2" color={colors.grey[300]}>
          Инструкции: Кликните на любую часть зуба чтобы изменить ее состояние.
          Измените заголовок выше и нажмите "Экспорт в PDF" чтобы сохранить текущее состояние формулы.
          Внимание: изменения на этой странице не сохраняются в базе данных.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;