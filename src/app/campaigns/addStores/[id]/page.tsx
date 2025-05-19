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

import { Store } from '@/types/comercial_store';
import axiosClient from '@/lib/axiosClient';

const AddStoresToCampaignPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [stores, setStores] = React.useState<Store[]>([]);
  const [storesIds, setStoresIds] = React.useState<number[]>([]);
  const [eliminarStoresIds, setEliminarStoresIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');

  const fetchStores = async () => {
    try {
      setLoading(true);
      const activeStoresResponse = await axiosClient.get('/api/tiendas', {
        params: {
          activo: 1,
        },
      });
      setStores(activeStoresResponse.data.data);

      const campaignStoresResponse = await axiosClient.get(`/api/campanias/${id}`);
      const linkedStoresData = campaignStoresResponse.data.campania.tiendas || [];
      const initialStoreIds = linkedStoresData.map((store: Store) => store.id);
      setStoresIds(initialStoreIds);
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMsg('Error al cargar los locales');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (storeId: number, checked: boolean) => {
    if (checked) {
      setStoresIds((prev) => [...prev, storeId]);
      setEliminarStoresIds((prev) => prev.filter((id) => id !== storeId));
    } else {
      setStoresIds((prev) => prev.filter((id) => id !== storeId));
      setEliminarStoresIds((prev) => [...prev, storeId]);
    }
  };

  const handleCheckAll = () => {
    const allIds = stores.map((store) => store.id);
    setStoresIds(allIds);
    setEliminarStoresIds([]);
  };

  const handleSave = async () => {
    try {
      await axiosClient.post('/api/campanias/agregarTiendas', {
        campaniaId: id,
        tiendasIds: storesIds,
        eliminarTiendasIds: eliminarStoresIds,
      });
      setSnackbarType('success');
      setSnackbarMsg('Locales actualizados con éxito');
    } catch (error) {
      setSnackbarType('error');
      setSnackbarMsg('Hubo un error al guardar los locales');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    router.push(`/campaigns/list`);
  };

  React.useEffect(() => {
    fetchStores();
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
        Agregar Locales a la Campaña
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Selecciona los locales que deseas asociar:</Typography>
            <Button variant="outlined" color="primary" onClick={handleCheckAll}>
              Agregar Todos
            </Button>
          </Box>

          <Grid container spacing={1} sx={{ maxHeight: 400, overflowY: 'auto', paddingLeft: 1 }}>
            {stores.map((store) => {
              const isChecked = storesIds.includes(store.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={store.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(event) => handleCheckboxChange(store.id, event.target.checked)}
                        color="primary"
                      />
                    }
                    label={store.nombre}
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

export default AddStoresToCampaignPage;
