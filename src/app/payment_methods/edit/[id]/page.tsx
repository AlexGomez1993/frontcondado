'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Container, Divider, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  factor: z.number().min(1, 'El factor es requerido'),
});

type PaymentMethodsForm = z.infer<typeof schema>;

const PromotionEditPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [paymentMethod, setPaymentMethodData] = React.useState<PaymentMethodsForm | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentMethodsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      factor: 1,
    },
  });

  React.useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await axiosClient.get(`/api/formasPago/${id}`);
        const data = response.data.formaPago;

        setPaymentMethodData(data);
        setValue('nombre', data.nombre);
        setValue('descripcion', data.descripcion);
        setValue('factor', data.factor);
      } catch (err) {
        console.error('Error al obtener la forma de pago', err);
      }
    };

    fetchPromotion();
  }, [id, setValue]);

  const onSubmit = async (data: PaymentMethodsForm) => {
    try {
      await axiosClient.put(`/api/formasPago/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSnackbarType('success');
      setSnackbarMsg('Forma de pago editada con éxito');
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al editar la forma de pago');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    router.push('/payment_methods/list');
  };

  if (!paymentMethod) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" color="error">
          Cargando forma de pago...
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
          <PencilSimple style={{ marginRight: 8 }} />
          Editar Forma de Pago
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
            onChange={(e) => setValue('nombre', e.target.value.toUpperCase())}
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
            onChange={(e) => setValue('descripcion', e.target.value.toUpperCase())}
          />

          <TextField
            label="Monto Mínimo"
            fullWidth
            margin="normal"
            type="number"
            {...register('factor', {
              valueAsNumber: true,
            })}
            error={!!errors.factor}
            helperText={errors.factor?.message}
            size="small"
          />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={isSubmitting}>
            Guardar Cambios
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

export default PromotionEditPage;
