export interface Client {
  id: number;
  nombre: string;
  apellidos: string;
  email:string;
  direccion: string;
  telefono: string;
  celular: string;
  ruc: string;
  activo: boolean;
}

export interface ClientResponse {
  total: number;
  pagina: number;
  limit: number;
  totalPaginas: number;
  data: Client[];
}
