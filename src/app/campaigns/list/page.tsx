'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CheckFat, Gift, PencilSimple, PlusCircle, Prohibit } from '@phosphor-icons/react';

import { Campaign, CampaignResponse } from '@/types/campaign';
import axiosClient from '@/lib/axiosClient';

const CampaignsPage = () => {
  const router = useRouter();
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [totalPage, setTotalPage] = React.useState(1);
  const [filterName, setFilterName] = React.useState<string>('');

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const toggleActivo = async (id: number) => {
    try {
      await axiosClient.post(
        '/api/campanias/activarCampania',
        {
          idCampania: id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      showSnackbar('Estado de la campaña actualizado con éxito', 'success');
      await fetchCampaigns();
    } catch (error) {
      console.error('Error al cambiar estado de campaña', error);
      showSnackbar('Hubo un error al cambiar el estado de la campaña', 'error');
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<CampaignResponse>('/api/campanias', {
        params: {
          limit: rowsPerPage,
          page: currentPage,
          search: filterName,
        },
      });
      setCampaigns(response.data.data);
      setTotalPage(response.data.totalPaginas);
      setError(null);
    } catch (err: any) {
      console.error('Error al obtener campañas', err);
      setError('No se pudieron cargar las campañas');
      showSnackbar('No se pudieron cargar las campañas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setCurrentPage(1);
  };

  React.useEffect(() => {
    fetchCampaigns();
  }, [currentPage, rowsPerPage, filterName]);

  return (
    <Paper sx={{ padding: 2, backgroundColor: '#f5f5f5' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Gift style={{ marginRight: 8 }} />
          Lista de Campañas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusCircle size={20} />}
          onClick={() => router.push('/campaigns/create')}
        >
          Agregar Campaña
        </Button>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />
      <TextField
        label="Filtrar por nombre de campaña"
        variant="outlined"
        value={filterName}
        onChange={handleFilterChange}
        fullWidth
        sx={{ marginBottom: 2 }}
        size="small"
      />

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Filas por página</InputLabel>
        <Select value={rowsPerPage} onChange={handleRowsPerPageChange} label="Filas por página" size="small">
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
        </Select>
      </FormControl>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Activo</TableCell>
                  <TableCell>Editar</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.nombre}</TableCell>
                    <TableCell>{campaign.descripcion}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => toggleActivo(campaign.id)}
                        variant="text"
                        color={campaign.activo ? 'success' : 'error'}
                      >
                        {campaign.activo ? <CheckFat size={24} /> : <Prohibit size={24} />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.push(`/campaigns/edit/${campaign.id}`)}
                        variant="text"
                        color="primary"
                        startIcon={<PencilSimple size={24} />}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.push(`/campaigns/addPromotions/${campaign.id}`)}
                        variant="contained"
                        color="primary"
                        startIcon={<PlusCircle size={20} />}
                        sx={{ marginRight: 1 }}
                      >
                        Promociones
                      </Button>
                      <Button
                        onClick={() => router.push(`/campaigns/addStores/${campaign.id}`)}
                        variant="contained"
                        color="secondary"
                        startIcon={<PlusCircle size={20} />}
                        sx={{ marginRight: 1 }}
                      >
                        Locales
                      </Button>
                      <Button
                        onClick={() => router.push(`/campaigns/addPayMethods/${campaign.id}`)}
                        variant="contained"
                        color="success"
                        startIcon={<PlusCircle size={20} />}
                      >
                        Formas Pago
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={totalPage}
            page={currentPage}
            onChange={handleChangePage}
            sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CampaignsPage;
