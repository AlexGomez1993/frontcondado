'use client';

import type { User } from '@/types/user';

import axiosClient from '../axiosClient';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'desarrollocci@smo.ec',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  username: string;
  password: string;
}

export interface SignInClientWithPasswordParams {
  ruc: string;
  password: string;
}
export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { username, password } = params;

    try {
      const response = await axiosClient.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.loginStatus === 'success') {
        const { token, user } = response.data;

        localStorage.setItem('custom-auth-token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return {};
      } else {
        return { error: 'Login failed' };
      }
    } catch (err: any) {
      console.error('Error durante la solicitud de login', err);

      if (err.response) {
        if (err.response.status === 404) {
          return { error: err.response.data.message };
        }

        return { error: err.response?.data?.message || 'Ocurrió un error desconocido' };
      } else {
        return { error: 'Error al conectar con el servidor' };
      }
    }
  }

  async signInClientWithPassword(params: SignInClientWithPasswordParams): Promise<{ error?: string }> {
    const { ruc, password } = params;

    try {
      const response = await axiosClient.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/loginCliente`,
        {
          ruc,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.loginStatus === 'success') {
        const { token, user } = response.data;

        localStorage.setItem('custom-auth-token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return {};
      } else {
        return { error: 'Login failed' };
      }
    } catch (err: any) {
      console.error('Error durante la solicitud de login', err);

      if (err.response) {
        if (err.response.status === 404) {
          return { error: err.response.data.message };
        }

        return { error: err.response?.data?.message || 'Ocurrió un error desconocido' };
      } else {
        return { error: 'Error al conectar con el servidor' };
      }
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    const user = localStorage.getItem('user');
    if (user) {
      return { data: JSON.parse(user) };
    }

    return { data: null };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user');

    return {};
  }
}

export const authClient = new AuthClient();
