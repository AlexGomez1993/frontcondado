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
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axiosClient from '@/lib/axiosClient';

const schema = z.object({
  nombres: z.string().min(1, 'El nombre es requerido'),
  apellidos: z.string().min(1, 'El apellido es requerido'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  celular: z.string().min(1, 'El celular es requerido'),
  telefono: z.string().optional(),
  email: z.string().email('El correo electrónico no es válido').min(1, 'El correo electrónico es obligatorio'),
});

type ClientForm = z.infer<typeof schema>;

const ClientEditPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [clientData, setClientData] = React.useState<ClientForm | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      direccion: '',
      celular: '',
      telefono: '',
      email: '',
    },
  });

  // Obtener cliente existente
  React.useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axiosClient.get(`/api/clientes/${id}`);
        const data = response.data.clienteExistente;
        setClientData(data);
        // Rellenar campos
        setValue('nombres', data.nombre);
        setValue('apellidos', data.apellidos);
        setValue('direccion', data.direccion);
        setValue('celular', data.celular);
        setValue('telefono', data.telefono);
        setValue('email', data.email);
      } catch (err) {
        console.error('Error al obtener el cliente', err);
      }
    };

    fetchClient();
  }, [id, setValue]);

  // Envío del formulario
  const onSubmit = async (data: ClientForm) => {
    try {
      await axiosClient.put(`/api/clientes/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSnackbarType('success');
      setSnackbarMsg('Cliente editado con éxito');
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al editar el cliente');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    router.push('/clients/list');
  };

  if (!clientData) {
    return (
      <Container maxWidth="sm">
        <Typography variant="body1" color="text.secondary" mt={4}>
          Cargando información del cliente...
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
          Editar Cliente
        </Typography>

        <Divider sx={{ marginBottom: 2, mt: 1 }} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Nombres"
            fullWidth
            margin="normal"
            {...register('nombres')}
            error={!!errors.nombres}
            helperText={errors.nombres?.message}
            size="small"
          />

          <TextField
            label="Apellidos"
            fullWidth
            margin="normal"
            {...register('apellidos')}
            error={!!errors.apellidos}
            helperText={errors.apellidos?.message}
            size="small"
          />

          <TextField
            label="Dirección"
            fullWidth
            margin="normal"
            {...register('direccion')}
            error={!!errors.direccion}
            helperText={errors.direccion?.message}
            size="small"
          />

          <TextField
            label="Celular"
            fullWidth
            margin="normal"
            {...register('celular')}
            error={!!errors.celular}
            helperText={errors.celular?.message}
            size="small"
          />

          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            {...register('telefono')}
            error={!!errors.telefono}
            helperText={errors.telefono?.message}
            size="small"
          />

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            size="small"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={isSubmitting}
          >
            Guardar Cambios
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarType}
          sx={{ width: '100%' }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClientEditPage;
