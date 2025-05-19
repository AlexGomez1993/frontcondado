export interface Promotion {
  id: number;
  nombre: string;
  descripcion: string;
  montominimo: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface PromotionResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: Promotion[];
}
