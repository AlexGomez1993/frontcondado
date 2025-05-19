'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Container, Divider, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { PencilSimple } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  logo: z.string().min(1, 'El logo es requerido'),
});

type CampaignForm = z.infer<typeof schema>;

const CampaignEditPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params; // ID de la campaña que se pasa desde la URL
  const [logoPreview, setLogoPreview] = React.useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [campaignData, setCampaignData] = React.useState<CampaignForm | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CampaignForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      logo: '',
    },
  });
  React.useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axiosClient.get(`/api/campanias/${id}`);
        const data = response.data.campania;
        setCampaignData(data);
        setLogoPreview(data.logo);
        setValue('nombre', data.nombre);
        setValue('descripcion', data.descripcion);
        setValue('logo', data.logo);
      } catch (err) {
        console.error('Error al obtener la campaña', err);
      }
    };

    fetchCampaign();
  }, [id, setValue]);

  const onSubmit = async (data: CampaignForm) => {
    try {
      await axiosClient.put(`/api/campanias/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSnackbarType('success');
      setSnackbarMsg('Campaña editada con éxito');
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al editar la campaña');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);
    try {
      const response = await axiosClient.post('/api/upload/uploadImage?folder=campanias/logos', formData);
      const imageUrl = response.data.url;
      setValue('logo', imageUrl);
      setLogoPreview(imageUrl);
    } catch (err) {
      console.error('Error al subir imagen', err);
      setSnackbarType('error');
      setSnackbarMsg('Error al subir el logo');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    router.push('/campaigns/list');
  };

  if (!campaignData) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" color="error">
          Cargando campaña...
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
          Editar Campaña
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

          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Cambiar Logo
            <input hidden type="file" accept="image/*" onChange={handleLogoChange} />
          </Button>

          {logoPreview && (
            <Box mt={2}>
              <Typography variant="subtitle2">Vista previa del logo:</Typography>
              <img
                src={process.env.NEXT_PUBLIC_API_URL + logoPreview}
                alt="Logo"
                style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
              />
            </Box>
          )}

          {errors.logo && (
            <Typography color="error" variant="body2">
              {errors.logo.message}
            </Typography>
          )}

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

export default CampaignEditPage;
