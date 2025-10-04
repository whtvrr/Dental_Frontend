import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  useTheme,
  CircularProgress,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close as CloseIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  MedicalServices as MedicalIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { tokens } from '../theme';
import { useApi } from '../hooks/useApi';
import DentalChart from './dental-chart/DentalChart';

const AppointmentDetailsModal = ({
  open,
  onClose,
  appointment,
  clientName,
  doctorName
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const api = useApi();

  const [dentalChartData, setDentalChartData] = useState({});
  const [chartLoading, setChartLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [medicalData, setMedicalData] = useState({
    complaint: null,
    diagnosis: null,
    treatment: null
  });
  const [medicalDataLoading, setMedicalDataLoading] = useState(false);

  useEffect(() => {
    if (open && appointment) {
      // Reset state when modal opens
      setDentalChartData({});
      setChartLoading(false);
      setAppointmentData(null);
      setMedicalData({
        complaint: null,
        diagnosis: null,
        treatment: null
      });
      setMedicalDataLoading(true);

      // Fetch appointment data immediately when modal opens
      fetchAppointmentData();
    }
  }, [open, appointment]);

  const convertFormulaToConditions = (formulaData) => {
    const conditions = {};

    if (!formulaData || !formulaData.teeth) {
      return conditions;
    }

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

          // Handle channels within each root
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

    return conditions;
  };

  const fetchMedicalData = async (appointmentData) => {
    try {
      const medicalPromises = [];

      // Fetch complaint data if complaint_id exists
      if (appointmentData.complaint_id) {
        medicalPromises.push(
          api.get(`/complaints/${appointmentData.complaint_id}`)
            .then(response => response.ok ? response.json() : null)
            .then(data => ({ type: 'complaint', data: data?.data || null }))
            .catch(() => ({ type: 'complaint', data: null }))
        );
      } else {
        medicalPromises.push(Promise.resolve({ type: 'complaint', data: null }));
      }

      // Fetch diagnosis data from /statuses/{id} if diagnosis_id exists
      if (appointmentData.diagnosis_id) {
        medicalPromises.push(
          api.get(`/statuses/${appointmentData.diagnosis_id}`)
            .then(response => response.ok ? response.json() : null)
            .then(data => ({ type: 'diagnosis', data: data?.data || null }))
            .catch(() => ({ type: 'diagnosis', data: null }))
        );
      } else {
        medicalPromises.push(Promise.resolve({ type: 'diagnosis', data: null }));
      }

      // Fetch treatment data from /statuses/{id} if treatment_id exists
      if (appointmentData.treatment_id) {
        medicalPromises.push(
          api.get(`/statuses/${appointmentData.treatment_id}`)
            .then(response => response.ok ? response.json() : null)
            .then(data => ({ type: 'treatment', data: data?.data || null }))
            .catch(() => ({ type: 'treatment', data: null }))
        );
      } else {
        medicalPromises.push(Promise.resolve({ type: 'treatment', data: null }));
      }

      const results = await Promise.all(medicalPromises);

      const medicalResults = {
        complaint: null,
        diagnosis: null,
        treatment: null
      };

      results.forEach(result => {
        if (result.type && result.data) {
          medicalResults[result.type] = result.data;
        }
      });

      setMedicalData(medicalResults);
      console.log('AppointmentDetailsModal - Loaded medical data:', medicalResults);
    } catch (err) {
      console.error('Failed to fetch medical data:', err);
    } finally {
      setMedicalDataLoading(false);
    }
  };

  const fetchAppointmentData = async () => {
    if (!appointment?.id) {
      return;
    }

    setMedicalDataLoading(true);

    try {
      const response = await api.get(`/appointments/${appointment.id}`);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data) {
          setAppointmentData(data.data);

          // Fetch medical data in parallel
          fetchMedicalData(data.data);

          console.log('AppointmentDetailsModal - Loaded appointment data:', data.data);
        } else {
          console.log('No appointment data found');
          setAppointmentData(null);
          setMedicalDataLoading(false);
        }
      } else {
        console.log('Failed to fetch appointment:', response.status);
        setAppointmentData(null);
        setMedicalDataLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch appointment data:', err);
      setAppointmentData(null);
      setMedicalDataLoading(false);
    }
  };

  const fetchDentalChart = async () => {
    if (!appointment?.id || chartLoading) {
      return;
    }

    setChartLoading(true);

    try {
      // Use existing appointmentData if available, otherwise fetch
      if (appointmentData && appointmentData.formula) {
        const conditions = convertFormulaToConditions(appointmentData.formula);
        setDentalChartData(conditions);
        console.log('AppointmentDetailsModal - Using cached dental chart data');
      } else {
        const response = await api.get(`/appointments/${appointment.id}`);

        if (response.ok) {
          const data = await response.json();
          if (data.status === 200 && data.data) {
            // Handle dental chart
            if (data.data.formula) {
              const conditions = convertFormulaToConditions(data.data.formula);
              setDentalChartData(conditions);
            } else {
              setDentalChartData({});
            }

            console.log('AppointmentDetailsModal - Loaded dental chart data:', data.data.formula);
          } else {
            console.log('No dental chart data found');
            setDentalChartData({});
          }
        } else {
          console.log('Failed to fetch dental chart:', response.status);
          setDentalChartData({});
        }
      }
    } catch (err) {
      console.error('Failed to fetch dental chart data:', err);
      setDentalChartData({});
    } finally {
      setChartLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  };

  if (!appointment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.primary[400],
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        color: colors.grey[100],
        backgroundColor: colors.primary[500],
        borderBottom: `1px solid ${colors.grey[600]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center">
          <EventIcon sx={{ mr: 2, color: colors.blueAccent[400] }} />
          <Box>
            <Typography variant="h5">
              Appointment Details
            </Typography>
            <Typography variant="subtitle1" color={colors.grey[300]}>
              {formatDate(appointment.date_time)} at {formatTime(appointment.date_time)}
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            color: colors.grey[300],
            '&:hover': {
              backgroundColor: colors.grey[700]
            }
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Appointment Information */}
        <Paper sx={{
          p: 3,
          mb: 3,
          backgroundColor: colors.primary[500],
          borderRadius: 2
        }}>
          <Typography variant="h6" color={colors.grey[100]} gutterBottom>
            Appointment Information
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.grey[600] }} />

          {medicalDataLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" color={colors.grey[400]}>
                Loading appointment data...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Client
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {clientName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ color: colors.greenAccent[500], mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Doctor
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {doctorName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <EventIcon sx={{ color: colors.blueAccent[400], mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Date
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {formatDate(appointment.date_time)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <ScheduleIcon sx={{ color: colors.redAccent[500], mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Time
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {formatTime(appointment.date_time)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <ScheduleIcon sx={{ color: colors.blueAccent[300], mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Duration
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {appointment.duration_minutes || 'N/A'} minutes
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box sx={{ mr: 2 }}>
                    <Chip
                      label={getStatusText(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="medium"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Status
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Anamnesis */}
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="flex-start" mb={2}>
                  <MedicalIcon sx={{ color: colors.blueAccent[500], mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Anamnesis
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {appointmentData?.anamnesis || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Treatment */}
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="flex-start" mb={2}>
                  <MedicalIcon sx={{ color: colors.greenAccent[500], mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Treatment
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {medicalData.treatment?.title || 'Not specified'}
                    </Typography>
                    {medicalData.treatment?.description && medicalData.treatment.description !== medicalData.treatment.title && (
                      <Typography variant="body2" color={colors.grey[300]} sx={{ mt: 1, fontStyle: 'italic' }}>
                        {medicalData.treatment.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Complaint */}
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="flex-start" mb={2}>
                  <CommentIcon sx={{ color: colors.redAccent[500], mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Complaint
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {medicalData.complaint?.title || 'Patient has no specific complaints at this time'}
                    </Typography>
                    {medicalData.complaint?.description && medicalData.complaint.description !== medicalData.complaint.title && (
                      <Typography variant="body2" color={colors.grey[300]} sx={{ mt: 1, fontStyle: 'italic' }}>
                        {medicalData.complaint.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Diagnosis */}
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="flex-start" mb={2}>
                  <MedicalIcon sx={{ color: colors.redAccent[400], mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Diagnosis
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {medicalData.diagnosis?.title || 'Not specified'}
                    </Typography>
                    {medicalData.diagnosis?.description && medicalData.diagnosis.description !== medicalData.diagnosis.title && (
                      <Typography variant="body2" color={colors.grey[300]} sx={{ mt: 1, fontStyle: 'italic' }}>
                        {medicalData.diagnosis.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {appointment.comment && (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <CommentIcon sx={{ color: colors.grey[400], mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color={colors.grey[300]}>
                        Comments
                      </Typography>
                      <Typography variant="body1" color={colors.grey[100]} sx={{ fontStyle: 'italic' }}>
                        "{appointment.comment}"
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>

        {/* Dental Chart Section */}
        <Accordion
          sx={{
            backgroundColor: colors.primary[500],
            '&:before': { display: 'none' },
            boxShadow: 'none'
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: colors.grey[300] }} />}
            onClick={fetchDentalChart}
            sx={{
              backgroundColor: colors.primary[500],
              '&.Mui-expanded': {
                backgroundColor: colors.primary[600]
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicalIcon sx={{ color: colors.blueAccent[400], mr: 1 }} />
              <Typography variant="h6" color={colors.grey[200]}>
                Dental Chart
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: colors.primary[400], p: 3 }}>
            {chartLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body1" color={colors.grey[400]}>
                  Loading dental chart...
                </Typography>
              </Box>
            ) : Object.keys(dentalChartData).length > 0 ? (
              <DentalChart
                patientId={appointment.client_id}
                toothConditions={dentalChartData}
                readOnly={true}
              />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <MedicalIcon sx={{
                  fontSize: 64,
                  color: colors.grey[500],
                  mb: 2
                }} />
                <Typography variant="h6" color={colors.grey[400]}>
                  No dental chart data
                </Typography>
                <Typography variant="body2" color={colors.grey[500]}>
                  No dental formula found for this client.
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        backgroundColor: colors.primary[500],
        borderTop: `1px solid ${colors.grey[600]}`
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: colors.grey[100],
            borderColor: colors.grey[400],
            '&:hover': {
              borderColor: colors.grey[100],
              backgroundColor: colors.grey[900]
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailsModal;