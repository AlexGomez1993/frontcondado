'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { NewClientDialog } from '@/components/dashboard/customer/newClientDialog';
import axiosClient from '@/lib/axiosClient';
import { PaymentMethod, PaymentMethodResponse } from '@/types/payment_method';
import { Campaign, CampaignPromotions, CampaignResponse } from '@/types/campaign';
import { CustomerInvoice, Invoice } from '@/types/invoice';
import { PlusCircle, TipJar, Trash } from '@phosphor-icons/react';
import { Store } from '@/types/comercial_store';
import { CustomerBalance } from '@/types/customerBalance';
import { useUser } from '@/hooks/use-user';

interface Factura {
  local_nombre: string;
  local_id: string;
  formaPago_nombre: string;
  formaPago_id: string;
  numeroFactura: string;
  promocion_nombre: string;
  promocion_id: string;
  campania_nombre: string;
  campania_id: string;
  montoFactura: string;
  saldoAnterior: string;
  cupones: number;
}

export interface Cliente {
  id?: string;
  nombres: string;
  apellidos: string;
  ciRuc: string;
  email: string;
  direccion: string;
  fechaNacimiento: string;
  sexo: number;
  telefono: string;
  celular: string;
  provincia: string;
  ciudad: string;
}
interface CampaniaSeleccionada {
  campaniaId: number | '';
  promocionId: number | '';
}

