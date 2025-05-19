export interface PaymentMethod {
  id: number;
  nombre: string;
  descripcion: string;
  factor: number;
  activo: boolean;
}

export interface PaymentMethodResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: PaymentMethod[];
}
