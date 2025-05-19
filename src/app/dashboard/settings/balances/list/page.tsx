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
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CurrencyDollarSimple, PencilSimple, PlusCircle } from '@phosphor-icons/react';

import { Balance, BalanceResponse } from '@/types/balance';
import axiosClient from '@/lib/axiosClient';

const BalancePage = () => {
  const router = useRouter();
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [saldos, setSaldos] = React.useState<Balance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [totalPage, setTotalPage] = React.useState(1);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const fetchSaldos = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<BalanceResponse>('/api/configSaldos', {
        params: {
          limit: rowsPerPage,
          page: currentPage,
        },
      });
      setSaldos(response.data.data);
      setTotalPage(response.data.totalPaginas);
      setError(null);
    } catch (err: any) {
      console.error('Error al obtener saldos', err);
      setError('No se pudieron cargar los saldos');
      showSnackbar('No se pudieron cargar los saldos', 'error');
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

  React.useEffect(() => {
    fetchSaldos();
  }, [currentPage, rowsPerPage]);

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
          <CurrencyDollarSimple style={{ marginRight: 8 }} />
          Lista de Saldos
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusCircle size={20} />}
          onClick={() => router.push('/dashboard/settings/balances/create')}
        >
          Agregar Saldo
        </Button>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Filas por página</InputLabel>
        <Select value={rowsPerPage} onChange={handleRowsPerPageChange} label="Filas por página" size="small">
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ textAlign: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Campaña</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Descripción</strong>
                  </TableCell>
                  {/*                   <TableCell>
                    <strong>Editar</strong>
                  </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {saldos.map((saldo) => (
                  <TableRow key={saldo.id}>
                    <TableCell>{saldo.campanias?.nombre ?? '—'}</TableCell>
                    <TableCell>{saldo.observacion}</TableCell>
                    {/* <TableCell>
                      <Button
                        onClick={() => router.push(`/dashboard/settings/balances/edit/${saldo.id}`)}
                        variant="text"
                        color="primary"
                        startIcon={<PencilSimple size={20} />}
                      >
                        Editar
                      </Button>
                    </TableCell> */}
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

export default BalancePage;
