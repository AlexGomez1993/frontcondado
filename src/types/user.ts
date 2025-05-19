export interface User {
  id: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  celular?: string;
  rol_id?: number;

  [key: string]: unknown;
}
