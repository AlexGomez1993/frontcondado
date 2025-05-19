export interface Variable {
  id: number;
  nombre: string;
  descripcion: string;
  valor: string;
  valoractual: string;
}

export interface VariableResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: Variable[];
}
