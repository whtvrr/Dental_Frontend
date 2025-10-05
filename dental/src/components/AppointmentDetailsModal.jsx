import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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
  AccordionDetails,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Close as CloseIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  MedicalServices as MedicalIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { tokens } from '../theme';
import { useApi } from '../hooks/useApi';
import API_CONFIG from '../config/api';
import DentalChart from './dental-chart/DentalChart';
import { translations, translateStatus } from '../utils/translations';
import { exportMedicalDocumentFormatted } from '../utils/exportMedicalDocumentFormatted';

const AppointmentDetailsModal = ({
  open,
  onClose,
  appointment,
  clientName,
  doctorName,
  onRefresh
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editFormData, setEditFormData] = useState({
    client_id: '',
    doctor_id: '',
    date_time: '',
    duration_minutes: 30,
    status: 'scheduled',
    comment: ''
  });

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
      fetchClientsAndDoctors();
    }
  }, [open, appointment]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!dateString) return translations.notSpecified;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return translations.notSpecified;
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
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
    return translateStatus(status);
  };

  const fetchClientsAndDoctors = async () => {
    try {
      const [clientsResponse, doctorsResponse] = await Promise.all([
        api.get(API_CONFIG.ENDPOINTS.USERS.CLIENTS + '?offset=0&limit=1000'),
        api.get(API_CONFIG.ENDPOINTS.USERS.DOCTORS + '?offset=0&limit=1000')
      ]);

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        if (clientsData.status === 200 && clientsData.data && clientsData.data.clients) {
          setClients(clientsData.data.clients);
        }
      }

      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        if (doctorsData.status === 200 && doctorsData.data && doctorsData.data.doctors) {
          setDoctors(doctorsData.data.doctors);
        }
      }
    } catch (error) {
      console.error('Error fetching clients and doctors:', error);
    }
  };

  const handleEditClick = () => {
    if (!appointment) return;

    const dateTimeValue = new Date(appointment.date_time).toISOString().slice(0, 16);

    setEditFormData({
      client_id: appointment.client_id,
      doctor_id: appointment.doctor_id,
      date_time: dateTimeValue,
      duration_minutes: appointment.duration_minutes,
      status: appointment.status,
      comment: appointment.comment || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!appointment) return;

    try {
      const formattedData = {
        ...editFormData,
        date_time: new Date(editFormData.date_time).toISOString()
      };

      const response = await api.put(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}/${appointment.id}`, formattedData);

      if (response.ok) {
        setEditModalOpen(false);
        if (onRefresh) onRefresh();
        await fetchAppointmentData();
      } else {
        console.error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointment) return;

    setDeleteLoading(true);
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE}/${appointment.id}`);

      if (response.ok) {
        setDeleteConfirmOpen(false);
        if (onRefresh) onRefresh();
        onClose();
      } else {
        console.error('Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportDocument = async () => {
    if (!appointment || !appointmentData) return;

    try {
      // Prepare client data
      const clientData = {
        full_name: clientName,
        birth_date: null, // Would need to be fetched separately if needed
        gender: null, // Would need to be fetched separately if needed
        phone_number: null, // Would need to be fetched separately if needed
        address: null // Would need to be fetched separately if needed
      };

      // Prepare doctor data
      const doctorData = {
        full_name: doctorName
      };

      // Prepare appointment data with medical information
      const appointmentExportData = {
        ...appointmentData,
        complaint: medicalData.complaint,
        diagnosis: medicalData.diagnosis,
        treatment: medicalData.treatment
      };

      // Export the document with proper formatting like the example
      exportMedicalDocumentFormatted(appointmentExportData, clientData, doctorData);
    } catch (error) {
      console.error('Error exporting medical document:', error);
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
              {translations.appointmentDetails}
            </Typography>
            <Typography variant="subtitle1" color={colors.grey[300]}>
              {formatDate(appointment.date_time)}, {formatTime(appointment.date_time)}
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
            {translations.appointmentInformation}
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.grey[600] }} />

          {medicalDataLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1" color={colors.grey[400]}>
                {translations.loadingAppointments}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      {translations.client}
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
                      {translations.doctor}
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
                      {translations.date}
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
                      {translations.time}
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
                      {translations.duration}
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {appointment.duration_minutes || translations.notSpecified} {translations.minutes}
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
                      {translations.status}
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
                      {translations.anamnesis}
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {appointmentData?.anamnesis || translations.notSpecified}
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
                      {translations.treatment}
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {medicalData.treatment?.title || translations.notSpecified}
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
                      {translations.complaint}
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {medicalData.complaint?.title || translations.notSpecified}
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
                      {translations.diagnosis}
                    </Typography>
                    <Typography variant="body1" color={colors.grey[100]}>
                      {medicalData.diagnosis?.title || translations.notSpecified}
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
                        {translations.comments}
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
                {translations.dentalChart}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ backgroundColor: colors.primary[400], p: 3 }}>
            {chartLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body1" color={colors.grey[400]}>
                  {translations.loadingDentalChart}
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
                  {translations.noDentalChart}
                </Typography>
                <Typography variant="body2" color={colors.grey[500]}>
                  {translations.noDentalChartDesc}
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        backgroundColor: colors.primary[500],
        borderTop: `1px solid ${colors.grey[600]}`,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" gap={2}>
          {/* Export Medical Document button */}
          <Button
            onClick={handleExportDocument}
            variant="contained"
            startIcon={<PrintIcon />}
            disabled={medicalDataLoading}
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              '&:hover': {
                backgroundColor: colors.greenAccent[700]
              },
              '&:disabled': {
                backgroundColor: colors.grey[500]
              }
            }}
          >
            {translations.exportDocument}
          </Button>

          {/* Edit button - only show for scheduled/confirmed appointments */}
          {appointment && (appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
            <Button
              onClick={handleEditClick}
              variant="contained"
              startIcon={<EditIcon />}
              sx={{
                backgroundColor: colors.blueAccent[600],
                color: colors.grey[100],
                '&:hover': {
                  backgroundColor: colors.blueAccent[700]
                }
              }}
            >
              {translations.edit}
            </Button>
          )}

          {/* Delete button */}
          <Button
            onClick={handleDeleteClick}
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: colors.redAccent[700],
              color: colors.grey[100],
              '&:hover': {
                backgroundColor: colors.redAccent[800]
              }
            }}
          >
            {translations.delete}
          </Button>
        </Box>

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
          {translations.close}
        </Button>
      </DialogActions>

      {/* Edit Appointment Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-appointment-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: colors.primary[400],
            border: `2px solid ${colors.grey[100]}`,
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <Typography variant="h4" component="h2" mb={3} color={colors.grey[100]}>
            {translations.editAppointment}
          </Typography>

          <Box component="form" noValidate sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel sx={{ color: colors.grey[100] }}>{translations.selectClient}</InputLabel>
              <Select
                value={editFormData.client_id}
                onChange={(e) => setEditFormData({ ...editFormData, client_id: e.target.value })}
                label={translations.selectClient}
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[300] },
                  '& .MuiSvgIcon-root': { color: colors.grey[100] },
                }}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>{client.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel sx={{ color: colors.grey[100] }}>{translations.selectDoctor}</InputLabel>
              <Select
                value={editFormData.doctor_id}
                onChange={(e) => setEditFormData({ ...editFormData, doctor_id: e.target.value })}
                label={translations.selectDoctor}
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[300] },
                  '& .MuiSvgIcon-root': { color: colors.grey[100] },
                }}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>{doctor.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label={translations.dateTime}
              type="datetime-local"
              value={editFormData.date_time}
              onChange={(e) => setEditFormData({ ...editFormData, date_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': { borderColor: colors.grey[300] },
                },
                '& .MuiInputLabel-root': { color: colors.grey[100] },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label={translations.durationMinutes}
              type="number"
              value={editFormData.duration_minutes}
              onChange={(e) => setEditFormData({ ...editFormData, duration_minutes: parseInt(e.target.value) })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': { borderColor: colors.grey[300] },
                },
                '& .MuiInputLabel-root': { color: colors.grey[100] },
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              label={translations.comment}
              multiline
              rows={3}
              value={editFormData.comment}
              onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': { borderColor: colors.grey[300] },
                },
                '& .MuiInputLabel-root': { color: colors.grey[100] },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: colors.grey[100] }}>{translations.status}</InputLabel>
              <Select
                value={editFormData.status}
                label={translations.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.grey[300] },
                  '& .MuiSvgIcon-root': { color: colors.grey[100] },
                }}
              >
                <MenuItem value="scheduled">{translations.scheduled}</MenuItem>
                <MenuItem value="confirmed">{translations.confirmed}</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={() => setEditModalOpen(false)}
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": { borderColor: colors.grey[100], backgroundColor: colors.grey[900] },
                }}
              >
                {translations.cancel}
              </Button>
              <Button
                variant="contained"
                onClick={handleEditSubmit}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  "&:hover": { backgroundColor: colors.greenAccent[700] },
                }}
              >
                {translations.saveChanges}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.grey[600]}`
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: colors.grey[100] }}>
          {translations.deleteAppointment}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: colors.grey[300] }}>
            {translations.deleteAppointmentConfirm}
            {appointment && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: colors.primary[500], borderRadius: 1 }}>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>{translations.client}:</strong> {clientName}
                </Typography>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>{translations.doctor}:</strong> {doctorName}
                </Typography>
                <Typography variant="body2" color={colors.grey[100]}>
                  <strong>{translations.dateTime}:</strong> {new Date(appointment.date_time).toLocaleString('ru-RU')}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              "&:hover": { borderColor: colors.grey[100], backgroundColor: colors.grey[900] },
            }}
          >
            {translations.cancel}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleteLoading}
            sx={{
              backgroundColor: colors.redAccent[600],
              color: colors.grey[100],
              "&:hover": { backgroundColor: colors.redAccent[700] },
              "&:disabled": { backgroundColor: colors.grey[500], color: colors.grey[300] },
            }}
          >
            {deleteLoading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                {translations.deleting}
              </Box>
            ) : (
              translations.deleteAppointment
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AppointmentDetailsModal;