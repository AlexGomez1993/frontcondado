import { Campaign } from './campaign';

export interface Store {
  id: number;
  nombre: string;
  descripcion: string;
  numcupones: string;
  logo?: string;
  activo: boolean;
}

export interface StoreResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: Store[];
}
