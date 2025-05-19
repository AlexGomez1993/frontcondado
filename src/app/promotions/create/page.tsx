'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Container, Divider, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { PlusCircle } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  montominimo: z.string().min(1, 'El monto mínimo es requerido'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
});

type PromotionForm = z.infer<typeof schema>;

const PromotionCreatePage = () => {
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [promotionCreated, setPromotionCreated] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PromotionForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      montominimo: '',
      fecha_inicio: '',
      fecha_fin: '',
    },
  });

  const onSubmit = async (data: PromotionForm) => {
    try {
      await axiosClient.post('/api/promociones', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSnackbarType('success');
      setSnackbarMsg('Promoción creada con éxito');
      setPromotionCreated(true);
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al crear la promoción');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    if (promotionCreated) {
      router.push('/promotions/list');
    }
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
          Crear Nueva Promoción
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
            label="Monto Mínimo"
            fullWidth
            margin="normal"
            type="number"
            {...register('montominimo')}
            error={!!errors.montominimo}
            helperText={errors.montominimo?.message}
            size="small"
          />

          <TextField
            label="Fecha de Inicio"
            fullWidth
            margin="normal"
            type="datetime-local"
            {...register('fecha_inicio')}
            error={!!errors.fecha_inicio}
            helperText={errors.fecha_inicio?.message}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />

          <TextField
            label="Fecha de Fin"
            fullWidth
            margin="normal"
            type="datetime-local"
            {...register('fecha_fin')}
            error={!!errors.fecha_fin}
            helperText={errors.fecha_fin?.message}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={isSubmitting}>
            Crear Promoción
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

export default PromotionCreatePage;
