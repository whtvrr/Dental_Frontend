import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { formatDate } from "@fullcalendar/core";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Button,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import { buildApiUrl } from "../../config/api";
import API_CONFIG from "../../config/api";
import { Add, PersonAdd } from "@mui/icons-material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { AuthContext } from "../../context/AuthContext";
import ApiClient from "../../utils/apiClient";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const authContext = useContext(AuthContext);
  const apiClient = useMemo(() => new ApiClient(authContext), [authContext]);

  // Helper function to format date as DD.MM.YYYY for API
  const formatDateForAPI = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientError, setClientError] = useState('');
  const [appointmentData, setAppointmentData] = useState({
    client_id: "",
    comment: "",
    date_time: "",
    doctor_id: "",
    duration_minutes: 30,
    status: "scheduled"
  });
  const [newClientData, setNewClientData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
    birth_date: "",
    gender: "male"
  });

  // Fetch clients from API
  const fetchClients = useCallback(async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.CLIENTS + '?offset=0&limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.clients) {
          setClients(data.data.clients);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    }
  }, [apiClient]);

  // Fetch doctors from API  
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS.DOCTORS + '?offset=0&limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.doctors) {
          setDoctors(data.data.doctors);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    }
  }, [apiClient]);

  // Fetch appointments based on user role
  const fetchAppointments = useCallback(async (dateInfo = null) => {
    if (!authContext.isAuthenticated || !authContext.user) return;
    
    setAppointmentsLoading(true);
    try {
      let url = API_CONFIG.ENDPOINTS.APPOINTMENTS.BASE + '?offset=0&limit=1000';
      
      // If user is a doctor, fetch only their appointments
      if (authContext.user.role === 'doctor') {
        url = `${API_CONFIG.ENDPOINTS.APPOINTMENTS.DOCTOR}/${authContext.user.id}`;
        
        // Add date range if provided (for calendar view changes)
        if (dateInfo) {
          const { start, end } = dateInfo;
          // Format dates as DD.MM.YYYY as expected by backend
          const fromDate = formatDateForAPI(start);
          const toDate = formatDateForAPI(end);
          url += `?from=${fromDate}&to=${toDate}`;
        }
      }
      
      const response = await apiClient.get(url);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data && data.data.appointments) {
          setAppointments(data.data.appointments);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [apiClient, authContext.isAuthenticated, authContext.user]);

  // Load appointments, clients and doctors when component mounts
  useEffect(() => {
    if (authContext.isAuthenticated && authContext.user) {
      // Load appointments
      fetchAppointments();
      
      // Load clients and doctors for name resolution
      setLoading(true);
      setError('');
      Promise.all([fetchClients(), fetchDoctors()])
        .finally(() => setLoading(false));
    }
  }, [authContext.isAuthenticated, authContext.user, fetchAppointments, fetchClients, fetchDoctors]);

  // Format appointments for FullCalendar
  const formatAppointmentsForCalendar = useCallback(() => {
    return appointments.map((appointment) => {
      // Find client and doctor names for display
      const client = clients.find(c => c.id === appointment.client_id);
      const doctor = doctors.find(d => d.id === appointment.doctor_id);
      
      const clientName = client ? client.full_name : `Client ${appointment.client_id.slice(-4)}`;
      const doctorName = doctor ? doctor.full_name : `Doctor ${appointment.doctor_id.slice(-4)}`;
      
      // Calculate end time based on duration
      const startTime = new Date(appointment.date_time);
      const endTime = new Date(startTime.getTime() + appointment.duration_minutes * 60000);
      
      // Color based on status
      let backgroundColor = colors.greenAccent[600]; // default scheduled
      let borderColor = colors.greenAccent[500];
      
      switch (appointment.status) {
        case 'confirmed':
          backgroundColor = colors.blueAccent[600];
          borderColor = colors.blueAccent[500];
          break;
        case 'cancelled':
          backgroundColor = colors.redAccent[600];
          borderColor = colors.redAccent[500];
          break;
        case 'completed':
          backgroundColor = colors.grey[600];
          borderColor = colors.grey[500];
          break;
        default:
          // Keep default scheduled colors
          break;
      }
      
      return {
        id: appointment.id,
        title: `${clientName} - ${doctorName}`,
        start: appointment.date_time,
        end: endTime.toISOString(),
        backgroundColor,
        borderColor,
        textColor: colors.grey[100],
        extendedProps: {
          client: clientName,
          doctor: doctorName,
          status: appointment.status,
          comment: appointment.comment,
          duration: appointment.duration_minutes,
          clientId: appointment.client_id,
          doctorId: appointment.doctor_id
        }
      };
    });
  }, [appointments, clients, doctors, colors]);

  // Get formatted events for calendar
  const calendarEvents = useMemo(() => {
    return formatAppointmentsForCalendar();
  }, [formatAppointmentsForCalendar]);

  const handleDateClick = (selected) => {
    // Just select the date, don't create appointment automatically
    console.log('Date selected:', selected.startStr);
  };

  const handleEventClick = async (selected) => {
    const appointmentId = selected.event.id;
    await fetchAppointmentDetail(appointmentId);
  };

  // Fetch appointment details and associated user info
  const fetchAppointmentDetail = async (appointmentId) => {
    setDetailLoading(true);
    try {
      // Fetch appointment details
      const appointmentResponse = await apiClient.get(`${API_CONFIG.ENDPOINTS.APPOINTMENTS.DETAIL}/${appointmentId}`);
      if (appointmentResponse.ok) {
        const appointmentData = await appointmentResponse.json();
        if (appointmentData.status === 200 && appointmentData.data) {
          const appointment = appointmentData.data;
          setSelectedAppointment(appointment);
          
          // Fetch client and doctor details in parallel
          const [clientResponse, doctorResponse] = await Promise.all([
            apiClient.get(`${API_CONFIG.ENDPOINTS.USERS.DETAIL}/${appointment.client_id}`),
            apiClient.get(`${API_CONFIG.ENDPOINTS.USERS.DETAIL}/${appointment.doctor_id}`)
          ]);
          
          // Process client data
          if (clientResponse.ok) {
            const clientData = await clientResponse.json();
            if (clientData.status === 200 && clientData.data) {
              setSelectedClient(clientData.data);
            }
          }
          
          // Process doctor data
          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            if (doctorData.status === 200 && doctorData.data) {
              setSelectedDoctor(doctorData.data);
            }
          }
          
          setOpenDetailModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle calendar view changes to fetch appointments for the new date range
  const handleDatesSet = (dateInfo) => {
    // For doctors, refetch appointments when view changes to get date-filtered results
    if (authContext.user && authContext.user.role === 'doctor') {
      fetchAppointments(dateInfo);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setError('');
    setAppointmentData({
      client_id: "",
      comment: "",
      date_time: "",
      doctor_id: "",
      duration_minutes: 30,
      status: "scheduled"
    });
  };

  const handleInputChange = (field, value) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientInputChange = (field, value) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenClientModal = () => {
    setOpenClientModal(true);
    setClientError('');
    setNewClientData({
      full_name: "",
      phone_number: "",
      address: "",
      birth_date: "",
      gender: "male"
    });
  };

  const handleCloseClientModal = () => {
    setOpenClientModal(false);
    setClientError('');
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedAppointment(null);
    setSelectedClient(null);
    setSelectedDoctor(null);
  };

  const handleCreateClient = async () => {
    setClientLoading(true);
    setClientError('');
    
    try {
      // Format birth date from DD.MM.YYYY to DD.MM.YYYY (keep the same format as expected)
      const formattedClientData = {
        ...newClientData,
        birth_date: newClientData.birth_date
      };

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.USERS.BASE, formattedClientData);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 201 && data.data) {
          // Add new client to the clients list
          const newClient = data.data;
          setClients(prev => [...prev, newClient]);
          
          // Auto-select the new client in appointment form
          setAppointmentData(prev => ({
            ...prev,
            client_id: newClient.id
          }));
          
          // Close the client modal
          handleCloseClientModal();
        } else {
          setClientError(data.message || 'Failed to create client');
        }
      } else {
        const errorData = await response.json();
        setClientError(errorData.message || 'Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setClientError('Network error. Please try again.');
    } finally {
      setClientLoading(false);
    }
  };

  const handleSubmitAppointment = async () => {
    try {
      const token = sessionStorage.getItem('access_token');
      
      // Convert datetime-local to ISO string format expected by backend
      const formattedData = {
        ...appointmentData,
        date_time: new Date(appointmentData.date_time).toISOString()
      };
      
      const response = await fetch(buildApiUrl('/appointments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Appointment created successfully:', result);
        
        // Refresh appointments after successful creation
        await fetchAppointments();
        
        handleCloseModal();
      } else {
        console.error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Full Calendar Interactive Page" />

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR SIDEBAR */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Upcoming Appointments</Typography>
          {appointmentsLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List>
              {calendarEvents
                .filter(event => new Date(event.start) >= new Date())
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .slice(0, 5)
                .map((event) => (
                <ListItem
                  key={event.id}
                  sx={{
                    backgroundColor: event.backgroundColor,
                    margin: "10px 0",
                    borderRadius: "2px",
                  }}
                >
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" color={colors.grey[100]}>
                          {formatDate(new Date(event.start), {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                          Status: {event.extendedProps?.status?.toUpperCase() || 'SCHEDULED'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {calendarEvents.length === 0 && !appointmentsLoading && (
                <Typography variant="body2" color={colors.grey[300]} sx={{ mt: 2 }}>
                  No appointments found
                </Typography>
              )}
            </List>
          )}
        </Box>

        {/* CALENDAR */}
        <Box flex="1 1 100%" ml="15px">
          {/* Appointment Button */}
          <Box display="flex" justifyContent="flex-end" mb="10px">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenModal}
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.greenAccent[700],
                },
              }}
            >
              New Appointment
            </Button>
          </Box>

          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            eventDisplay="block"
            eventOverlap={true}
            slotEventOverlap={false}
            select={handleDateClick}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            events={calendarEvents}
            loading={appointmentsLoading}
            eventDidMount={(info) => {
              // Add status badge to events
              const statusBadge = document.createElement('div');
              statusBadge.style.fontSize = '10px';
              statusBadge.style.opacity = '0.8';
              statusBadge.style.fontWeight = 'bold';
              statusBadge.textContent = info.event.extendedProps.status.toUpperCase();
              info.el.appendChild(statusBadge);
            }}
          />
        </Box>
      </Box>

      {/* Appointment Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="appointment-modal-title"
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
          }}
        >
          <Typography
            id="appointment-modal-title"
            variant="h4"
            component="h2"
            mb={3}
            color={colors.grey[100]}
          >
            New Appointment
          </Typography>
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2, color: colors.grey[100] }}>
                  Loading clients and doctors...
                </Typography>
              </Box>
            ) : (
              <>
                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    required
                    error={!appointmentData.client_id}
                  >
                    <InputLabel 
                      sx={{ color: colors.grey[100] }}
                    >
                      Select Client
                    </InputLabel>
                    <Select
                      value={appointmentData.client_id}
                      onChange={(e) => handleInputChange('client_id', e.target.value)}
                      label="Select Client"
                      sx={{
                        color: colors.grey[100],
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.grey[300],
                        },
                        '& .MuiSvgIcon-root': {
                          color: colors.grey[100],
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Choose a client</em>
                      </MenuItem>
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {client.full_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {client.phone_number} • {client.address}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Tooltip title="Add New Client">
                    <IconButton
                      onClick={handleOpenClientModal}
                      sx={{
                        color: colors.greenAccent[500],
                        backgroundColor: colors.primary[500],
                        '&:hover': {
                          backgroundColor: colors.greenAccent[900],
                        },
                        mt: 1,
                        ml: 1,
                      }}
                    >
                      <PersonAdd />
                    </IconButton>
                  </Tooltip>
                </Box>

                <FormControl 
                  fullWidth 
                  margin="normal"
                  required
                  error={!appointmentData.doctor_id}
                >
                  <InputLabel 
                    sx={{ color: colors.grey[100] }}
                  >
                    Select Doctor
                  </InputLabel>
                  <Select
                    value={appointmentData.doctor_id}
                    onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                    label="Select Doctor"
                    sx={{
                      color: colors.grey[100],
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.grey[300],
                      },
                      '& .MuiSvgIcon-root': {
                        color: colors.grey[100],
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Choose a doctor</em>
                    </MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {doctor.full_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {doctor.phone_number} • {doctor.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="date_time"
              label="Date & Time"
              name="date_time"
              type="datetime-local"
              value={appointmentData.date_time}
              onChange={(e) => handleInputChange('date_time', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[300],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="duration_minutes"
              label="Duration (minutes)"
              name="duration_minutes"
              type="number"
              value={appointmentData.duration_minutes}
              onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[300],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="comment"
              label="Comment"
              name="comment"
              multiline
              rows={3}
              value={appointmentData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[300],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel 
                id="status-label"
                sx={{ color: colors.grey[100] }}
              >
                Status
              </InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={appointmentData.status}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
                sx={{
                  color: colors.grey[100],
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.grey[300],
                  },
                  '& .MuiSvgIcon-root': {
                    color: colors.grey[100],
                  },
                }}
              >
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": {
                    borderColor: colors.grey[100],
                    backgroundColor: colors.grey[900],
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitAppointment}
                disabled={loading || !appointmentData.client_id || !appointmentData.doctor_id || !appointmentData.date_time}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  "&:hover": {
                    backgroundColor: colors.greenAccent[700],
                  },
                  "&:disabled": {
                    backgroundColor: colors.grey[500],
                    color: colors.grey[300],
                  },
                }}
              >
                Create Appointment
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* New Client Modal */}
      <Modal
        open={openClientModal}
        onClose={handleCloseClientModal}
        aria-labelledby="client-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: colors.primary[400],
            border: `2px solid ${colors.grey[100]}`,
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Typography
            id="client-modal-title"
            variant="h4"
            component="h2"
            mb={3}
            color={colors.grey[100]}
          >
            Add New Client
          </Typography>
          
          {clientError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {clientError}
            </Alert>
          )}
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="full_name"
                  label="Full Name"
                  name="full_name"
                  value={newClientData.full_name}
                  onChange={(e) => handleClientInputChange('full_name', e.target.value)}
                  disabled={clientLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phone_number"
                  label="Phone Number"
                  name="phone_number"
                  value={newClientData.phone_number}
                  onChange={(e) => handleClientInputChange('phone_number', e.target.value)}
                  disabled={clientLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel 
                    sx={{ color: colors.grey[100] }}
                  >
                    Gender
                  </InputLabel>
                  <Select
                    value={newClientData.gender}
                    onChange={(e) => handleClientInputChange('gender', e.target.value)}
                    label="Gender"
                    disabled={clientLoading}
                    sx={{
                      color: colors.grey[100],
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: colors.grey[300],
                      },
                      '& .MuiSvgIcon-root': {
                        color: colors.grey[100],
                      },
                    }}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="address"
                  label="Address"
                  name="address"
                  value={newClientData.address}
                  onChange={(e) => handleClientInputChange('address', e.target.value)}
                  disabled={clientLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="birth_date"
                  label="Birth Date (DD.MM.YYYY)"
                  name="birth_date"
                  placeholder="24.06.2003"
                  value={newClientData.birth_date}
                  onChange={(e) => handleClientInputChange('birth_date', e.target.value)}
                  disabled={clientLoading}
                  helperText="Format: DD.MM.YYYY (e.g., 24.06.2003)"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: colors.grey[100],
                      '& fieldset': {
                        borderColor: colors.grey[300],
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: colors.grey[100],
                    },
                  }}
                />
              </Grid>
            </Grid>
            
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={handleCloseClientModal}
                disabled={clientLoading}
                sx={{
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": {
                    borderColor: colors.grey[100],
                    backgroundColor: colors.grey[900],
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateClient}
                disabled={clientLoading || !newClientData.full_name || !newClientData.phone_number || !newClientData.address || !newClientData.birth_date}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  "&:hover": {
                    backgroundColor: colors.greenAccent[700],
                  },
                  "&:disabled": {
                    backgroundColor: colors.grey[500],
                    color: colors.grey[300],
                  },
                }}
              >
                {clientLoading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Creating...
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonAdd />
                    Create Client
                  </Box>
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Appointment Detail Modal */}
      <Modal
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        aria-labelledby="appointment-detail-title"
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
          }}
        >
          <Typography
            id="appointment-detail-title"
            variant="h4"
            component="h2"
            mb={3}
            color={colors.grey[100]}
          >
            Appointment Details
          </Typography>
          
          {detailLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2, color: colors.grey[100] }}>
                Loading appointment details...
              </Typography>
            </Box>
          ) : selectedAppointment ? (
            <Box>
              <Grid container spacing={3}>
                {/* Client Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" color={colors.greenAccent[400]} gutterBottom>
                    Client Information
                  </Typography>
                  <Box sx={{ bgcolor: colors.primary[500], p: 2, borderRadius: 1, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Name
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedClient?.full_name || `Client ${selectedAppointment.client_id.slice(-4)}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Phone
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedClient?.phone_number || 'N/A'}
                        </Typography>
                      </Grid>
                      {selectedClient?.address && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Address
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {selectedClient.address}
                          </Typography>
                        </Grid>
                      )}
                      {selectedClient?.gender && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Gender
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]} sx={{ textTransform: 'capitalize' }}>
                            {selectedClient.gender}
                          </Typography>
                        </Grid>
                      )}
                      {selectedClient?.birth_date && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Birth Date
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {new Date(selectedClient.birth_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Doctor Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" color={colors.blueAccent[400]} gutterBottom>
                    Doctor Information
                  </Typography>
                  <Box sx={{ bgcolor: colors.primary[500], p: 2, borderRadius: 1, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Name
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedDoctor?.full_name || `Doctor ${selectedAppointment.doctor_id.slice(-4)}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Phone
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedDoctor?.phone_number || 'N/A'}
                        </Typography>
                      </Grid>
                      {selectedDoctor?.email && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Email
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {selectedDoctor.email}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Appointment Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" color={colors.grey[200]} gutterBottom>
                    Appointment Details
                  </Typography>
                  <Box sx={{ bgcolor: colors.primary[500], p: 2, borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Date & Time
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {new Date(selectedAppointment.date_time).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Duration
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {selectedAppointment.duration_minutes} minutes
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Status
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color={
                            selectedAppointment.status === 'confirmed' ? colors.blueAccent[400] :
                            selectedAppointment.status === 'cancelled' ? colors.redAccent[400] :
                            selectedAppointment.status === 'completed' ? colors.grey[400] :
                            colors.greenAccent[400]
                          }
                          sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                        >
                          {selectedAppointment.status}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color={colors.grey[300]}>
                          Created
                        </Typography>
                        <Typography variant="body1" color={colors.grey[100]}>
                          {new Date(selectedAppointment.created_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      {selectedAppointment.comment && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color={colors.grey[300]}>
                            Comment
                          </Typography>
                          <Typography variant="body1" color={colors.grey[100]}>
                            {selectedAppointment.comment}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography variant="body1" color={colors.grey[100]}>
              No appointment details available.
            </Typography>
          )}
          
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              onClick={handleCloseDetailModal}
              sx={{
                color: colors.grey[100],
                borderColor: colors.grey[400],
                "&:hover": {
                  borderColor: colors.grey[100],
                  backgroundColor: colors.grey[900],
                },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Calendar;