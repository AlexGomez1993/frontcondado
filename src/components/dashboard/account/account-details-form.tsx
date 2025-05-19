'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import bcrypt from 'bcryptjs';

import axiosClient from '@/lib/axiosClient';
import { useUser } from '@/hooks/use-user';

export function AccountDetailsForm(): React.JSX.Element {
  const { user, isLoading } = useUser();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');

  const [nombre, setNombre] = React.useState(user?.nombre || '');
  const [apellidos, setApellidos] = React.useState(user?.apellidos || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [celular, setCelular] = React.useState(user?.celular || '');
  const [telefono, setTelefono] = React.useState(user?.telefono || '');
  const [direccion, setDireccion] = React.useState(user?.direccion || '');

  const handleSaveDetails = async () => {
    if (!user?.id) return;

    const formData = {
      nombre,
      apellidos,
      email,
      celular,
      telefono,
      direccion
    };

    try {
      await axiosClient.put(`/api/clientes/${user.id}`, formData);
      setSnackbarType('success');
      setSnackbarMsg('Detalles actualizados correctamente');
    } catch (error) {
      console.error(error);
      setSnackbarType('error');
      setSnackbarMsg('Error al actualizar los detalles');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handlePasswordChange = async () => {
    if (!user?.id) return;

    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas no coinciden');
      setSnackbarType('error');
      setSnackbarMsg('Las contraseñas no coinciden');
      setSnackbarOpen(true);
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.contrasena as string);

    if (!passwordMatch) {
      setError('La contraseña actual es incorrecta');
      setSnackbarType('error');
      setSnackbarMsg('La contraseña actual es incorrecta');
      setSnackbarOpen(true);
      return;
    }

    try {
      await axiosClient.post('/api/clientes/cambioContrasenia', {
        cliente_id: user.id,
        nuevaContrasena: newPassword,
      });

      setSnackbarType('success');
      setSnackbarMsg('Contraseña cambiada exitosamente');
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al cambiar la contraseña');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ minHeight: '200px' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Card>
          <CardHeader subheader="Información Personal" title="Perfil" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel shrink>Nombres</InputLabel>
                  <OutlinedInput
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    label="Nombres"
                    name="firstName"
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel shrink>Apellidos</InputLabel>
                  <OutlinedInput
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    label="Apellidos"
                    name="lastName"
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel shrink>Correo Electrónico</InputLabel>
                  <OutlinedInput
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Correo Electrónico"
                    name="email"
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel shrink>Número Celular</InputLabel>
                  <OutlinedInput
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    label="Número Celular"
                    name="phone"
                    type="tel"
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel shrink>Teléfono Fijo</InputLabel>
                  <OutlinedInput
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    label="Teléfono Fijo"
                    name="telefono"
                    type="tel"
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel shrink>Dirección</InputLabel>
                  <OutlinedInput
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    label="Dirección"
                    name="direccion"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSaveDetails}>
              Guardar
            </Button>
            <Button variant="outlined" onClick={() => setOpenDialog(true)}>
              Cambiar Contraseña
            </Button>
          </CardActions>
        </Card>
      </form>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            label="Contraseña Actual"
            type="password"
            fullWidth
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            helperText={error}
            error={!!error}
          />
          <TextField
            label="Nueva Contraseña"
            type="password"
            fullWidth
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Confirmar Nueva Contraseña"
            type="password"
            fullWidth
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handlePasswordChange} color="primary">
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
