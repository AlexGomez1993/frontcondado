'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  keyframes,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
  Typography,
  DialogContentText,
  useTheme,
  Autocomplete,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axiosClient from '@/lib/axiosClient';
import { Invoice, CheckCircle, Warning } from '@phosphor-icons/react';
import { Campaign, CampaignResponse } from '@/types/campaign';
import { PaymentMethod, PaymentMethodResponse } from '@/types/payment_method';
import { Store } from '@/types/comercial_store';
import moment from 'moment';


const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
`;
interface FacturaAprobada {
  id: number;
  fecha_registro: string;
  campania: string;
  local: string;
  numero_factura: string;
  monto: number;
  forma_pago: string;
  cabecera_image: string;
  voucher_image: string;
  estado: string;
  cupones: number;
  observacion: string;
}

interface Factura {
  id: number;
  fechaRegistro: string;
  numero: string;
  monto: number;
  formapago_id: number;
  imagen: string;
  voucher: string;
  estado: number;
  observacion?: string;
  campanias?: {
    nombre: string;
  };
  tienda?: {
    nombre: string;
    numcupones?: number;
  };
  formapago?: {
    id: number;
    nombre: string;
  };
  cupones?: {
    numcupones: number
  }[]
}

interface AprobadasDialogProps {
  open: boolean;
  onClose: () => void;
}
interface PendienteDialogProps {
  open: boolean;
  onClose: () => void;
}
interface RechazadasDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  campania: string;
  local: string;
  numeroFactura: string;
  monto: string;
  formaPago: string;
  headerImage: File | null;
  headerPreview: string;
  voucherImage: File | null;
  voucherPreview: string;
  aceptaTerminos: boolean;
}
interface ProcessedFormData extends Omit<FormData, 'headerImage' | 'voucherImage'> {
  headerImage: string;
  voucherImage: string;
}

interface FacturaDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: ProcessedFormData) => void;
}


const getEstadoNombre = (estado: number): string => {
  const estados: { [key: number]: string } = {
    1: 'Pendiente',
    2: 'Aprobada',
    3: 'Rechazada',
  };
  return estados[estado] || `Estado ${estado}`;
};

const StyledButton = styled(Button)(({ theme, colorvariant }: { theme?: any; colorvariant: string }) => ({
  width: '100%',
  minHeight: '220px',
  maxWidth: '250px',
  margin: '0 auto',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  border: '3px solid',
  borderColor:
    colorvariant === 'blue'
      ? theme.palette.primary.main
      : colorvariant === 'green'
        ? theme.palette.success.main
        : theme.palette.error.main,
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#fff',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    '&:before': {
      opacity: 0.1,
    },
    '& .iconWrapper': {
      backgroundColor: theme.palette.common.white,
      boxShadow: theme.shadows[4],
    },
    '& .icon': {
      animation: `float 2s ease-in-out infinite`,
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, currentColor 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 300ms ease',
  },
}));


const IconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '50%',
  transition: 'all 300ms ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledIcon = styled('div')({
  transition: 'transform 300ms ease',
  '& svg': {
    width: 56,
    height: 56,
    strokeWidth: 1.5,
  },
});
const FacturaDialog = ({ open, onClose, onSubmit }: FacturaDialogProps) => {
  const [campanias, setCampanias] = useState<Campaign[]>([]);
  const [formasPago, setFormasPago] = useState<PaymentMethod[]>([]);
  const [locales, setLocales] = useState<Store[]>([]);
  const [formData, setFormData] = useState<FormData>({
    campania: '',
    local: '',
    numeroFactura: '',
    monto: '',
    formaPago: '',
    headerImage: null,
    headerPreview: '',
    voucherImage: null,
    voucherPreview: '',
    aceptaTerminos: false,
  });

  useEffect(() => {
    return () => {
      if (formData.headerPreview) {
        URL.revokeObjectURL(formData.headerPreview);
      }
      if (formData.voucherPreview) {
        URL.revokeObjectURL(formData.voucherPreview);
      }
    };
  }, [formData.headerPreview, formData.voucherPreview]);

  useEffect(() => {
    const fetchCampanias = async () => {
      try {
        const response = await axiosClient.get<CampaignResponse>(`/api/campanias?activo=1`);
        const campaniasActivas = response.data.data;
        setCampanias(campaniasActivas || []);

        if (campaniasActivas.length === 1) {
          const unicaCampania = campaniasActivas[0];
          setLocales(unicaCampania.tiendas || []);
          setFormasPago(unicaCampania.formaspago || [])
          setFormData((prev) => ({
            ...prev,
            campania: String(unicaCampania.id),
          }));
        }
      } catch (error) {
        console.error('Error al cargar campañas:', error);
      }
    };

    if (open) {
      if (formData.headerPreview) URL.revokeObjectURL(formData.headerPreview);
      if (formData.voucherPreview) URL.revokeObjectURL(formData.voucherPreview);

      // Resetear formData
      setFormData({
        campania: '',
        local: '',
        numeroFactura: '',
        monto: '',
        formaPago: '',
        headerImage: null,
        headerPreview: '',
        voucherImage: null,
        voucherPreview: '',
        aceptaTerminos: false,
      });


      fetchCampanias();
    }
  }, [open]);



  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;

    if (name === 'headerImage' || name === 'voucherImage') {
      const input = target;

      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

        if (!allowedTypes.includes(file.type)) {
          alert('Solo se permiten archivos PNG, JPG o JPEG');
          return;
        }

        const previewURL = URL.createObjectURL(file);

        setFormData((prev) => ({
          ...prev,
          [name]: file,
          [`${name === 'headerImage' ? 'headerPreview' : 'voucherPreview'}`]: previewURL,
        }));
      }
    } else {
      const value = name === 'aceptaTerminos' ? target.checked : target.value;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    const {
      campania,
      local,
      numeroFactura,
      monto,
      formaPago,
      headerImage,
      voucherImage,
      aceptaTerminos,
    } = formData;

    if (
      !campania ||
      !local ||
      !numeroFactura ||
      !monto ||
      !formaPago ||
      !headerImage ||
      !aceptaTerminos
    ) {
      alert('Por favor complete todos los campos requeridos y suba la cabecera de la factura.');
      return;
    }

    if (Number(monto) < 10) {
      alert('El monto de la factura debe ser mayor a $10.');
      return;
    }

    if (formaPago === '3' && !voucherImage) {
      alert('Debe subir la imagen del voucher para la forma de pago seleccionada.');
      return;
    }

    const convertToBase64 = (file: File | null): Promise<string> => {
      if (!file) return Promise.resolve('');
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    const processedData: ProcessedFormData = {
      ...formData,
      headerImage: await convertToBase64(headerImage),
      voucherImage: await convertToBase64(voucherImage),
    };

    onSubmit(processedData);
    //onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registro de Nueva Factura</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Campaña</InputLabel>
              <Select
                name="campania"
                value={formData.campania}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedCampania = campanias.find((c) => c.id === parseInt(selectedId));
                  setLocales(selectedCampania?.tiendas || []);
                  setFormasPago(selectedCampania?.formaspago || []);
                  setFormData((prev) => ({ ...prev, campania: selectedId, local: '' }));
                }}
                label="Campaña"
                variant="outlined"
                size="small"
              >
                {campanias.map((campania) => (
                  <MenuItem key={campania.id} value={String(campania.id)}>
                    {campania.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <Autocomplete
                options={locales}
                getOptionLabel={(option) => option?.nombre || 'Seleccione'}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    local: newValue?.id?.toString() || '',
                  }));
                }}
                value={locales.find((loc) => loc.id.toString() === formData.local) || null}
                renderInput={(params) => (
                  <TextField {...params} label="Local" size="small" variant="outlined" />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Número de Factura (últimos 6 dígitos)"
              name="numeroFactura"
              value={formData.numeroFactura}
              onChange={handleChange}
              inputProps={{ maxLength: 6 }}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monto de la Factura"
              name="monto"
              type="text"
              inputMode="decimal"
              value={formData.monto}
              onChange={(e) => {
                let valor = e.target.value.replace(',', '.');

                if (/^\d*\.?\d{0,2}$/.test(valor) || valor === "") {
                  const customEvent = {
                    ...e,
                    target: {
                      ...e.target,
                      value: valor,
                      name: 'monto'
                    }
                  };

                  handleChange(customEvent as React.ChangeEvent<HTMLInputElement>);
                }
              }}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Forma de Pago</InputLabel>
              <Select name="formaPago" value={formData.formaPago} onChange={handleChange} label="Forma de Pago" variant="outlined"
                size="small">
                {formasPago.map((forma) => (
                  <MenuItem key={forma.id} value={String(forma.id)}>
                    {forma.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="contained" component="label">
              Subir Cabecera de Factura
              <input
                type="file"
                hidden
                name="headerImage"
                accept="image/png, image/jpg, image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0]; // ✅ prevención de ts18047
                  if (file && ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
                    const imageURL = URL.createObjectURL(file);
                    setFormData((prev) => ({
                      ...prev,
                      headerImage: file,
                      headerPreview: imageURL,
                    }));
                  } else if (file) {
                    alert('Solo se permiten archivos PNG, JPG o JPEG');
                  }
                }}
              />
            </Button>

            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              En la imagen se deben ver los datos del cliente.
            </Typography>

            {formData.headerImage && (
              <>
                <span>{formData.headerImage.name}</span>
                <br />
                <img
                  src={formData.headerPreview}
                  alt="Vista previa cabecera"
                  style={{ maxWidth: '100%', maxHeight: 150, marginTop: 10 }}
                />
              </>
            )}
          </Grid>
          {formData.formaPago === '3' && (
            <Grid item xs={12} md={6}>
              <Button variant="contained" component="label">
                Subir Voucher de Pago
                <input
                  type="file"
                  hidden
                  name="voucherImage"
                  accept="image/png, image/jpg, image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)) {
                      const imageURL = URL.createObjectURL(file);
                      setFormData((prev) => ({
                        ...prev,
                        voucherImage: file,
                        voucherPreview: imageURL,
                      }));
                    } else if (file) {
                      alert('Solo se permiten archivos PNG, JPG o JPEG');
                    }
                  }}
                />
              </Button>
              {formData.voucherImage && (
                <>
                  <span>{formData.voucherImage.name}</span>
                  <br />
                  <img
                    src={formData.voucherPreview}
                    alt="Vista previa voucher"
                    style={{ maxWidth: '100%', maxHeight: 150, marginTop: 10 }}
                  />
                </>
              )}
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} />}
              label="Acepto Términos y Condiciones"
            />
            <Typography variant="body2" align="center" sx={{ mt: 1, px: 2 }}>
              Nota: Favor conservar sus facturas. <br />
              “El cliente para participar en la promoción confiere voluntariamente sus datos personales, y autoriza a
              que los mismos sean recopilados, utilizados para las campañas que realice el Centro Comercial y tratados
              de conformidad con lo estipulado en la Ley Orgánica de Protección de Datos Personales, éstos no serán
              transferidos a terceros. En caso de que el cliente no desee constar en la base de datos del centro
              comercial, solicitará su eliminación al correo
              <strong> info@elcondadoshopping.com</strong>.”
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!formData.aceptaTerminos} variant="contained">
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const AprobadasDialog = ({ open, onClose }: AprobadasDialogProps) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const theme = useTheme();
  const [aprobadasData, setAprobadasData] = useState<FacturaAprobada[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 3;

  const fetchAprobadas = async () => {
    try {
      setLoading(true);
      const userString = localStorage.getItem('user');

      if (!userString) throw new Error('Usuario no autenticado');

      const user = JSON.parse(userString);
      const cliente_id = user.id;

      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=2&page=${currentPage}&limit=${pageSize}&cliente_id=${cliente_id}&campanias_activas=true`
      );

      const mappedData = response.data.data.map((factura: Factura) => ({
        id: factura.id,
        fecha_registro: factura.fechaRegistro,
        campania: factura.campanias?.nombre || '',
        local: factura.tienda?.nombre || '',
        numero_factura: factura.numero,
        monto: factura.monto,
        forma_pago: factura.formapago?.nombre,
        cabecera_image: factura.imagen,
        voucher_image: factura.voucher,
        estado: getEstadoNombre(factura.estado),
        cupones: factura.cupones ? factura.cupones[0].numcupones : 0,
        observacion: factura.observacion || '',
      }));

      setAprobadasData(mappedData);
      setTotalPages(response.data.totalPaginas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchAprobadas();
  }, [open, currentPage]);
  useEffect(() => {
    if (open) {
      setCurrentPage(1);
    }
  }, [open]);
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Facturas Aprobadas</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" p={2}>
            {error}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha y hora de registro</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Local</TableCell>
                    <TableCell>Factura</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Forma de pago</TableCell>
                    <TableCell>Cabecera factura</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Cupones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aprobadasData.map((factura, index) => (
                    <TableRow key={factura.id}>
                      <TableCell>{moment(factura.fecha_registro).add(5, 'hours').format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                      <TableCell>{factura.campania}</TableCell>
                      <TableCell>{factura.local}</TableCell>
                      <TableCell>{factura.numero_factura}</TableCell>
                      <TableCell>${factura.monto}</TableCell>
                      <TableCell>{factura.forma_pago}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          alt="Cabecera"
                          onClick={() => {
                            if (factura.cabecera_image) {
                              setSelectedImage(factura.cabecera_image);
                              setOpenImageDialog(true);
                            }
                          }}
                          sx={{
                            width: 100,
                            height: 50,
                            cursor: factura.cabecera_image ? 'pointer' : 'default',
                            bgcolor: factura.cabecera_image ? '#e3f2fd' : '#f5f5f5',
                            color: factura.cabecera_image ? '#1976d2' : '#9e9e9e',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 14,
                            fontWeight: 'bold',
                            border: factura.cabecera_image ? '2px dashed #90caf9' : '1px solid #ccc',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': factura.cabecera_image && {
                              bgcolor: '#bbdefb',
                              borderColor: '#1976d2',
                              color: '#0d47a1',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            },
                          }}
                        >
                          {factura.cabecera_image ? 'Ver Imagen' : 'Sin imagen'}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          alt="Voucher"
                          onClick={() => {
                            if (factura.voucher_image) {
                              setSelectedImage(factura.voucher_image);
                              setOpenImageDialog(true);
                            }
                          }}
                          sx={{
                            width: 100,
                            height: 50,
                            cursor: factura.voucher_image ? 'pointer' : 'default',
                            bgcolor: factura.voucher_image ? '#e3f2fd' : '#f5f5f5',
                            color: factura.voucher_image ? '#1976d2' : '#9e9e9e',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 14,
                            fontWeight: 'bold',
                            border: factura.voucher_image ? '2px dashed #90caf9' : '1px solid #ccc',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': factura.voucher_image && {
                              bgcolor: '#bbdefb',
                              borderColor: '#1976d2',
                              color: '#0d47a1',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            },
                          }}
                        >
                          {factura.voucher_image ? 'Ver Voucher' : 'Sin voucher'}
                        </Avatar>
                      </TableCell>
                      <TableCell>{factura.cupones}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </DialogContent>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};
