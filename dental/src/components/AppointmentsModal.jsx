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
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { tokens } from '../theme';
import { useApi } from '../hooks/useApi';
import API_CONFIG from '../config/api';

const AppointmentsModal = ({ 
  open, 
  onClose, 
  appointments, 
  clientName 
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const api = useApi();
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

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
                  backgroundColor: index % 2 === 0 ? colors.primary[400] : colors.primary[500] 
                }}>
                  <ListItemIcon>
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