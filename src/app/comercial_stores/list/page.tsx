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
import { CheckFat, PencilSimple, PlusCircle, Prohibit, Storefront } from '@phosphor-icons/react';

import { Store, StoreResponse } from '@/types/comercial_store';
import axiosClient from '@/lib/axiosClient';

const StoresPage = () => {
  const router = useRouter();
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [stores, setStores] = React.useState<Store[]>([]);
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
        '/api/tiendas/activarTienda',
        {
          idTienda: id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      showSnackbar('Estado de la tienda actualizado con éxito', 'success');
      await fetchStores();
    } catch (error) {
      console.error('Error al cambiar estado de tienda', error);
      showSnackbar('Hubo un error al cambiar el estado de la tienda', 'error');
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<StoreResponse>('/api/tiendas', {
        params: {
          limit: rowsPerPage,
          page: currentPage,
          search: filterName,
        },
      });
      setStores(response.data.data);
      setTotalPage(response.data.totalPaginas);
      setError(null);
    } catch (err: any) {
      console.error('Error al obtener tiendas', err);
      setError('No se pudieron cargar las tiendas');
      showSnackbar('No se pudieron cargar las tiendas', 'error');
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
    fetchStores();
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
          <Storefront style={{ marginRight: 8 }} />
          Locales Comerciales
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusCircle size={20} />}
          onClick={() => router.push('/comercial_stores/create')}
        >
          Agregar Local
        </Button>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />
      <TextField
        label="Filtrar por nombre de local"
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
                  <TableCell>Cupones</TableCell>
                  <TableCell>Activo</TableCell>
                  <TableCell>Editar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.nombre}</TableCell>
                    <TableCell>{store.descripcion}</TableCell>
                    <TableCell>{store.numcupones}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => toggleActivo(store.id)}
                        variant="text"
                        color={store.activo ? 'success' : 'error'}
                      >
                        {store.activo ? <CheckFat size={24} /> : <Prohibit size={24} />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.push(`/comercial_stores/edit/${store.id}`)}
                        variant="text"
                        color="primary"
                        startIcon={<PencilSimple size={24} />}
                      />
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

export default StoresPage;
