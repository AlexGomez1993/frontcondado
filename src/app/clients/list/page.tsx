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
  Grid,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Gift, PencilSimple, MagnifyingGlass } from '@phosphor-icons/react';

import axiosClient from '@/lib/axiosClient';
import { ClientResponse, Client } from '@/types/client';

const ClientsPage = () => {
  const router = useRouter();
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [totalPage, setTotalPage] = React.useState(1);
  const [filterType, setFilterType] = React.useState<'name' | 'ruc'>('name');
  const [filterValue, setFilterValue] = React.useState<string>('');

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchClients = async (page: number = 1) => {
    try {
      setLoading(true);
      setCurrentPage(page);

      const params: any = {
        limit: rowsPerPage,
        page,
        activo: 1,
      };

      if (filterType === 'name' && filterValue) params.search = filterValue;
      if (filterType === 'ruc' && filterValue) params.ruc = filterValue;

      const response = await axiosClient.get<ClientResponse>('/api/clientes', { params });
      setClients(response.data.data);
      setTotalPage(response.data.totalPaginas);
      setError(null);
    } catch (err) {
      console.error('Error al obtener clientes', err);
      setError('No se pudieron cargar los clientes');
      showSnackbar('No se pudieron cargar los clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    fetchClients(newPage);
  };

  const handleSearchClick = () => {
    fetchClients(1);
  };

  const handleClearFilters = () => {
    // Limpiar los filtros y volver a cargar todos los clientes
    setFilterValue('');
    setFilterType('name'); // Resetear a 'name' por defecto
  };

  // UseEffect para cargar los clientes después de limpiar los filtros
  React.useEffect(() => {
    // Solo ejecutar la búsqueda si los filtros están vacíos
    if (filterValue === '') {
      fetchClients(1);
    }
  }, [filterValue, filterType, rowsPerPage]); // Este useEffect depende de los filtros y el número de filas

  React.useEffect(() => {
    // Inicializar la lista de clientes activos al cargar
    fetchClients();
  }, [rowsPerPage]);

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
          Lista de Clientes
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      {/* Filtro y búsqueda */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {/* Select para elegir filtro: Nombre o RUC */}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Filtrar por</InputLabel>
            <Select
              value={filterType}
              onChange={(e: SelectChangeEvent<string>) => setFilterType(e.target.value as 'name' | 'ruc')}
              label="Filtrar por"
            >
              <MenuItem value="name">Nombre</MenuItem>
              <MenuItem value="ruc">RUC</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Campo de texto para ingresar el valor de búsqueda */}
        <Grid item xs={12} sm={5}>
          <TextField
            label={`Filtrar por ${filterType === 'name' ? 'nombre' : 'RUC'}`}
            variant="outlined"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        {/* Botón de búsqueda */}
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MagnifyingGlass />}
            onClick={handleSearchClick}
            fullWidth
          >
            Buscar
          </Button>
        </Grid>

        {/* Botón para borrar los filtros */}
        <Grid item xs={12} sm={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
            fullWidth
          >
            Borrar Filtro
          </Button>
        </Grid>
      </Grid>

      {/* Select para elegir filas por página */}
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Filas por página</InputLabel>
        <Select value={rowsPerPage} onChange={handleRowsPerPageChange} label="Filas por página" size="small">
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
        </Select>
      </FormControl>

      {/* Cargar y mostrar la lista de clientes */}
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
                  <TableCell>CI/RUC</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Celular</TableCell>
                  <TableCell>Editar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.nombre} {client.apellidos}</TableCell>
                    <TableCell>{client.ruc}</TableCell>
                    <TableCell>{client.direccion}</TableCell>
                    <TableCell>{client.celular}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => router.push(`/clients/edit/${client.id}`)}
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

export default ClientsPage;
