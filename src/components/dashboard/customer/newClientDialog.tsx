import { Dialog, DialogTitle, DialogContent, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions, Button, Grid, Box } from '@mui/material'
import React from 'react'
import { useEffect,useState } from 'react';
import { Cliente } from '@/app/dashboard/customers/page';
import axiosClient from '@/lib/axiosClient';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface NewClientProps {
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
}

const clienteSchema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  ciRuc: z.string().min(1),
  email: z.string().email('Correo inválido'),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().min(1, 'Requerido'),
  sexo: z.union([z.literal(1), z.literal(2)]),
  telefono: z.string().optional(),
  celular: z.string().optional(),
  provincia: z.string().min(1),
  ciudad: z.string().min(1),
});

interface Provincia {
  id: string;
  nombre: string;
}

interface Ciudad {
  id: string;
  nombre: string;
}

export const NewClientDialog = ({ openDialog, setOpenDialog, cliente, setCliente }: NewClientProps) => {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Cliente>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      ciRuc: cliente.ciRuc ? cliente.ciRuc : '1234',
      email: '',
      direccion: '',
      fechaNacimiento: '',
      sexo: 1,
      telefono: '',
      celular: '',
      provincia: '19', // Pichincha
      ciudad: '189',   // Quito
    }
  });
  useEffect(() => {
    if (cliente) {
      reset({
        ciRuc: cliente.ciRuc || '',
        provincia:'19',
        ciudad:  '189',
      });
    }
  }, [cliente, reset]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provRes, ciudadRes] = await Promise.all([
          axiosClient.get('/api/provincias'),
          axiosClient.get('/api/ciudades'),

        ]);

        setProvincias(provRes.data);
        setCiudades(ciudadRes.data);
      } catch (err) {
        console.error('Error cargando provincias o ciudades:', err);
      }
    };

    fetchData();
  }, []);
  const calcularEdad = (fecha: string): number => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const onSubmit = async (data: Cliente) => {
    try {
      const response = await axiosClient.post('/api/clientes/isla', {
        ruc: data.ciRuc,
        nombre: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        direccion: data.direccion,
        fecha_nacimiento: data.fechaNacimiento,
        telefono: data.telefono || "022222222",
        celular: data.celular,
        ciudad_id: data.ciudad,
        provincia_id: data.provincia,
        sexo: data.sexo,
        edad: calcularEdad(data.fechaNacimiento),
      });

      if (response.data) {
        alert('Cliente guardado correctamente');
        setCliente(data)
        setOpenDialog(false);
        reset(); // limpia el formulario
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
      <DialogTitle>Nuevo Cliente</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="nombres"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombres"
                  fullWidth
                  size="small"
                  error={!!errors.nombres}
                  helperText={errors.nombres?.message}
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
                  label="Apellidos"
                  fullWidth
                  size="small"
                  error={!!errors.apellidos}
                  helperText={errors.apellidos?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="ciRuc"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="C.I./R.U.C."
                  fullWidth
                  size="small"
                  disabled
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="E-mail"
                  fullWidth
                  size="small"
                  error={!!errors.email}
                  helperText={errors.email?.message}
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
                  label="Dirección/Sector"
                  fullWidth
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
              name="sexo"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.sexo}>
                  <InputLabel id="sexo-label">Sexo</InputLabel>
                  <Select {...field} labelId="sexo-label" label="Sexo">
                    <MenuItem value={1}>Masculino</MenuItem>
                    <MenuItem value={2}>Femenino</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Teléfono" fullWidth size="small" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="celular"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Celular" fullWidth size="small" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
          <Controller
              name="provincia"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel id="provincia-label">Provincia</InputLabel>
                  <Select {...field} labelId="provincia-label" label="Provincia">
                    {provincias.map((prov) => (
                      <MenuItem key={prov.id} value={prov.id}>{prov.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
          <Controller
              name="ciudad"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel id="ciudad-label">Ciudad</InputLabel>
                  <Select {...field} labelId="ciudad-label" label="Ciudad">
                    {ciudades.map((ciudad) => (
                      <MenuItem key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};