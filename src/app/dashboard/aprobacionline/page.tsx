'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import axiosClient from '@/lib/axiosClient';
import { Invoice } from '@phosphor-icons/react';
import { useUser } from '@/hooks/use-user';
import { Store } from '@/types/comercial_store';
import axios from 'axios';
import moment from 'moment';

interface Factura {
  id: number;
  createdAt: string;
  ruc: string;
  numero: string;
  monto: string;
  formapago_id: string;
  imagen: string;
  voucher: string;
}
type Campania = {
  id: number;
  nombre: string;
  promociones: Promocion[];
  configuracion: any;
  tiendas: Store[]
  logo?: string
};

type Promocion = {
  id: number;
  nombre: string;
  montominimo: number;
  // otros campos...
};
type FacturaAgregada = {
  id: string;
  promocion: string;
  montoMinimo: number;
  saldoAnterior: number;
  montoConFactor: number;
  cupones: number;
  total: number;
  campania: string;
  nuevoSaldo: number;
};
const FacturasTable = () => {
  const { user } = useUser();
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openFacturaDialog, setOpenFacturaDialog] = useState(false);
  const [openRechazoDialog, setOpenRechazoDialog] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMsg, setSnackbarMsg] = React.useState('');
  const [snackbarType, setSnackbarType] = React.useState<'success' | 'error'>('success');
  const [selectedImage, setSelectedImage] = useState('');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [selectedCampania, setSelectedCampania] = useState<Campania | null>(null);
  const [montoMinimo, setMontoMinimo] = useState<string>('');
  const [campanias, setCampanias] = useState<Campania[]>([]);
  const [selectedPromocion, setSelectedPromocion] = useState<Promocion | null>(null);
  const theme = useTheme();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [facturasAgregadas, setFacturasAgregadas] = useState<any[]>([]);
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [formaPagoId, setFormaPagoId] = useState<number | ''>('');
  const [processing, setProcessing] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRuc, setFilterRuc] = useState<string>('');
  const [totalPage, setTotalPage] = useState(1);
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [cuponesPorImprimir, setCuponesPorImprimir] = useState<any[]>([]);
  const [indiceCampania, setIndiceCampania] = useState(0);
  const [openCuponDialog, setOpenCuponDialog] = useState(false);
  const [estadoImpresion, setEstadoImpresion] = useState<'listo' | 'imprimiendo' | 'transicion' | 'finalizado'>('listo');
  const [cuentaRegresiva, setCuentaRegresiva] = useState(5);

  const eliminarFactura = (index: number) => {
    setFacturasAgregadas(facturasAgregadas.filter((_, i) => i !== index));
  };

  const fetchFacturas = async () => {
    try {
      const response = await axiosClient.get(
        `/api/facturas?estadoFactura=1`, {
        params: {
          limit: rowsPerPage,
          page: currentPage,
          ruc: filterRuc,
        },
      }
      );

      setFacturas(response.data.data || []);
      setTotalPage(response.data.totalPaginas);
      setTotalFacturas(response.data.total);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    }
  };
  useEffect(() => {
    fetchFacturas();
  }, [currentPage, rowsPerPage, filterRuc]);


  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const response = await axiosClient.get(`/api/formasPago?activo=1`);
        // Filtrar solo las activa
        setFormasPago(response.data.data ||[]);
      } catch (error) {
        console.error('Error al cargar formas de pago:', error);
        setFormasPago([]);
      }
    };

    fetchFormasPago();
  }, []);
  useEffect(() => {
    const fetchCampanias = async () => {
      try {
        const response = await axiosClient.get(`/api/campanias?activo=1`);
        setCampanias(response.data.data || []);
      } catch (error) {
        console.error('Error al cargar campañas:', error);
        setCampanias([]);
      }
    };

    fetchCampanias();
  }, []);
  const handleProcesarFactura = async () => {
    if (!facturasAgregadas || facturasAgregadas.length<1 || !selectedPromocion || !selectedCampania || saldo === null) return;

    try {
      const response = await axiosClient.put(`/api/facturas/procesarFacturaWeb`, {
        factura_id: facturasAgregadas[0].id,
        promocion: {
          id: selectedPromocion.id,
          montominimo: facturasAgregadas[0].montoMinimo,
          nuevoSaldo: facturasAgregadas[0].nuevoSaldo,
        },
        usuario_id: user?.id,
        numcupones: facturasAgregadas[0].cupones,
        campania: {
          id: facturasAgregadas[0].campania.id,
          nombre: facturasAgregadas[0].campania.nombre,
          tipo_configuracion: facturasAgregadas[0].campania.configuracion.descripcion,
        },
      });

      const { cuponesImprimir } = response.data;

        if (cuponesImprimir?.length) {
          setCuponesPorImprimir(cuponesImprimir);
          setIndiceCampania(0);
          setOpenCuponDialog(true);
        }

      setSnackbarType('success');
      setSnackbarMsg('Factura procesada con éxito');
      handleFacturaClose();
      setSelectedPromocion(null);
      setSelectedCampania(null);
      setSaldo(null)
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setSnackbarType('error');
      setSnackbarMsg('Error al procesar la fatura');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleFormaPagoChange = (event: SelectChangeEvent<number>) => {
    setFormaPagoId(Number(event.target.value));
  };

  const handleAgregarFactura = () => {
    if (!saldo || !facturaSeleccionada || !selectedPromocion || !selectedCampania) return;
    const factor = facturaSeleccionada.formapago.factor;
    const numCuponesLocal = facturaSeleccionada.tienda.numcupones;
    const montoFactura = Number(facturaSeleccionada.monto);
    const saldoNumerico = Number(saldo);
    const montoMinimo = Number(selectedPromocion.montominimo);
    const total = saldoNumerico + montoFactura;
    const cantidadCupones = Math.floor(total / montoMinimo) * factor * numCuponesLocal;
    let nuevoSaldo = total % montoMinimo;
    if(cantidadCupones==0){
      nuevoSaldo = total;
    }
    
    // Agregar al estado de facturas agregadas
    setFacturasAgregadas((prev) => [
      ...prev,
      {
        id: facturaSeleccionada.id,
        local: facturaSeleccionada.tienda,
        pago: facturaSeleccionada.formapago,
        promocion: selectedPromocion.nombre,
        factura: facturaSeleccionada.numero,
        monto: facturaSeleccionada.monto,
        campania: selectedCampania,
        montoMinimo: montoMinimo,
        saldoAnterior: saldoNumerico,
        montoConFactor: montoFactura,
        cupones: cantidadCupones,
        total: total,
        nuevoSaldo: nuevoSaldo,
      },
    ]);

  };
  const tableHeaderStyles: SxProps = {
    backgroundColor: theme.palette.primary.light,
    '& .MuiTableCell-head': {
      color: theme.palette.common.black,
      fontWeight: 600,
    },
  };
  const handleCampania = (campaniaId: number) => {
    const selected = campanias.find((c) => c.id === campaniaId) || null;
    setSelectedCampania(selected);
    setSelectedPromocion(null);
    setMontoMinimo('');
  };
  const handlePromocionChange = async (event: SelectChangeEvent<string>) => {
    const selectedId = parseInt(event.target.value);
    const promocionSeleccionada = selectedCampania?.promociones.find((p) => p.id === selectedId);
    setSelectedPromocion(promocionSeleccionada || null);

    if (promocionSeleccionada) {
      calcularSaldo(promocionSeleccionada.id);
    }
  };
  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };
  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterRuc(event.target.value);
    setCurrentPage(1);
  };
  const handleOpenDialog = (factura: any) => {
    setFacturaSeleccionada(factura);
    setOpenRechazoDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenRechazoDialog(false);
    setObservacion('');
  };

  const handleConfirmarRechazo = async () => {
    try {
      await axiosClient.put('/api/facturas/rechazarFacturaWeb', {
        factura_id: facturaSeleccionada.id,
        observacion: observacion,
        usuario_id: user?.id
      })
      setSnackbarType('success');
      setSnackbarMsg('Factura rechazada con éxito');
      fetchFacturas();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al rechazar la fatura');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleFacturaClose = () =>{
    setOpenFacturaDialog(false)
    setFacturasAgregadas([]);

  }
  const handleAprobarClick = (factura: any) => {
    setFacturaSeleccionada(factura);
    handleCampania(factura.campania_id);
    setOpenFacturaDialog(true);
  };

  const imprimirCupones = () => {
    const imprimirSecuencial = async (i: number) => {
      const campaniaActual = cuponesPorImprimir[indiceCampania];
  
      if (!campaniaActual) return;
  
      const start = campaniaActual.ultimoCuponImpreso + 1;
      const end = campaniaActual.ultimoCuponImprimir;
      const campaniaSelect = campanias.find((c) => c.nombre === campaniaActual.campania);
      const logo = campaniaSelect?.logo;
  
      if (i > end) {
        // Fin de campaña actual
        setEstadoImpresion('transicion');
        setCuentaRegresiva(5);
  
        const countdown = setInterval(() => {
          setCuentaRegresiva((prev) => {
            if (prev === 1) {
              clearInterval(countdown);
              if (indiceCampania + 1 < cuponesPorImprimir.length) {
                setIndiceCampania(indiceCampania + 1);
                setEstadoImpresion('listo');
              } else {
                setEstadoImpresion('finalizado');
              }
            }
            return prev - 1;
          });
        }, 1000);
  
        return;
      }
  
      const win = window.open('');
      if (!win) return;
  
      win.document.write(`<!DOCTYPE html>
        <html>
          <head>
            <title>Cupon</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 7pt; }
              table { border-collapse: collapse; width: 100%; border: 2px dotted black; padding: 2px; }
              td { padding: 2px 4px; vertical-align: top; }
              .titulo-condado { font-size: 10pt; font-weight: bold; text-align: center; margin: 0; }
              .texto-justificado { display: block; text-align: justify; }
            </style>
          </head>
          <body>
            <table>
              <tr>
                <td style="text-align:left;">
                  <img src="/assets/bnCondado.png" style="width:125px;" />
                </td>
                <td style="text-align:right;">
                  <img src="${process.env.NEXT_PUBLIC_API_URL! + logo}" style="width:125px; height:75px" />
                </td>
              </tr>
              <tr><td colspan="2"><p class="titulo-condado">CONDADO SHOPPING</p></td></tr>
              <tr><td><strong>NÚMERO DE CUPON:</strong></td><td>${i}</td></tr>
              <tr><td><strong>FECHA Y HORA:</strong></td><td>${new Date().toLocaleString()}</td></tr>
              <tr><td><strong>CLIENTE:</strong></td><td>${facturaSeleccionada.cliente?.nombres} ${facturaSeleccionada.cliente?.apellidos}</td></tr>
              <tr><td><strong>CI/RUC:</strong></td><td>${facturaSeleccionada.cliente?.ciRuc}</td></tr>
              <tr><td><strong>TELÉFONO:</strong></td><td>${facturaSeleccionada.cliente?.telefono}</td></tr>
              <tr><td><strong>CELULAR:</strong></td><td>${facturaSeleccionada.cliente?.celular}</td></tr>
              <tr><td><strong>DIRECCIÓN:</strong></td><td>${facturaSeleccionada.cliente?.direccion}</td></tr>
              <tr><td><strong>CAMPAÑA:</strong></td><td>${campaniaActual.campania}</td></tr>
              <tr>
                <td colspan="2">
                  <strong>Nota: Favor conservar sus facturas.</strong><br>
                  <span class="texto-justificado">
                    “El cliente para participar en la promoción confiere voluntariamente sus datos personales, y autoriza a que
                    los mismos sean recopilados y utilizados para las campañas del Centro Comercial, tratados de conformidad con
                    la Ley Orgánica de Protección de Datos Personales. Estos no serán transferidos a terceros. Si el cliente no
                    desea constar en la base de datos del centro comercial, puede solicitar su eliminación al correo
                    info@elcondadoshopping.com.”
                  </span>
                </td>
              </tr>
            </table>
          </body>
        </html>`);
  
      win.document.close();
  
      win.onload = () => {
        win.focus();
        setTimeout(() => {
          win.print();
          win.close();
          imprimirSecuencial(i + 1);
        }, 100);
      };
    };
  
    const currentStart = cuponesPorImprimir[indiceCampania]?.ultimoCuponImpreso + 1 || 1;
    imprimirSecuencial(currentStart);
  };
  const calcularSaldo = async (promocionSeleccionadaId: number) => {
    if (!facturaSeleccionada?.cliente?.id) return;
    setLoadingSaldo(true);

    try {
      const response = await axiosClient.post(`/api/saldosCliente`, {
        cliente_id: facturaSeleccionada.cliente.id,
      });
      const saldosCliente = response.data.data;
      if (saldosCliente && saldosCliente.length > 0) {
        const saldoCamPromo = saldosCliente.find((s: any) => s.campania_id == selectedCampania!.id && s.promocion_id == promocionSeleccionadaId)
        if (saldoCamPromo) {
          setSaldo(saldoCamPromo.saldo);
        }

      } else {
        setSaldo(0);
      }
    } catch (error) {
      console.error('Error al obtener saldo:', error);
      setSaldo(0);
    } finally {
      setLoadingSaldo(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
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
        <Invoice style={{ marginRight: 8 }} />
        Facturas Online
      </Typography>
      <TextField
        label="Filtrar por ci/ruc"
        variant="outlined"
        value={filterRuc}
        onChange={handleFilterChange}
        fullWidth
        sx={{ marginBottom: 2 }}
        size="small"
      />

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Filas por página</InputLabel>
        <Select value={rowsPerPage} onChange={handleRowsPerPageChange} label="Filas por página" size="small">
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
        </Select>
      </FormControl>
      <TableContainer>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead sx={tableHeaderStyles}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Fecha Registro</TableCell>
              <TableCell>RUC</TableCell>
              <TableCell>Local</TableCell>
              <TableCell>Factura</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Forma de Pago</TableCell>
              <TableCell>Cabecera Factura</TableCell>
              <TableCell>Voucher</TableCell>
              <TableCell align="center">Aprobar</TableCell>
              <TableCell align="center">Rechazar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(facturas) &&
              facturas.map((factura, idx) => (
                <TableRow key={factura.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell> {moment(factura.fechaRegistro).add(5, 'hours').format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                  <TableCell>{factura.ruc}</TableCell>
                  <TableCell>{factura.tienda ? factura.tienda.nombre : '-'}</TableCell>
                  <TableCell>{factura.numero}</TableCell>
                  <TableCell align="right">${parseFloat(factura.monto).toFixed(2)}</TableCell>
                  <TableCell>{factura.formapago.nombre}</TableCell>

                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={factura.imagen}
                      alt="Cabecera"
                      sx={{ width: 120, height: 120, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedImage(factura.imagen);
                        setOpenImageDialog(true);
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={factura.voucher}
                      alt="Voucher"
                      sx={{ width: 120, height: 120, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedImage(factura.voucher);
                        setOpenImageDialog(true);
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 500,
                      }}
                      onClick={() => handleAprobarClick(factura)}
                    >
                      Aprobar
                    </Button>
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleOpenDialog(factura)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 500,
                      }}
                    >
                      Rechazar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={totalPage}
        page={currentPage}
        onChange={handleChangePage}
        sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
      />
      <div className="flex justify-between items-center p-3 bg-gray-50">
        <Typography variant="body2" color="textSecondary">
          Mostrando {facturas.length} de {totalFacturas} registros
        </Typography>
      </div>
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
        <DialogContent sx={{ p: 2 }}>
          <img src={selectedImage} alt="Vista ampliada" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </DialogContent>
      </Dialog>
      <Dialog open={openFacturaDialog} onClose={handleFacturaClose} maxWidth="md" fullWidth>
        <DialogTitle>Información de la Factura</DialogTitle>
        <DialogContent>
          {facturaSeleccionada && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="RUC"
                  variant="outlined"
                  value={facturaSeleccionada?.cliente?.ruc || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nombre"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.nombre || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Apellido"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.apellidos || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo"
                  type="email"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.email || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dirección"
                  variant="outlined"
                  value={facturaSeleccionada.cliente?.direccion || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mt: 0.3 }}>
                  <InputLabel id="campania-label">Campaña</InputLabel>
                  <Select
                    labelId="campania-label"
                    value={selectedCampania?.id || ''}
                    displayEmpty
                    label="Campaña"
                    disabled
                  >
                    {campanias.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mt: 0.3 }}>
                  <InputLabel id="promocion-label">Promoción</InputLabel>
                  <Select
                    labelId="promocion-label"
                    value={selectedPromocion?.id?.toString() || ''}
                    onChange={handlePromocionChange}
                    displayEmpty
                    label="Promoción"
                    disabled={!selectedCampania}
                  >
                    {selectedCampania?.promociones.map((p) => (
                      <MenuItem key={p.id} value={p.id.toString()}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {selectedPromocion && (
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Monto Mínimo"
                    variant="outlined"
                    value={`$${Number(selectedPromocion.montominimo).toFixed(2)}`}
                    disabled
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Local"
                  variant="outlined"
                  value={facturaSeleccionada.tienda?.nombre || ''}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Monto" variant="outlined" value={facturaSeleccionada.monto} disabled />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Número de Factura"
                  variant="outlined"
                  value={facturaSeleccionada.numero}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="forma-pago-label">Forma de Pago</InputLabel>
                  <Select
                    labelId="forma-pago-label"
                    value={facturaSeleccionada.formapago_id}
                    onChange={handleFormaPagoChange}
                    label="Forma de Pago"
                    disabled
                  >
                    {formasPago.map((fp) => (
                      <MenuItem key={fp.id} value={fp.id}>
                        {fp.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button variant="contained" color="success" onClick={handleAgregarFactura}>
                  Agregar Factura
                </Button>
              </Grid>
            </Grid>
          )}
          {/* TABLA DETALLE FACTURAS */}
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Local</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell>Factura</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Campaña</TableCell>
                  <TableCell>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturasAgregadas.map((factura, index) => (
                  <TableRow key={index}>
                    <TableCell>{factura.local.nombre}</TableCell>
                    <TableCell>{factura.pago.nombre}</TableCell>
                    <TableCell>{factura.factura}</TableCell>
                    <TableCell>{parseFloat(factura.monto).toFixed(2)}</TableCell>
                    <TableCell>{factura.campania.nombre}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="error" onClick={() => eliminarFactura(index)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* TABLA DE TOTALES */}
          <TableContainer component={Paper} sx={{ mt: 3, border: '2px solid red' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Promoción</TableCell>
                  <TableCell>Monto Mín.</TableCell>
                  <TableCell>Saldo Ant.</TableCell>
                  <TableCell>Fac. Monto</TableCell>
                  <TableCell>Cupones</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Campaña</TableCell>
                  <TableCell>Saldo Nue.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facturasAgregadas.map((factura,index) => (
                  <TableRow key={index}>
                    <TableCell>{factura.promocion}</TableCell>
                    <TableCell>${factura.montoMinimo}</TableCell>
                    <TableCell>${factura.saldoAnterior}</TableCell>
                    <TableCell>${factura.montoConFactor}</TableCell>
                    <TableCell>{factura.cupones}</TableCell>
                    <TableCell>${parseFloat(factura.total).toFixed(2)}</TableCell>
                    <TableCell>{factura.campania.nombre}</TableCell>
                    <TableCell>${parseFloat(factura.nuevoSaldo).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFacturaClose}>Cerrar</Button>
          <Button variant="contained" color="success" onClick={handleProcesarFactura} disabled={processing}>
            {processing ? 'Procesando...' : 'Procesar Factura Online'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openRechazoDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar Factura</DialogTitle>
        <DialogContent>
          <TextField
            label="Observación"
            multiline
            fullWidth
            minRows={4}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Ingrese el motivo del rechazo..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirmarRechazo} color="error" variant="contained">
            Confirmar Rechazo
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openCuponDialog} onClose={() => setOpenCuponDialog(false)}>
        <DialogTitle>{cuponesPorImprimir[indiceCampania]?.campania}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Cupones a entregar: <strong>{cuponesPorImprimir[indiceCampania]?.ultimoCuponImprimir - cuponesPorImprimir[indiceCampania]?.ultimoCuponImpreso}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          {estadoImpresion === 'listo' && (
            <Button
              onClick={() => {
                setEstadoImpresion('imprimiendo');
                imprimirCupones(); // ya no recibe argumento
              }}
            >
              Imprimir cupones
            </Button>
          )}

          {estadoImpresion === 'transicion' && (
            <Typography variant="body2" sx={{ m: 2 }}>
              Imprimiendo campaña <strong>{cuponesPorImprimir[indiceCampania]?.campania}</strong>...
              Esperando próxima en {cuentaRegresiva} segundos
            </Typography>
          )}

          {estadoImpresion === 'finalizado' && (
            <>
              <Typography variant="body2" sx={{ m: 2 }}>
                ✅ Se imprimieron todas las campañas correctamente.
              </Typography>
              <Button
                onClick={() => {
                  window.location.reload(); // Recarga la página
                }}
                variant="contained"
                color="primary"
              >
                Aceptar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FacturasTable;
