'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Container, Divider, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { PlusCircle } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';

// Esquema de validación con Zod
const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  numcupones: z.number().min(1, 'El valor de cupones debe ser al menos 1'),
});

type StoreForm = z.infer<typeof schema>;

const StoreEditPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [store, setStore] = React.useState<StoreForm | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<StoreForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      numcupones: 1,
    },
  });

  React.useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axiosClient.get(`/api/tiendas/${id}`);
        const storeData = response.data.tienda;
        setStore(storeData);
        setValue('nombre', storeData.nombre);
        setValue('descripcion', storeData.descripcion);
        setValue('numcupones', storeData.numcupones);
      } catch (error) {
        console.error('Error al cargar la tienda:', error);
      }
    };

    fetchStoreData();
  }, [id, setValue]);

  const onSubmit = async (data: StoreForm) => {
    try {
      await axiosClient.put(`/api/tiendas/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSnackbarType('success');
      setSnackbarMsg('Tienda actualizada con éxito');
      router.push('/comercial_stores/list');
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al actualizar la tienda');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!store) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 4 }}>
          Cargando tienda...
        </Typography>
      </Container>
    );
  }

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
          Editar Local
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            {...register('nombre')}
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
            size="small"
          />

          <TextField
            label="Descripción"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            {...register('descripcion')}
            error={!!errors.descripcion}
            helperText={errors.descripcion?.message}
            size="small"
          />

          <TextField
            label="Cupones"
            fullWidth
            margin="normal"
            type="number"
            {...register('numcupones', {
              valueAsNumber: true,
            })}
            error={!!errors.numcupones}
            helperText={errors.numcupones?.message}
            size="small"
          />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={isSubmitting}>
            Actualizar Local
          </Button>
        </form>
      </Paper>

      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StoreEditPage;
