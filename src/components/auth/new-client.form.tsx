'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import axiosClient from '@/lib/axiosClient';

type NewClientFormProps = {
  open: boolean;
  onClose: () => void;
  ciRuc: string;
  setClienteState: any;
  onSubmitAfterCreate: any;
};
const newClientSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios'),
  email: z.string().email('El correo electrónico no es válido').min(1, 'El correo electrónico es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  genero: z.number().min(1, 'Selecciona un género'),
  telefono: z.string().optional(),
  celular: z.string().min(1, 'El celular es obligatorio'),
  provincia_id: z.number().min(1, 'Selecciona una provincia'),
  ciudad_id: z.number().min(1, 'Selecciona una ciudad'),
  contrasena: z.string().min(1, 'La contraseña es obligatoria'),
});
type NewClientFormValues = z.infer<typeof newClientSchema>;

export function NewClientForm({
  open,
  onClose,
  ciRuc,
  setClienteState,
  onSubmitAfterCreate,
}: NewClientFormProps): React.JSX.Element {
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');

  const [provincias, setProvincias] = React.useState([]);
  const [ciudades, setCiudades] = React.useState([]);

  // Use React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      nombre: '',
      apellidos: '',
      email: '',
      direccion: '',
      fechaNacimiento: '',
      genero: 0,
      telefono: '',
      celular: '',
      provincia_id: 19,
      ciudad_id: 189,
      contrasena: '',
    },
  });

  const handleChange = (field: string, value: string | number) => {
    // Handle form data changes
  };

  const onSubmit = async (data: NewClientFormValues) => {
    try {
      const requestBody = {
        ...data,
        ruc: ciRuc,
        fecha_nacimiento: data.fechaNacimiento,
        sexo: data.genero,
        telefono: data.telefono || '0222222222',
      };

      const response = await axiosClient.post('/api/auth/ingresarClienteWeb', requestBody);

      if (response.status === 201) {
        setSnackbarType('success');
        setSnackbarMsg('Cliente registrado con éxito');
        setSnackbarOpen(true);

        setTimeout(() => {
          setClienteState(3);
          onClose(); // close modal
        }, 1500);

        await onSubmitAfterCreate({ ruc: ciRuc, password: data.contrasena });
      } else {
        throw new Error('Error en la respuesta');
      }
    } catch (error) {
      console.error(error);
      setSnackbarType('error');
      setSnackbarMsg('Error al registrar el cliente');
      setSnackbarOpen(true);
    }
  };

  // Fetch provinces and cities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const provinciasResponse = await axiosClient.get('/api/provincias');
        setProvincias(provinciasResponse.data);

        const ciudadesResponse = await axiosClient.get('/api/ciudades', {
          params: { provincia_id: 19 }, // Puedes cambiar la provincia_id si necesitas
        });
        setCiudades(ciudadesResponse.data);
      } catch (error) {
        console.error('Error fetching provincias/ciudades', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Registro de Nuevo Cliente</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nombres"
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="apellidos"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Apellidos"
                  error={!!errors.apellidos}
                  helperText={errors.apellidos?.message}
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="C.I./R.U.C." value={ciRuc} disabled size="small"/>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="E-mail"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="direccion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Dirección/Sector"
                  error={!!errors.direccion}
                  helperText={errors.direccion?.message}
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="fechaNacimiento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Fecha Nacimiento"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fechaNacimiento}
                  helperText={errors.fechaNacimiento?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="genero"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.genero}>
                  <InputLabel id="sexo-label">Sexo</InputLabel>
                  <Select {...field} labelId="sexo-label" label="Sexo">
                    <MenuItem value={0}>Seleccione...</MenuItem>
                    <MenuItem value={1}>Masculino</MenuItem>
                    <MenuItem value={2}>Femenino</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
            {errors.genero && (
              <Typography variant="caption" color="error">
                {errors.genero.message}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Teléfono"
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message}
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="celular"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Celular"
                  error={!!errors.celular}
                  helperText={errors.celular?.message}
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="provincia_id"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth size="small">
                  {provincias.map((provincia: any) => (
                    <MenuItem key={provincia.id} value={provincia.id}>
                      {provincia.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.provincia_id && (
              <Typography variant="caption" color="error">
                {errors.provincia_id.message}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="ciudad_id"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth size="small">
                  {ciudades.map((ciudad: any) => (
                    <MenuItem key={ciudad.id} value={ciudad.id}>
                      {ciudad.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.ciudad_id && (
              <Typography variant="caption" color="error">
                {errors.ciudad_id.message}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="contrasena"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Contraseña"
                  type="password"
                  error={!!errors.contrasena}
                  helperText={errors.contrasena?.message}
                  size="small"
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} size="small" variant='outlined'>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} size="small">
          Guardar
        </Button>
      </DialogActions>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