export default function FacturaForm() {
  const { user } = useUser();
  const [facturasIngreso, setFacturasIngreso] = useState<CustomerInvoice>({
    cliente_id: 0,
    usuario_id: 0,
    ruc: '',
    campanias: [],
  });
  const [selectedRows, setSelectedRows] = useState<CampaignPromotions[]>([]);

  const [local, setLocal] = useState<string>('0');
  const [monto, setMonto] = useState('');
  const [facturaNum, setFacturaNum] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogValidate, setOpenDialogValidate] = useState(false);
  const [locales, setLocales] = useState<Store[]>([]);
  const [campanias, setCampanias] = useState<Campaign[]>([]);
  const [formasPago, setFormasPago] = useState<PaymentMethod[]>([]);
  const [cuponesPorImprimir, setCuponesPorImprimir] = useState<any[]>([]);
  const [indiceCampania, setIndiceCampania] = useState(0);
  const [openCuponDialog, setOpenCuponDialog] = useState(false);
  const [estadoImpresion, setEstadoImpresion] = useState<'listo' | 'imprimiendo' | 'transicion' | 'finalizado'>('listo');
  const [cuentaRegresiva, setCuentaRegresiva] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error' | 'warning'>('success');
  const [isEditing, setIsEditing] = useState(false);
  const [cliente, setCliente] = useState<Cliente>({
    id: '',
    nombres: '',
    apellidos: '',
    ciRuc: '',
    email: '',
    direccion: '',
    fechaNacimiento: '',
    sexo: 0,
    telefono: '',
    celular: '',
    provincia: '',
    ciudad: '',
  });


  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const response = await axiosClient.get<PaymentMethodResponse>(`/api/formasPago?activo=1`);
        setFormasPago(response.data.data);
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
        const response = await axiosClient.get<CampaignResponse>(`/api/campanias?activo=1`);
        const campaniasActivas: Campaign[] = response.data.data;
        setCampanias(response.data.data || []);
        setLocales(campaniasActivas[0].tiendas || [])
      } catch (error) {
        console.error('Error al cargar campañas:', error);
      }
    };

    fetchCampanias();
  }, []);

  useEffect(() => {
    if (campanias && campanias.length > 0) {
      setSelectedRows([
        {
          campania_id: campanias[0].id || 0,
          campania_nombre: campanias[0].nombre || undefined,
          campania_tipoConfig: campanias[0].configuracion?.descripcion || 0,
          promocion_id: campanias[0].promociones ? campanias[0].promociones[0].id : 0,
          promocion_nombre: campanias[0].promociones ? campanias[0].promociones[0].nombre : '',
          promocion_montominimo: campanias[0].promociones ? campanias[0].promociones[0].montominimo : 0,
          forma_pago: 0,
        }
      ]);
    } else {
      setSelectedRows([]);
    }
  }, [campanias]);

  const handleGuardar = async () => {
    try {
      if (!facturasIngreso || !facturasIngreso.campanias.length) {
        console.warn("No hay facturas para enviar.");
        //alert('Por favor, agrege una factura');
        setSnackbarType('warning');
        setSnackbarMsg('Por favor, agrege una factura');
        setSnackbarOpen(true);
        return;
      }

      const body = {
        facturasCliente: facturasIngreso,
      };

      const response = await axiosClient.post('/api/facturas/facturasIsla', body);

      if (response.status === 200 || response.status === 201) {
        const { cuponesImprimir } = response.data;

        if (cuponesImprimir?.length) {
          setCuponesPorImprimir(cuponesImprimir);
          setIndiceCampania(0);
          setOpenCuponDialog(true);
        }

        setFacturasIngreso({
          cliente_id: 0,
          usuario_id: 0,
          ruc: '',
          campanias: [],
        });
      } else {
        console.error("Error al enviar facturas:", response.status, response.data);
      }

    } catch (error: any) {
      console.error("Error en la solicitud:", error?.response?.data || error.message);
    }
  };

  const handleCampaignChange = (index: number, campaignId: number | string) => {
    const campania: Campaign | undefined = campanias.find(c => c.id === campaignId);
    const primeraPromo = campania ? campania.promociones![0] : undefined;
    const newRows = [...selectedRows];
    newRows[index] = {
      campania_id: campania?.id,
      campania_nombre: campania?.nombre,
      campania_tipoConfig: campania?.configuracion?.descripcion,
      promocion_id: primeraPromo?.id,
      promocion_nombre: primeraPromo?.nombre || '',
      promocion_montominimo: primeraPromo?.montominimo || 0,
    };
    setSelectedRows(newRows);
  };
  const handlePromotionChange = (index: number, promocionId: number | string) => {
    const row = selectedRows[index];
    const campania = campanias.find(c => c.id == row.campania_id);
    const promocion = campania?.promociones?.find(p => p.id == promocionId);

    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      promocion_id: promocion?.id,
      promocion_nombre: promocion?.nombre,
      promocion_montominimo: promocion?.montominimo
    };
    setSelectedRows(newRows);
  };

  const handleMethodPayChange = (index: number, formaPagoId: number | string) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      forma_pago: formaPagoId
    };
    setSelectedRows(newRows);
  };
  const addRow = () => {
    setSelectedRows([
      ...selectedRows,
      {
        campania_id: undefined,
        campania_nombre: '',
        campania_tipoConfig: 0,
        promocion_id: undefined,
        promocion_nombre: '',
        promocion_montominimo: 0,
        forma_pago: 0
      }
    ]);
  };

  const removeRow = (index: number) => {
    if (selectedRows.length > 1) {
      const updatedRows = selectedRows.filter((_, i) => i !== index);
      setSelectedRows(updatedRows);
    }
  };

  const obtenerClientePorRuc = async (ruc: string) => {
    try {
      const response = await axiosClient.get(`/api/clientes/obtenerCliente?ruc=${ruc}`);

      return response.data.clienteExistente || {};
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return null;
    }
  };

  const handleRucChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const ruc = event.target.value;
    setCliente({ ...cliente, ciRuc: ruc });

    if (ruc.length === 10 || ruc.length === 13) {
      const clienteData = await obtenerClientePorRuc(ruc);
      if (clienteData) {
        setCliente({
          ...cliente,
          id: clienteData.id,
          nombres: clienteData.nombre,
          apellidos: clienteData.apellidos,
          email: clienteData.email,
          direccion: clienteData.direccion,
          fechaNacimiento: clienteData.fecha_nacimiento,
          telefono: clienteData.telefono,
          celular: clienteData.celular,
          ciRuc: clienteData.ruc,
          sexo: clienteData.sexo || '',
          provincia: clienteData.provincia || 'Pichincha',
          ciudad: clienteData.ciudad || 'Quito',
        });
        return;
      }

      setOpenDialog(true);
    }
  };

  const actualizarSaldoInicial = (saldoinicial: number, index: number) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      saldo_inicial: saldoinicial.toString()
    };
    setSelectedRows(newRows);
  }
  const actualizarSaldo = (nuevoSaldo: number, index: number) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      saldo_nuevo: nuevoSaldo.toString()
    };
    setSelectedRows(newRows);
  }
  const actualizarCupones = (nuevosCupones: number, index: number) => {
    const row = selectedRows[index];
    const newRows = [...selectedRows];
    newRows[index] = {
      ...row,
      total_cupones: nuevosCupones
    };
    setSelectedRows(newRows);
  }
  const obtenerSaldoInicialPromocion = async (
    facturasIngreso: CustomerInvoice,
    cliente_id: number,
    campania_id: number,
    promocion_id: number,
    saldoActualPorPromocion: { [key: string]: number }
  ): Promise<number> => {
    const key = `${campania_id}-${promocion_id}`;

    if (saldoActualPorPromocion[key] !== undefined) {
      return saldoActualPorPromocion[key];
    }

    const saldoExistente = facturasIngreso?.campanias
      .find((camp) => camp.id === campania_id)
      ?.promociones.find((p) => p.id === promocion_id)?.nuevoSaldo;

    if (saldoExistente !== undefined) {
      const saldo = parseFloat(saldoExistente);
      saldoActualPorPromocion[key] = saldo;
      return saldo;
    }

    const response = await axiosClient.post('/api/saldosCliente', {
      cliente_id,
    });

    const saldoInicialCliente = response.data.data.find(
      (saldo: CustomerBalance) =>
        saldo.campania_id === campania_id && saldo.promocion_id === promocion_id
    );

    const saldo = saldoInicialCliente ? parseFloat(saldoInicialCliente.saldo) : 0;
    saldoActualPorPromocion[key] = saldo;
    return saldo;
  };

  const agregarFactura = async () => {
    if (isEditing) {
      //alert('');
      setSnackbarType('warning');
      setSnackbarMsg('Por favor termine de editar los datos del cliente');
      setSnackbarOpen(true);
      return;
    }
    if (!monto || !local || local == '0') {
      setSnackbarType('warning');
      setSnackbarMsg('Por favor revise que todos los campos estén llenos');
      setSnackbarOpen(true);
      return;
    }
    if (selectedRows.some((c) => c.forma_pago == 0)) {
      setSnackbarType('warning');
      setSnackbarMsg('Por favor revise seleccione una forma de pago');
      setSnackbarOpen(true);
      return;
    }
    if (!selectedRows || selectedRows.length === 0) return;
    if (!cliente?.id || !cliente?.ciRuc || !user?.id) return;

    const localData = locales.find((l) => l.id == parseInt(local));
    const montoFactura = Number(monto);
    const cuponesLocal = localData?.numcupones ?? 0;
    const user_id = user.id;

    let nuevaFacturaIngreso: CustomerInvoice = { ...facturasIngreso };

    if (!nuevaFacturaIngreso.cliente_id || nuevaFacturaIngreso.cliente_id === 0) {
      nuevaFacturaIngreso.cliente_id = parseInt(cliente.id);
      nuevaFacturaIngreso.usuario_id = parseInt(user_id);
      nuevaFacturaIngreso.ruc = cliente.ciRuc;
      nuevaFacturaIngreso.campanias = [];
    }

    const saldoActualPorPromocion: { [key: string]: number } = {};

    for (const c of selectedRows) {
      const formaPago = formasPago.find((fp) => fp.id === c.forma_pago);
      const factor = formaPago?.factor || 1;
      const montoMinimo = Number(c.promocion_montominimo);
      let saldoInicialValor = 0;
      let cantidadCupones = 0;
      let nuevoSaldoCalculado = 0;

      const promocionKey = `${c.campania_id}-${c.promocion_id}`;

      if (c.campania_tipoConfig == 1) {
        saldoInicialValor = await obtenerSaldoInicialPromocion(
          nuevaFacturaIngreso,
          parseInt(cliente.id),
          c.campania_id!,
          c.promocion_id!,
          saldoActualPorPromocion
        );

        actualizarSaldoInicial(saldoInicialValor, selectedRows.indexOf(c));

        const total = saldoInicialValor + montoFactura;
        cantidadCupones = Math.floor(total / montoMinimo) * factor * parseInt(cuponesLocal.toString());
        actualizarCupones(cantidadCupones, selectedRows.indexOf(c));

        nuevoSaldoCalculado = Number((total % montoMinimo).toFixed(2));
        actualizarSaldo(nuevoSaldoCalculado, selectedRows.indexOf(c));

        saldoActualPorPromocion[promocionKey] = nuevoSaldoCalculado;
      }

      if (c.campania_tipoConfig == 2) {
        const total = montoFactura;
        cantidadCupones = Math.floor(total / montoMinimo) * factor * parseInt(cuponesLocal.toString());
        actualizarCupones(cantidadCupones, selectedRows.indexOf(c));
        saldoInicialValor = 0;
        nuevoSaldoCalculado = 0;
      }

      const nuevaFactura: Invoice = {
        numero: facturaNum,
        monto: monto,
        tienda_id: localData!.id,
        tienda_nombre: localData!.nombre,
        formapago_id: formaPago!.id,
        formapago_nombre: formaPago!.nombre,
        numcupones: cantidadCupones,
      };

      let campania = nuevaFacturaIngreso.campanias.find((camp) => camp.id === c.campania_id);
      if (!campania) {
        campania = {
          id: c.campania_id!,
          nombre: c.campania_nombre!,
          tipo_configuracion: Number(c.campania_tipoConfig),
          totalcupones: 0,
          promociones: [],
        };
        nuevaFacturaIngreso.campanias.push(campania);
      }

      let promocion = campania.promociones.find((p) => p.id === c.promocion_id);
      if (!promocion) {
        promocion = {
          id: c.promocion_id!,
          nombre: c.promocion_nombre!,
          montominimo: c.promocion_montominimo!.toString(),
          nuevoSaldo: "0",
          saldoInicial: "0",
          facturas: [],
        };
        campania.promociones.push(promocion);
      }

      promocion.nuevoSaldo = nuevoSaldoCalculado.toString();
      promocion.saldoInicial = saldoInicialValor.toString();
      promocion.facturas.push(nuevaFactura);
      campania.totalcupones += nuevaFactura.numcupones;
    }

    setFacturasIngreso(nuevaFacturaIngreso);
    setFacturaNum('');
    setMonto('');
    setLocal('0');
  };

  const eliminarFactura = (
    campaniaId: number,
    promocionId: number,
    facturaIndex: number
  ) => {
    const nuevaFacturas = { ...facturasIngreso };

    const campania = nuevaFacturas.campanias.find((c) => c.id === campaniaId);
    if (!campania) return;

    const promocion = campania.promociones.find((p) => p.id === promocionId);
    if (!promocion) return;
    const saldoGuardado = parseFloat(promocion.nuevoSaldo || "0");
    const facturaEliminadaDatos = promocion.facturas[facturaIndex];
    // Eliminar la factura
    promocion.facturas.splice(facturaIndex, 1);

    // Recalcular total de cupones
    const totalCupones = promocion.facturas.reduce(
      (sum, f) => sum + f.numcupones,
      0
    );
    campania.totalcupones = campania.promociones.reduce(
      (sum, p) => sum + p.facturas.reduce((s, f) => s + f.numcupones, 0),
      0
    );

    // Recalcular nuevoSaldo si aún hay facturas
    if (promocion.facturas.length > 0) {
      const montominimo = parseFloat(promocion.montominimo);
      const totalMonto = promocion.facturas.reduce(
        (sum, f) => sum + parseFloat(f.monto),
        0
      );
      const local = locales.find((l) => l.id == facturaEliminadaDatos.tienda_id);
      const cuponPorLocal = parseInt(local!.numcupones) || 1;
      const formaPago = formasPago.find(
        (fp) => fp.id == facturaEliminadaDatos.formapago_id
      );
      const factor = formaPago?.factor || 1;

      // Recalcular saldo restante (solo si la campaña es tipo 1)
      if (campania.tipo_configuracion === 1) {
        const saldoCalculado =
          (facturaEliminadaDatos.numcupones / (factor * cuponPorLocal)) * montominimo + saldoGuardado - parseFloat(facturaEliminadaDatos.monto);

        promocion.nuevoSaldo = saldoCalculado.toFixed(2);
        const saldoAntiguo = promocion.saldoInicial;
        const nuevoSaldoAntiguo = parseFloat(saldoAntiguo) - (parseFloat(facturaEliminadaDatos.monto) % montominimo)
        promocion.saldoInicial = nuevoSaldoAntiguo.toFixed(2);
      }
    } else {
      // Si no hay facturas, quitar la promoción
      campania.promociones = campania.promociones.filter(
        (p) => p.id !== promocionId
      );
    }

    // Si no hay promociones, quitar la campaña
    if (campania.promociones.length === 0) {
      nuevaFacturas.campanias = nuevaFacturas.campanias.filter(
        (c) => c.id !== campaniaId
      );
    }

    setFacturasIngreso(nuevaFacturas);
  };

  /* const imprimirCupones = () => {
    const imprimirSecuencial = async (i: number) => {
      const campaniaActual = cuponesPorImprimir[indiceCampania]; // accede dinámicamente

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
              <tr><td><strong>CLIENTE:</strong></td><td>${cliente?.nombres} ${cliente?.apellidos}</td></tr>
              <tr><td><strong>CI/RUC:</strong></td><td>${cliente?.ciRuc}</td></tr>
              <tr><td><strong>TELÉFONO:</strong></td><td>${cliente?.telefono}</td></tr>
              <tr><td><strong>CELULAR:</strong></td><td>${cliente?.celular}</td></tr>
              <tr><td><strong>DIRECCIÓN:</strong></td><td>${cliente?.direccion}</td></tr>
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
  }; */

