'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';

import axiosClient from '@/lib/axiosClient';
import { PaymentMethod } from '@/types/payment_method';

const AddPayMethodsToCampaignPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [paymentMethodsIds, setPaymentMethodsIds] = React.useState<number[]>([]);
  const [eliminarFormasPagoIds, setEliminarFormasPagoIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');

  const fetchFormasPago = async () => {
    try {
      setLoading(true);
      const activeFormasPagoResponse = await axiosClient.get('/api/formaspago', {
        params: {
          activo: 1,
        },
      });
      setPaymentMethods(activeFormasPagoResponse.data.data);

      const campaignFormasPagoResponse = await axiosClient.get(`/api/campanias/${id}`);
      console.log('campaignFormasPagoResponse', campaignFormasPagoResponse)
      const linkedFormasPagoData = campaignFormasPagoResponse.data.campania.formaspago || [];
      console.log('linkedFormasPagoData', linkedFormasPagoData)
      const initialFromasPagoIds = linkedFormasPagoData.map((forma: PaymentMethod) => forma.id);
      console.log('initialFromasPagoIds', initialFromasPagoIds)
      setPaymentMethodsIds(initialFromasPagoIds);
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMsg('Error al cargar los locales');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (formapagoId: number, checked: boolean) => {
    if (checked) {
      setPaymentMethodsIds((prev) => [...prev, formapagoId]);
      setEliminarFormasPagoIds((prev) => prev.filter((id) => id !== formapagoId));
    } else {
      setPaymentMethodsIds((prev) => prev.filter((id) => id !== formapagoId));
      setEliminarFormasPagoIds((prev) => [...prev, formapagoId]);
    }
  };

  const handleCheckAll = () => {
    const allIds = paymentMethods.map((forma) => forma.id);
    setPaymentMethodsIds(allIds);
    setEliminarFormasPagoIds([]);
  };

  const handleSave = async () => {
    try {
      await axiosClient.post('/api/campanias/agregarFormasPago', {
        campaniaId: id,
        formaspagoIds: paymentMethodsIds,
        eliminarFormasPagoIds: eliminarFormasPagoIds,
      });
      setSnackbarType('success');
      setSnackbarMsg('Formas de Pago actualizadas con éxito');
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMsg('Hubo un error al guardar las formas de pago');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    router.push(`/campaigns/list`);
  };

  React.useEffect(() => {
    fetchFormasPago();
  }, [id]);

  return (
    <Paper sx={{ padding: 4, backgroundColor: '#f5f5f5' }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#1976d2',
          marginBottom: 3,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        Agregar Formas de Pago a la Campaña
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Selecciona las formas de pago que deseas asociar:</Typography>
            <Button variant="outlined" color="primary" onClick={handleCheckAll}>
              Agregar Todos
            </Button>
          </Box>

          <Grid container spacing={1} sx={{ maxHeight: 400, overflowY: 'auto', paddingLeft: 1 }}>
            {paymentMethods.map((formapago) => {
              const isChecked = paymentMethodsIds.includes(formapago.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={formapago.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(event) => handleCheckboxChange(formapago.id, event.target.checked)}
                        color="primary"
                      />
                    }
                    label={formapago.nombre}
                  />
                </Grid>
              );
            })}
          </Grid>

          <Box display="flex" justifyContent="space-between" mt={4} flexWrap="wrap" gap={2}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Guardar Cambios
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddPayMethodsToCampaignPage;
