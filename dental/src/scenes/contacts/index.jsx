import { Box, useTheme, CircularProgress, Alert, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, Select, Grid, useMediaQuery } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ruRU } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Header from "../../components/Header";
import { useApi } from "../../hooks/useApi";
import API_CONFIG from "../../config/api";
import { translations, translateGender } from "../../utils/translations";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const api = useApi();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    gender: '',
    birth_date: '',
  });
  const [newClientData, setNewClientData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    gender: 'male',
    birth_date: '',
  });
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return translations.notSpecified;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditFormData({
      full_name: client.full_name || '',
      phone_number: client.phone_number || '',
      address: client.address || '',
      gender: client.gender || '',
      birth_date: client.birth_date ? dayjs(client.birth_date) : null,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const formattedData = {
        ...editFormData,
        birth_date: editFormData.birth_date
          ? editFormData.birth_date.format('DD.MM.YYYY')
          : null
      };

      const response = await api.put(
        `${API_CONFIG.ENDPOINTS.USERS.BASE}/${selectedClient.id}`,
        formattedData
      );

      if (response.ok) {
        setEditDialogOpen(false);
        fetchClients();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update client');
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to update client:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(
        `${API_CONFIG.ENDPOINTS.USERS.BASE}/${selectedClient.id}`
      );

      if (response.ok) {
        setDeleteDialogOpen(false);
        fetchClients();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete client');
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete client:', err);
    }
  };

  const handleAddClientClick = () => {
    setNewClientData({
      full_name: '',
      phone_number: '',
      address: '',
      gender: 'male',
      birth_date: '',
    });
    setClientError(null);
    setAddDialogOpen(true);
  };

  const handleCreateClient = async () => {
    setClientLoading(true);
    setClientError(null);

    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.USERS.CLIENTS, newClientData);

      if (response.ok) {
        const data = await response.json();
        setAddDialogOpen(false);
        setNewClientData({
          full_name: '',
          phone_number: '',
          address: '',
          gender: 'male',
          birth_date: '',
        });
        fetchClients();
      } else {
        const errorData = await response.json();
        setClientError(errorData.message || 'Failed to create client');
      }
    } catch (err) {
      setClientError(err.message);
      console.error('Failed to create client:', err);
    } finally {
      setClientLoading(false);
    }
  };

  const handleClientInputChange = (field, value) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: isMobile ? 0.3 : 0.5,
      minWidth: isMobile ? 50 : 70
    },
    {
      field: "full_name",
      headerName: translations.fullName,
      flex: isMobile ? 1.5 : 1,
      minWidth: isMobile ? 120 : 150,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone_number",
      headerName: translations.phoneNumber,
      flex: 1,
      minWidth: isMobile ? 100 : 120,
      hide: isMobile, // Hide on mobile to save space
    },
    {
      field: "address",
      headerName: translations.address,
      flex: 1,
      minWidth: isMobile ? 100 : 150,
      hide: isMobile, // Hide on mobile to save space
    },
    {
      field: "gender",
      headerName: translations.gender,
      flex: isMobile ? 0.8 : 0.5,
      minWidth: isMobile ? 70 : 80,
      renderCell: ({ row: { gender } }) => {
        return (
          <Chip
            label={translateGender(gender)}
            color={gender === 'male' ? 'primary' : gender === 'female' ? 'secondary' : 'default'}
            size="small"
            sx={{
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              height: isMobile ? '20px' : '24px'
            }}
          />
        );
      },
    },
    {
      field: "birth_date",
      headerName: translations.birthDate,
      flex: 1,
      minWidth: isMobile ? 90 : 120,
      renderCell: ({ row: { birth_date } }) => formatDate(birth_date),
    },
    {
      field: "actions",
      headerName: translations.actions,
      flex: isMobile ? 0.8 : 0.5,
      minWidth: isMobile ? 60 : 80,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={isMobile ? "4px" : "8px"}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
            sx={{
              color: colors.greenAccent[400],
              p: isMobile ? 0.5 : 1
            }}
            size={isMobile ? "small" : "medium"}
          >
            <EditOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            sx={{
              color: colors.redAccent[400],
              p: isMobile ? 0.5 : 1
            }}
            size={isMobile ? "small" : "medium"}
          >
            <DeleteOutlineIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.USERS.CLIENTS}?offset=${offset}&limit=${limit}&q=${debouncedQuery}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.data?.clients) {
          setClientsData(data.data.clients);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, debouncedQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);


  const handleRowClick = (params) => {
    navigate(`/clients/${params.id}`);
  };

  return (
    <Box m={isMobile ? "10px" : "20px"}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        mb="20px"
        sx={{
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0
        }}
      >
        <Header
          title={translations.contactsTitle}
          subtitle={translations.contactsSubtitle}
        />
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
            variant="outlined"
            size="small"
            placeholder="Поиск клиентов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: isMobile ? "100%" : "300px",
              backgroundColor: colors.primary[400],
              input: { color: colors.grey[100] },
              '& .MuiOutlinedInput-root fieldset': {
                borderColor: colors.grey[300],
              },
              '& .MuiOutlinedInput-root:hover fieldset': {
                borderColor: colors.greenAccent[400],
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClientClick}
            fullWidth={isMobile}
            sx={{
              backgroundColor: colors.greenAccent[600],
              fontSize: isMobile ? "12px" : "14px",
              padding: isMobile ? "8px 16px" : "6px 16px",
              '&:hover': {
                backgroundColor: colors.greenAccent[700],
              },
            }}
          >
            {isMobile ? "Добавить клиента" : "Добавить нового клиента"}
          </Button>
        </Box>
      </Box>


      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {translations.error}: {error}
        </Alert>
      )}

      <Box
        m={isMobile ? "20px 0 0 0" : "40px 0 0 0"}
        height={isMobile ? "calc(100vh - 200px)" : "75vh"}
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={clientsData}
            columns={columns}
            getRowId={(row) => row.id}
            onRowClick={handleRowClick}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: colors.primary[300] + '20',
                },
              },
            }}
          />
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400] }}>{translations.editClientTitle}</DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
          <TextField
            fullWidth
            label={translations.fullName}
            value={editFormData.full_name}
            onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={translations.phoneNumber}
            value={editFormData.phone_number}
            onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label={translations.address}
            value={editFormData.address}
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            margin="normal"
          />
          <FormControl component="fieldset" margin="normal" fullWidth>
            <FormLabel component="legend" sx={{ color: colors.grey[100] }}>{translations.gender}</FormLabel>
            <RadioGroup
              row
              value={editFormData.gender}
              onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
            >
              <FormControlLabel value="male" control={<Radio />} label={translations.male} />
              <FormControlLabel value="female" control={<Radio />} label={translations.female} />
            </RadioGroup>
          </FormControl>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="ru"
            localeText={ruRU.components.MuiLocalizationProvider.defaultProps.localeText}
          >
            <DatePicker
              label={translations.birthDate}
              value={editFormData.birth_date}
              onChange={(newValue) => setEditFormData({ ...editFormData, birth_date: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal"
                }
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: colors.grey[100] }}>
            {translations.cancel}
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" sx={{ backgroundColor: colors.greenAccent[600] }}>
            {translations.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
          Добавить нового клиента
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
          {clientError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {clientError}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="full_name"
                label="Полное имя"
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

            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="phone_number"
                label="Номер телефона"
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
                  Пол
                </InputLabel>
                <Select
                  value={newClientData.gender}
                  onChange={(e) => handleClientInputChange('gender', e.target.value)}
                  label="Пол"
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
                  <MenuItem value="male">Мужской</MenuItem>
                  <MenuItem value="female">Женский</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="birth_date"
                label="Дата рождения (ДД.ММ.ГГГГ)"
                name="birth_date"
                placeholder="24.06.2003"
                value={newClientData.birth_date}
                onChange={(e) => handleClientInputChange('birth_date', e.target.value)}
                disabled={clientLoading}
                helperText="Формат: ДД.ММ.ГГГГ (например, 24.06.2003)"
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
                  '& .MuiFormHelperText-root': {
                    color: colors.grey[300],
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="address"
                label="Адрес"
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400], p: 3 }}>
          <Button
            onClick={() => setAddDialogOpen(false)}
            variant="outlined"
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
            Отмена
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
                Создание...
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <PersonAdd />
                Создать клиента
              </Box>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.primary[400] }}>{translations.deleteClientTitle}</DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400], pt: 2 }}>
          <Alert severity="warning">
            {translations.deleteClientConfirm} <strong>{selectedClient?.full_name}</strong>?
            {translations.thisActionCannotBeUndone}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: colors.grey[100] }}>
            {translations.cancel}
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" sx={{ backgroundColor: colors.redAccent[600] }}>
            {translations.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;