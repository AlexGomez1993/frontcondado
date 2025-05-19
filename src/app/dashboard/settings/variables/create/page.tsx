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
  SelectChangeEvent,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { PlusCircle } from '@phosphor-icons/react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';

const schema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  valor: z.coerce.number().min(0, 'El valor es requerido'),
  valoractual: z.coerce.number().min(0, 'El valor actual es requerido'),
  tipo: z.string().optional(),
  idCampania: z.number().optional(),
});

type VariableForm = z.infer<typeof schema>;

interface Campania {
  id: number;
  nombre: string;
}

const CreateVariablePage = () => {
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [mostrarCampos, setMostrarCampos] = React.useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = React.useState('');
  const [campanias, setCampanias] = React.useState<Campania[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VariableForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      descripcion: '',
      nombre: '',
      valor: 0,
      valoractual: 0,
      tipo: '',
      idCampania: undefined,
    },
  });

  const descripcionValue = watch('descripcion');
  const tipoValue = watch('tipo');

  const handleDescripcionChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setValue('descripcion', value);
    setMostrarCampos(value === 'secuenciales');
  };

  const handleTipoChange = async (e: SelectChangeEvent) => {
    const tipo = e.target.value;
    setTipoSeleccionado(tipo);
    setValue('tipo', tipo);

    if (tipo === 'campaña') {
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
    }
  };

  const onSubmit = async (data: VariableForm) => {
    try {
      await axiosClient.post('/api/variables', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      setSnackbarType('success');
      setSnackbarMsg('Variable creada con éxito');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al crear la variable');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
          Crear Variable
        </Typography>

        <Divider sx={{ marginBottom: 2 }} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Descripción</InputLabel>
            <Select
              value={descripcionValue}
              label="Descripción"
              onChange={handleDescripcionChange}
              error={!!errors.descripcion}
            >
              <MenuItem value="secuenciales">Secuenciales</MenuItem>
            </Select>
          </FormControl>

          {mostrarCampos && (
            <>
              <TextField
                label="Nombre de la Variable"
                fullWidth
                margin="normal"
                {...register('nombre')}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                size="small"
              />

              <TextField
                label="Valor"
                fullWidth
                margin="normal"
                type="number"
                {...register('valor', { valueAsNumber: true })}
                error={!!errors.valor}
                helperText={errors.valor?.message}
                size="small"
              />

              <TextField
                label="Valor Actual"
                fullWidth
                margin="normal"
                type="number"
                {...register('valoractual', { valueAsNumber: true })}
                error={!!errors.valoractual}
                helperText={errors.valoractual?.message}
                size="small"
              />

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Tipo</InputLabel>
                <Select value={tipoValue || ''} label="Tipo" onChange={handleTipoChange} error={!!errors.tipo}>
                  <MenuItem value="campaña">Campaña</MenuItem>
                </Select>
              </FormControl>

              {tipoSeleccionado === 'campaña' && (
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Campaña</InputLabel>
                  <Controller
                    name="idCampania"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Campaña" error={!!errors.idCampania}>
                        {campanias.map((campania) => (
                          <MenuItem key={campania.id} value={campania.id}>
                            {campania.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.idCampania && (
                    <Typography variant="body2" color="error">
                      {errors.idCampania.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            </>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={isSubmitting}>
            Crear Variable
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

export default CreateVariablePage;
