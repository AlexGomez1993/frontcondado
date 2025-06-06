import { Store } from "./comercial_store";
import { PaymentMethod } from "./payment_method";
import { Promotion } from "./promotion";

export interface Campaign {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  configuracion?: Configuracion;
  logo?: string;
  promociones?: Promotion[];
  tiendas?: Store[];
  formaspago?: PaymentMethod[];
}

interface Configuracion {
  descripcion: string;
  observacion: string;
}
export interface CampaignResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: Campaign[];
}


export interface CampaignPromotions {
  campania_id?: number;
  campania_nombre?: string;
  campania_tipoConfig?: string | number;
  promocion_id?: number;
  promocion_nombre?: string;
  promocion_montominimo?: string | number;
  forma_pago?: string | number;
  saldo_inicial?: string ;
  saldo_nuevo?: string ;
  total_cupones?: number;
}
