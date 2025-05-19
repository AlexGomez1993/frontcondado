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

import { Promotion } from '@/types/promotion';
import axiosClient from '@/lib/axiosClient';

const AddPromotionsToCampaignPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [promocionIds, setPromocionIds] = React.useState<number[]>([]);
  const [eliminarPromocionesIds, setEliminarPromocionesIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const activePromotionsResponse = await axiosClient.get('/api/promociones', {
        params: {
          activo: 1,
        },
      });
      setPromotions(activePromotionsResponse.data.data);

      const campaignPromotionsResponse = await axiosClient.get(`/api/campanias/${id}`);
      const linkedPromotionsData = campaignPromotionsResponse.data.campania.promociones || [];
      const initialPromocionIds = linkedPromotionsData.map((promo: Promotion) => promo.id);
      setPromocionIds(initialPromocionIds);
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMsg('Error al cargar los locales');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (promotionId: number, checked: boolean) => {
    if (checked) {
      setPromocionIds((prev) => [...prev, promotionId]);
      setEliminarPromocionesIds((prev) => prev.filter((id) => id !== promotionId));
    } else {
      setPromocionIds((prev) => prev.filter((id) => id !== promotionId));
      setEliminarPromocionesIds((prev) => [...prev, promotionId]);
    }
  };

  const handleCheckAll = () => {
    const allIds = promotions.map((promo) => promo.id);
    setPromocionIds(allIds);
    setEliminarPromocionesIds([]);
  };

  const handleSave = async () => {
    try {
      await axiosClient.post('/api/campanias/agregarPromociones', {
        campaniaId: id,
        promocionesIds: promocionIds,
        eliminarPromocionesIds: eliminarPromocionesIds,
      });
      setSnackbarType('success');
      setSnackbarMsg('Promociones actualizadas con éxito');
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMsg('Hubo un error al guardar las promociones');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    router.push(`/campaigns/list`);
  };

  React.useEffect(() => {
    fetchPromotions();
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
        Agregar Promociones a la Campaña
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Selecciona las promociones que deseas asociar:</Typography>
            <Button variant="outlined" color="primary" onClick={handleCheckAll}>
              Agregar Todos
            </Button>
          </Box>

          <Grid container spacing={1} sx={{ maxHeight: 400, overflowY: 'auto', paddingLeft: 1 }}>
            {promotions.map((promotion) => {
              const isChecked = promocionIds.includes(promotion.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={promotion.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(event) => handleCheckboxChange(promotion.id, event.target.checked)}
                        color="primary"
                      />
                    }
                    label={promotion.nombre}
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

export default AddPromotionsToCampaignPage;
