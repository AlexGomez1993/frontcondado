'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Typography,
} from '@mui/material';
import { PlusCircle } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';
import { useUser } from '@/hooks/use-user';

const schema = z.object({
  descripcion: z.enum(['1', '2']),
  campania_id: z.number({ invalid_type_error: 'Selecciona una campaña válida' }),
});

type BalanceForm = z.infer<typeof schema>;

interface Campania {
  id: number;
  nombre: string;
}

const CreateBalancePage = () => {
  const router = useRouter();
  const [campanias, setCampanias] = React.useState<Campania[]>([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const { user, error, isLoading } = useUser();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BalanceForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      descripcion: '1',
      campania_id: undefined,
    },
  });

  const descripcionValue = watch('descripcion');

  React.useEffect(() => {
    const fetchCampanias = async () => {
      try {
        const res = await axiosClient.get('/api/campanias', {
          params: { activo: 1 },
        });
        setCampanias(res.data.data || []);
      } catch (err) {
        console.error('Error cargando campañas activas', err);
        setSnackbarType('error');
        setSnackbarMsg('No se pudieron cargar las campañas activas');
        setSnackbarOpen(true);
      }
    };
    fetchCampanias();
  }, []);

  const onSubmit = async (data: BalanceForm) => {
    const payload = {
      observacion: descripcionValue === '1' ? 'Saldo Acumulable' : 'No acumular Saldo',
      descripcion: Number(data.descripcion),
      user: user?.id,
      campania_id: data.campania_id,
    };

    try {
      await axiosClient.post('/api/configSaldos', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setSnackbarType('success');
      setSnackbarMsg('Saldo creado con éxito');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al crear el saldo');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    router.push('/dashboard/settings/balances/list');
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4, backgroundColor: '#f5f5f5' }}>
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
          <PlusCircle style={{ marginRight: 8 }} />
          Crear Saldo
        </Typography>

        <Divider sx={{ marginBottom: 2 }} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormControl fullWidth margin="normal" size="small" error={!!errors.campania_id}>
            <InputLabel>Campaña</InputLabel>
            <Controller
              name="campania_id"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Campaña">
                  {campanias.map((campania) => (
                    <MenuItem key={campania.id} value={campania.id}>
                      {campania.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.campania_id && (
              <Typography variant="body2" color="error">
                {errors.campania_id.message}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal" size="small" error={!!errors.descripcion}>
            <InputLabel>Descripción</InputLabel>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Descripción">
                  <MenuItem value="1">Saldo Acumulable</MenuItem>
                  <MenuItem value="2">No acumular Saldo</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={isSubmitting}>
            Crear Saldo
          </Button>
        </form>
      </Paper>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateBalancePage;
