import { Box, useTheme, CircularProgress, Alert, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { useApi } from "../../hooks/useApi";
import API_CONFIG from "../../config/api";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const api = useApi();
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(50);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "full_name",
      headerName: "Full Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone_number",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 0.5,
      renderCell: ({ row: { gender } }) => {
        return (
          <Chip
            label={gender || 'N/A'}
            color={gender === 'male' ? 'primary' : gender === 'female' ? 'secondary' : 'default'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        );
      },
    },
    {
      field: "birth_date",
      headerName: "Birth Date",
      flex: 1,
      renderCell: ({ row: { birth_date } }) => formatDate(birth_date),
    },
  ];

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.USERS.CLIENTS}?offset=${offset}&limit=${limit}`);
      
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
  }, [offset]);

  const handleRowClick = (params) => {
    navigate(`/clients/${params.id}`);
  };

  return (
    <Box m="20px">
      <Header
        title="CLIENTS"
        subtitle="Manage and view client information"
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading clients data: {error}
        </Alert>
      )}
      
      <Box
        m="40px 0 0 0"
        height="75vh"
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
    </Box>
  );
};

export default Contacts;