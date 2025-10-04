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
  Paper,
  Chip,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { tokens } from '../theme';
import { useApi } from '../hooks/useApi';
import API_CONFIG from '../config/api';
import DentalChart from './dental-chart/DentalChart';

const AppointmentsModal = ({
  open,
  onClose,
  appointments,
  clientName,
  clientId
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const api = useApi();
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dentalChartData, setDentalChartData] = useState({});
  const [chartLoading, setChartLoading] = useState({});

  // Fetch clients and doctors when modal opens
  useEffect(() => {
    if (open && appointments.length > 0) {
      fetchClientsAndDoctors();
    }
  }, [open, appointments]);

  const fetchClientsAndDoctors = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.full_name : `Client ${clientId.slice(-4)}`;
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.full_name : `Doctor ${doctorId.slice(-4)}`;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not specified';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return 'Not specified';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not specified';
    const date = new Date(dateTimeString);
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

  const fetchDentalChart = async (appointmentId) => {
    if (!clientId || chartLoading[appointmentId] || dentalChartData[appointmentId]) {
      return;
    }

    setChartLoading(prev => ({ ...prev, [appointmentId]: true }));

    try {
      const response = await api.get(`/formulas/user/${clientId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data) {
          const conditions = convertFormulaToConditions(data.data);
          setDentalChartData(prev => ({ ...prev, [appointmentId]: conditions }));
        } else {
          setDentalChartData(prev => ({ ...prev, [appointmentId]: {} }));
        }
      } else {
        setDentalChartData(prev => ({ ...prev, [appointmentId]: {} }));
      }
    } catch (err) {
      console.error('Failed to fetch dental chart:', err);
      setDentalChartData(prev => ({ ...prev, [appointmentId]: {} }));
    } finally {
      setChartLoading(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          backgroundColor: colors.primary[400],
          maxHeight: '85vh'
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
        <Box>
          <Typography variant="h5">
            Appointments for {clientName}
          </Typography>
          <Typography variant="subtitle1" color={colors.grey[300]}>
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
          </Typography>
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
      
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color={colors.grey[400]}>
              Loading appointment details...
            </Typography>
          </Box>
        ) : appointments.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <EventIcon sx={{ 
              fontSize: 64, 
              color: colors.grey[500], 
              mb: 2 
            }} />
            <Typography variant="h6" color={colors.grey[400]}>
              No appointments found
            </Typography>
            <Typography variant="body2" color={colors.grey[500]}>
              This client has no scheduled appointments.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {appointments.map((appointment, index) => (
              <React.Fragment key={appointment.id || index}>
                <ListItem sx={{
                  p: 3,
                  backgroundColor: index % 2 === 0 ? colors.primary[400] : colors.primary[500],
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ mt: 1 }}>
                      <EventIcon sx={{ color: colors.blueAccent[400] }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" color={colors.grey[100]}>
                            Dr. {getDoctorName(appointment.doctor_id)}
                          </Typography>
                          <Chip
                            label={getStatusText(appointment.status)}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <EventIcon sx={{ fontSize: 16, color: colors.grey[400], mr: 1 }} />
                              <Typography variant="body2" color={colors.grey[300]}>
                                {formatDate(appointment.date_time)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <ScheduleIcon sx={{ fontSize: 16, color: colors.grey[400], mr: 1 }} />
                              <Typography variant="body2" color={colors.grey[300]}>
                                {formatTime(appointment.date_time)}
                              </Typography>
                            </Box>
                          </Grid>
                          {appointment.duration_minutes && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ScheduleIcon sx={{ fontSize: 16, color: colors.grey[400], mr: 1 }} />
                                <Typography variant="body2" color={colors.grey[300]}>
                                  Duration: {appointment.duration_minutes} minutes
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {appointment.comment && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color={colors.grey[400]} sx={{ mt: 1, fontStyle: 'italic' }}>
                                "{appointment.comment}"
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      }
                    />
                  </Box>

                  {/* Show dental chart for completed appointments */}
                  {appointment.status?.toLowerCase() === 'completed' && (
                    <Accordion
                      sx={{
                        mt: 2,
                        backgroundColor: colors.primary[600],
                        '&:before': { display: 'none' },
                        boxShadow: 'none'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: colors.grey[300] }} />}
                        onClick={() => fetchDentalChart(appointment.id)}
                        sx={{
                          backgroundColor: colors.primary[600],
                          '&.Mui-expanded': {
                            backgroundColor: colors.primary[700]
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MedicalIcon sx={{ color: colors.blueAccent[400], mr: 1 }} />
                          <Typography variant="subtitle2" color={colors.grey[200]}>
                            View Dental Chart
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ backgroundColor: colors.primary[500], p: 2 }}>
                        {chartLoading[appointment.id] ? (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ mb: 1 }} />
                            <Typography variant="body2" color={colors.grey[400]}>
                              Loading dental chart...
                            </Typography>
                          </Box>
                        ) : dentalChartData[appointment.id] ? (
                          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                            <DentalChart
                              patientId={clientId}
                              toothConditions={dentalChartData[appointment.id]}
                              readOnly={true}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color={colors.grey[400]} sx={{ textAlign: 'center', py: 2 }}>
                            No dental chart data available for this appointment.
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )}
                </ListItem>
                {index < appointments.length - 1 && (
                  <Divider sx={{ borderColor: colors.grey[600] }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
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

export default AppointmentsModal;