const imprimirCupones = () => {
  const imprimirSecuencial = async (i: number) => {
    const campaniaActual = cuponesPorImprimir[indiceCampania];
    if (!campaniaActual) return;

    const start = campaniaActual.ultimoCuponImpreso + 1;
    const end = campaniaActual.ultimoCuponImprimir;
    const totalCupones = end - start + 1;
    const campaniaSelect = campanias.find((c) => c.nombre === campaniaActual.campania);
    const logo = campaniaSelect?.logo;

    const isCampaniaMujer2025 = campaniaActual.campania === 'NAVIDAD 2024';

    // ✅ Condición de corte para campañas normales
    if (!isCampaniaMujer2025 && i > end) {
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

    // 🎯 Campaña especial: imprime solo un cupón
    if (isCampaniaMujer2025) {
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
              .shopping-dollars { font-weight: bold; font-size: 8pt; color: #D32F2F; padding-top: 8px; }
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
              <tr><td><strong>NÚMERO DE CUPON:</strong></td><td>${start}</td></tr>
              <tr><td><strong>FECHA Y HORA:</strong></td><td>${new Date().toLocaleString()}</td></tr>
              <tr><td><strong>CLIENTE:</strong></td><td>${cliente?.nombres} ${cliente?.apellidos}</td></tr>
              <tr><td><strong>CI/RUC:</strong></td><td>${cliente?.ciRuc}</td></tr>
              <tr><td><strong>TELÉFONO:</strong></td><td>${cliente?.telefono}</td></tr>
              <tr><td><strong>CELULAR:</strong></td><td>${cliente?.celular}</td></tr>
              <tr><td><strong>DIRECCIÓN:</strong></td><td>${cliente?.direccion}</td></tr>
              <tr><td><strong>CAMPAÑA:</strong></td><td>${campaniaActual.campania}</td></tr>
              <tr><td colspan="2" class="shopping-dollars">
                SHOPPING DOLLARS A ENTREGAR: ${totalCupones}
              </td></tr>
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

          // ⏭️ Transición a la siguiente campaña
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
        }, 100);
      };

      return;
    }

    // 🖨️ Impresión secuencial normal
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
              <tr><td><strong>CLIENTE:</strong></td><td>${cliente?.nombres} ${cliente?.apellidos}</td></tr>
              <tr><td><strong>CI/RUC:</strong></td><td>${cliente?.ciRuc}</td></tr>
              <tr><td><strong>TELÉFONO:</strong></td><td>${cliente?.telefono}</td></tr>
              <tr><td><strong>CELULAR:</strong></td><td>${cliente?.celular}</td></tr>
              <tr><td><strong>DIRECCIÓN:</strong></td><td>${cliente?.direccion}</td></tr>
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

  const handleGuardarDatosCliente = async () => {
    try {
      await axiosClient.put(`/api/clientes/${cliente.id}`, {
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        email: cliente.email,
        direccion: cliente.direccion,
        celular: cliente.celular
      });

      setSnackbarType('success');
      setSnackbarMsg('Cliente editado con éxito');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setSnackbarType('error');
      setSnackbarMsg('Error al editar el cliente');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleEnableEdit = () => {
    if (cliente.id) { setIsEditing(true) }
    else {
      setSnackbarType('warning');
      setSnackbarMsg('Primero debe ingresar el número de identidad de un cliente.');
      setSnackbarOpen(true);
    }
  }

  const handleValidar = async () => {
    if (!facturaNum || !local || local == '0'){
      setSnackbarType('error');
      setSnackbarMsg('Revise que los campos de local y número de factura esten llenos.');
      setSnackbarOpen(true);
      return;
    } 

    try {
      const response = await axiosClient.post(`/api/facturas/validarFactura`, {
        numeroFactura: facturaNum,
        tienda_id: local
      });

      if (response.status === 200) {
        setFacturaNum('');
        setOpenDialogValidate(true);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setSnackbarType('success');
        setSnackbarMsg('Factura válida. Puedes continuar.');
        setSnackbarOpen(true);
      } else {
        setSnackbarType('error');
        setSnackbarMsg('Error al validar la factura');
        setSnackbarOpen(true);
      }
    }
  };
  const handleCloseDialogValidate = () => {
    setOpenDialogValidate(false);
  };
    const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
          <TipJar style={{ marginRight: 8 }} />
          Nueva Factura
        </Typography>

        {!isEditing ? (
          <Button variant="outlined" color="primary" onClick={handleEnableEdit}>
            Editar datos del cliente
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleGuardarDatosCliente}>
            Guardar datos
          </Button>
        )}
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="R.U.C." variant="outlined" onChange={handleRucChange} size='small' />
        </Grid>
        <NewClientDialog openDialog={openDialog} setOpenDialog={setOpenDialog} cliente={cliente} setCliente={setCliente} />

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={cliente.nombres}
            onChange={(e) => setCliente({ ...cliente, nombres: e.target.value })}
            size='small'
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Apellido"
            variant="outlined"
            value={cliente.apellidos}
            onChange={(e) => setCliente({ ...cliente, apellidos: e.target.value })}
            size='small'
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Correo"
            type="email"
            variant="outlined"
            value={cliente.email}
            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
            size='small'
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Celular"
            variant="outlined"
            value={cliente.celular}
            onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
            size='small'
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Dirección"
            variant="outlined"
            value={cliente.direccion}
            onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
            size='small'
            disabled={!isEditing}
          />
        </Grid>
        {selectedRows.map((row: CampaignPromotions, index: number) => {
          const campania = campanias.find((c) => c.id === row.campania_id);

          return (
            <Grid container spacing={2} item xs={12} key={index} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id={`campania-label-${index}`}>Campaña</InputLabel>
                  <Select
                    labelId={`campania-label-${index}`}
                    value={row.campania_id || ''}
                    onChange={(e) => handleCampaignChange(index, e.target.value)}
                    label="Campaña"
                    size="small"
                  >
                    {campanias.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id={`promocion-label-${index}`}>Promoción</InputLabel>
                  <Select
                    labelId={`promocion-label-${index}`}
                    value={row.promocion_id || ''}
                    onChange={(e) => handlePromotionChange(index, e.target.value)}
                    label="Promoción"
                    disabled={!row.campania_id}
                    size="small"
                  >
                    {campania?.promociones?.map((p) => (
                      <MenuItem key={p.id} value={p.id.toString()}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={1.7}>
                <TextField
                  fullWidth
                  label="Monto Mínimo"
                  variant="outlined"
                  value={`$${Number(row.promocion_montominimo).toFixed(2)}` || 0}
                  disabled
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id={`forma-pago-label-${index}`}>Forma de Pago</InputLabel>
                  <Select
                    labelId={`forma-pago-label-${index}`}
                    value={row.forma_pago || 0}
                    onChange={(e) => handleMethodPayChange(index, e.target.value)}
                    label="Forma de Pago"
                    size="small"
                  >
                    <MenuItem value={0}>
                      Seleccione...
                    </MenuItem>
                    {campania?.formaspago?.map((fp) => (
                      <MenuItem key={fp.id} value={fp.id}>
                        {fp.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs="auto">
                <Tooltip title="Eliminar campaña">
                  <IconButton
                    onClick={() => removeRow(index)}
                    color="error"
                    size="small"
                  >
                    <Trash size={20} />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs="auto">
                <Tooltip title="Agregar Campaña">
                  <IconButton
                    onClick={() => addRow()}
                    color="secondary"
                    size="small"
                  >
                    <PlusCircle size={20} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          );
        })}
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth sx={{ mt: 0.3 }}>
            <Autocomplete
              options={locales}
              getOptionLabel={(option) => option?.nombre || 'Seleccione'}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              onChange={(event, newValue) => setLocal(newValue?.id?.toString() || '0')}
              value={locales.find((loc) => loc.id.toString() === local) || null}
              renderInput={(params) => (
                <TextField {...params} label="Local" size="small" variant="outlined" />
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Número de Factura (últimos 6 dígitos)"
            variant="outlined"
            value={facturaNum}
            inputProps={{ maxLength: 6 }}
            onChange={(e) => setFacturaNum(e.target.value)}
            onBlur={handleValidar}
            size='small'
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Monto de la Factura"
            type="text"
            inputMode="decimal"
            value={monto}
            onChange={(e) => {
              let valor = e.target.value;
              valor = valor.replace(",", ".");

              // Permitir solo números con un punto y máximo 2 decimales
              if (/^\d*\.?\d{0,2}$/.test(valor) || valor === "") {
                setMonto(valor);
              }
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button fullWidth variant="contained" onClick={agregarFactura} size='small'>
            + AGREGAR
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Local</TableCell>
              <TableCell>Pago</TableCell>
              <TableCell>Factura</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Cupones</TableCell>
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturasIngreso?.campanias.flatMap((campania, iCampania) =>
              campania.promociones.flatMap((promocion, iPromo) => [
                <TableRow key={`${iCampania}-${iPromo}`}>
                  <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    {campania.nombre} - {promocion.nombre}
                  </TableCell>
                </TableRow>,
                ...promocion.facturas.map((factura, index) => (
                  <TableRow key={`factura-${iCampania}-${iPromo}-${index}`}>
                    <TableCell>{factura.tienda_nombre}</TableCell>
                    <TableCell>{factura.formapago_nombre}</TableCell>
                    <TableCell>{factura.numero}</TableCell>
                    <TableCell>$ {parseFloat(factura.monto).toFixed(2)}</TableCell>
                    <TableCell>{factura.numcupones}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() =>
                          eliminarFactura(campania.id, promocion.id, index)
                        }
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                )),
              ])
            )}
          </TableBody>

        </Table>
      </TableContainer>
      <TableContainer component={Paper} sx={{ mt: 3, border: '2px solid red' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Promoción</TableCell>
              <TableCell>Monto Mín.</TableCell>
              <TableCell>Saldo Ant.</TableCell>
              <TableCell># Facturas</TableCell>
              <TableCell>Cupones</TableCell>
              <TableCell>Saldo Nue.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturasIngreso?.campanias.map((campania, iCampania) => (
              <React.Fragment key={iCampania}>
                <TableRow>
                  <TableCell colSpan={6} sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    {campania.nombre}
                  </TableCell>
                </TableRow>

                {campania.promociones.map((promocion, iPromo) => {

                  const totalCuponesPromocion = promocion.facturas.reduce(
                    (total: number, factura: any) => total + factura.numcupones,
                    0
                  );
                  return (
                    <TableRow key={`${iCampania}-${iPromo}`}>
                      <TableCell>{promocion.nombre}</TableCell>
                      <TableCell>$ {parseFloat(promocion.montominimo).toFixed(2)}</TableCell>
                      <TableCell>$ {parseFloat(promocion.saldoInicial).toFixed(2)}</TableCell>
                      <TableCell>{promocion.facturas.length}</TableCell>
                      <TableCell>{totalCuponesPromocion}</TableCell>
                      <TableCell>$ {parseFloat(promocion.nuevoSaldo).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{ mr: 1 }}
          onClick={() => { window.location.reload(); }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ mr: 1 }}
          onClick={() => { window.location.reload(); }}>
          Nuevo
        </Button>
        <Button variant="contained" color="success" onClick={handleGuardar}>
          Guardar
        </Button>
      </Box>
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
                  window.location.reload();
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
      <Dialog open={openDialogValidate} onClose={handleCloseDialogValidate} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Factura Registrada
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', padding: '16px 24px' }}>
          <Typography variant="body1" sx={{ fontSize: '1rem', color: '#555', marginBottom: '16px' }}>
            La factura ya ha sido registrada anteriormente. No se permiten duplicados.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={handleCloseDialogValidate}
            color="secondary"
            variant="contained"
            sx={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