const PendienteDialog = ({ open, onClose }: PendienteDialogProps) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const theme = useTheme();
  const [pendientesData, setPendientesData] = useState<FacturaAprobada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 3;

  const fetchPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('custom-auth-token');
      const userString = localStorage.getItem('user');

      if (!userString) throw new Error('Usuario no autenticado');

      const user = JSON.parse(userString);
      const cliente_id = user.id;
      const cedula = user.ruc;

      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=1&page=${currentPage}&limit=${pageSize}&cliente_id=${cliente_id}&campanias_activas=true`
      );

      const mappedData = response.data.data.map((factura: Factura) => ({
        id: factura.id,
        fecha_registro: factura.fechaRegistro,
        campania: factura.campanias?.nombre || '',
        local: factura.tienda?.nombre || '',
        numero_factura: factura.numero,
        monto: factura.monto,
        forma_pago: factura.formapago?.nombre,
        cabecera_image: factura.imagen,
        voucher_image: factura.voucher,
        estado: getEstadoNombre(factura.estado),
        cupones: factura.tienda?.numcupones || 0,
        observacion: factura.observacion || '',
      }));

      setPendientesData(mappedData);
      setTotalPages(response.data.totalPaginas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchPendientes();
  }, [open, currentPage]);

  useEffect(() => {
    if (open) {
      setCurrentPage(1);
    }
  }, [open]);
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Facturas Pendientes</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" p={2}>
            {error}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha y hora de registro</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Local</TableCell>
                    <TableCell>Factura</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Forma de pago</TableCell>
                    <TableCell>Cabecera factura</TableCell>
                    <TableCell>Voucher</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendientesData.map((factura, index) => (
                    <TableRow key={factura.id}>
                      <TableCell>{moment(factura.fecha_registro).add(5, 'hours').format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                      <TableCell>{factura.campania}</TableCell>
                      <TableCell>{factura.local}</TableCell>
                      <TableCell>{factura.numero_factura}</TableCell>
                      <TableCell>${factura.monto}</TableCell>
                      <TableCell>{factura.forma_pago}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          alt="Cabecera"
                          onClick={() => {
                            if (factura.cabecera_image) {
                              setSelectedImage(factura.cabecera_image);
                              setOpenImageDialog(true);
                            }
                          }}
                          sx={{
                            width: 100,
                            height: 50,
                            cursor: factura.cabecera_image ? 'pointer' : 'default',
                            bgcolor: factura.cabecera_image ? '#e3f2fd' : '#f5f5f5',
                            color: factura.cabecera_image ? '#1976d2' : '#9e9e9e',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 14,
                            fontWeight: 'bold',
                            border: factura.cabecera_image ? '2px dashed #90caf9' : '1px solid #ccc',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': factura.cabecera_image && {
                              bgcolor: '#bbdefb',
                              borderColor: '#1976d2',
                              color: '#0d47a1',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            },
                          }}
                        >
                          {factura.cabecera_image ? 'Ver Imagen' : 'Sin imagen'}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          alt="Voucher"
                          onClick={() => {
                            if (factura.voucher_image) {
                              setSelectedImage(factura.voucher_image);
                              setOpenImageDialog(true);
                            }
                          }}
                          sx={{
                            width: 100,
                            height: 50,
                            cursor: factura.voucher_image ? 'pointer' : 'default',
                            bgcolor: factura.voucher_image ? '#e3f2fd' : '#f5f5f5',
                            color: factura.voucher_image ? '#1976d2' : '#9e9e9e',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 14,
                            fontWeight: 'bold',
                            border: factura.voucher_image ? '2px dashed #90caf9' : '1px solid #ccc',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': factura.voucher_image && {
                              bgcolor: '#bbdefb',
                              borderColor: '#1976d2',
                              color: '#0d47a1',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            },
                          }}
                        >
                          {factura.voucher_image ? 'Ver Voucher' : 'Sin voucher'}
                        </Avatar>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
const RechazadasDialog = ({ open, onClose }: RechazadasDialogProps) => {
  const [selectedImage, setSelectedImage] = useState('');
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const theme = useTheme();
  const [rechazadasData, setRechazadasData] = useState<FacturaAprobada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 3;

  const fetchRechazadas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('custom-auth-token');
      const userString = localStorage.getItem('user');

      if (!userString) throw new Error('Usuario no autenticado');

      const user = JSON.parse(userString);
      const cliente_id = user.id;
      const cedula = user.ruc;

      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=3&page=${currentPage}&limit=${pageSize}&cliente_id=${cliente_id}&campanias_activas=true`);

      const mappedData = response.data.data.map((factura: Factura) => ({
        id: factura.id,
        fecha_registro: factura.fechaRegistro,
        campania: factura.campanias?.nombre || '',
        local: factura.tienda?.nombre || '',
        numero_factura: factura.numero,
        monto: factura.monto,
        forma_pago: factura.formapago?.nombre,
        cabecera_image: factura.imagen,
        voucher_image: factura.voucher,
        estado: getEstadoNombre(factura.estado),
        cupones: factura.tienda?.numcupones || 0,
        observacion: factura.observacion || '',
      }));

      setRechazadasData(mappedData);
      setTotalPages(response.data.totalPaginas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchRechazadas();
  }, [open, currentPage]);
  useEffect(() => {
    if (open) {
      setCurrentPage(1);
    }
  }, [open]);
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Facturas Rechazadas</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" p={2}>
            {error}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha y hora de registro</TableCell>
                    <TableCell>Campaña</TableCell>
                    <TableCell>Local</TableCell>
                    <TableCell>Factura</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Forma de pago</TableCell>
                    <TableCell>Cabecera factura</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rechazadasData.map((factura, index) => (
                    <TableRow key={factura.id}>
                      <TableCell>{moment(factura.fecha_registro).add(5, 'hours').format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                      <TableCell>{factura.campania}</TableCell>
                      <TableCell>{factura.local}</TableCell>
                      <TableCell>{factura.numero_factura}</TableCell>
                      <TableCell>${factura.monto}</TableCell>
                      <TableCell>{factura.forma_pago}</TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          alt="Cabecera"
                          onClick={() => {
                            if (factura.cabecera_image) {
                              setSelectedImage(factura.cabecera_image);
                              setOpenImageDialog(true);
                            }
                          }}
                          sx={{
                            width: 100,
                            height: 50,
                            cursor: factura.cabecera_image ? 'pointer' : 'default',
                            bgcolor: factura.cabecera_image ? '#e3f2fd' : '#f5f5f5',
                            color: factura.cabecera_image ? '#1976d2' : '#9e9e9e',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 14,
                            fontWeight: 'bold',
                            border: factura.cabecera_image ? '2px dashed #90caf9' : '1px solid #ccc',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': factura.cabecera_image && {
                              bgcolor: '#bbdefb',
                              borderColor: '#1976d2',
                              color: '#0d47a1',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            },
                          }}
                        >
                          {factura.cabecera_image ? 'Ver Imagen' : 'Sin imagen'}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          alt="Voucher"
                          onClick={() => {
                            if (factura.voucher_image) {
                              setSelectedImage(factura.voucher_image);
                              setOpenImageDialog(true);
                            }
                          }}
                          sx={{
                            width: 100,
                            height: 50,
                            cursor: factura.voucher_image ? 'pointer' : 'default',
                            bgcolor: factura.voucher_image ? '#e3f2fd' : '#f5f5f5',
                            color: factura.voucher_image ? '#1976d2' : '#9e9e9e',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 14,
                            fontWeight: 'bold',
                            border: factura.voucher_image ? '2px dashed #90caf9' : '1px solid #ccc',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': factura.voucher_image && {
                              bgcolor: '#bbdefb',
                              borderColor: '#1976d2',
                              color: '#0d47a1',
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            },
                          }}
                        >
                          {factura.voucher_image ? 'Ver Voucher' : 'Sin voucher'}
                        </Avatar>
                      </TableCell>
                      <TableCell>{factura.observacion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
const BotonesFactura = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aprobadasOpen, setAprobadasOpen] = useState(false);
  const [pendientesOpen, setPendientesOpen] = useState(false);
  const [rechazadasOpen, setRechazadasOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccessOnClose = () => {
    setDialogOpen(false);
    setSuccessDialogOpen(false);
  }
  const handleSubmitFactura = async (formData: ProcessedFormData) => {
    try {
      setLoading(true);
      setSuccessDialogOpen(true);
      const userString = localStorage.getItem('user');

      if (!userString) {
        throw new Error('Usuario no autenticado');
      }

      const user = JSON.parse(userString);
      const cliente_id = user.id;
      const ruc = user.ruc;

      const campaniasSeleccionadas = [
        {
          id: formData.campania,
          factura: {
            numero: formData.numeroFactura,
            monto: formData.monto,
            tienda_id: parseInt(formData.local),
            formapago_id: formData.formaPago,
            imagen: formData.headerImage,
            voucher: formData.voucherImage,
          },
        },
      ];

      const facturasCliente = {
        cliente_id: cliente_id,
        ruc: ruc,
        campanias: campaniasSeleccionadas,
      }

      const response = await axiosClient.post(`/api/facturas/facturasWeb`, {
        facturasCliente
      });

      const result = await response.data;
      console.log('Respuesta del backend:', result);
      setDialogOpen(false);
      console.log('Factura registrada correctamente.')
    } catch (error: any) {
      console.error('Error al registrar factura:', error);
      setError(error.message ? error.message : 'Error al cargar la factura');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        minHeight: '60vh',
        background: 'linear-gradient(to bottom right,rgb(255, 255, 255) 0%, #ffffff 100%)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: ' center',
        textAlign: 'center'
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            textShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Invoice size={32} />
          Administración de Facturas
        </Typography>
        <Divider sx={{ marginBottom: 3 }} />
      </Box>

      <Grid
        container
        spacing={4}
        sx={{
          maxWidth: 1200,
          /* margin: 'auto', */
          justifyContent: 'center',
          textAlign: 'center',
        }}
        justifyContent="center"
        alignItems="stretch"
      >
        <Grid item xs={12} sm={6} md={3} lg={3} sx={{ borderColor: 'red' }}>
          <StyledButton colorvariant="blue" onClick={() => setDialogOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/ingresar.png"
                alt="Facturas Ingreso"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain',
                  marginBottom: '8px'
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Registrar Nueva Factura
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StyledButton colorvariant="green" onClick={() => setAprobadasOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/aprobada.png"
                alt="Facturas Aprobadas"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Aprobadas
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StyledButton colorvariant="red" onClick={() => setPendientesOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/pendiente.png"
                alt="Facturas Pendientes"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Pendientes
            </Typography>
          </StyledButton>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StyledButton colorvariant="red" onClick={() => setRechazadasOpen(true)}>
            <IconWrapper className="iconWrapper">
              <img
                src="/assets/rechazada.png"
                alt="Facturas Rechazadas"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                }}
              />
            </IconWrapper>
            <Typography variant="h6" textAlign="center" sx={{ fontWeight: 700 }}>
              Facturas Rechazadas
            </Typography>
          </StyledButton>
        </Grid>
      </Grid>
      <FacturaDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmitFactura} />
      <AprobadasDialog open={aprobadasOpen} onClose={() => setAprobadasOpen(false)} />
      <PendienteDialog open={pendientesOpen} onClose={() => setPendientesOpen(false)} />
      <RechazadasDialog open={rechazadasOpen} onClose={() => setRechazadasOpen(false)} />
      <Dialog open={successDialogOpen} onClose={handleSuccessOnClose} maxWidth="sm" fullWidth>
        {
          loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" p={2}>
              {error}
            </Typography>
          ) : (
            <>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" size={38} />
                Factura Registrada
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    ¡Su factura ha sido ingresada correctamente!
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Será revisada por el personal de Servicio al Cliente.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Para verificar si fue <strong>aprobada</strong>, <strong>rechazada</strong> o continúa <strong>pendiente</strong>,
                    por favor consulte los módulos correspondientes en esta sección.
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleSuccessOnClose} variant="contained" color="primary">
                  Entendido
                </Button>
              </DialogActions>
            </>
          )
        }
      </Dialog>
    </Box>
  );
};

export default BotonesFactura;
