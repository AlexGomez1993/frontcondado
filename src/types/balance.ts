export interface Balance {
  id: number;
  campania_id: string;
  descripcion: string;
  observacion: string;
  fecha: string;
  user: number;
  activo: boolean;
  campanias: Campaign;
}

export interface BalanceResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: Balance[];
}

interface Campaign {
  id: number;
  nombre: string;
  descripcion: string;
}
