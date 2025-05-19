import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItemsUserTI = [
  /* { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' }, */
  { key: 'customers', title: 'Facturas', href: paths.dashboard.customers, icon: 'file-text' },
  {
    key: 'aprobacionline',
    title: 'Facturas Online',
    href: paths.dashboard.aprobacionline,
    icon: 'fac-online',
  },
  { key: 'integrations', title: 'Reglamento', href: paths.dashboard.integrations, icon: 'reglament' },
  { key: 'campaigns', title: 'Campañas', href: paths.campaigns.list, icon: 'gift' },
  { key: 'promotions', title: 'Promociones', href: paths.promotions.list, icon: 'ticket' },
  { key: 'comercial_stores', title: 'Locales Comerciales', href: paths.comercial_stores.list, icon: 'store' },
  { key: 'payment_methods', title: 'Formas de Pago', href: paths.payment_methods.list, icon: 'payment_methods' },
  { key: 'clients', title: 'Clientes', href: paths.clients.list, icon: 'clients' },
  { key: 'settings', title: 'Configuraciones', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Cuenta', href: paths.dashboard.account, icon: 'user' },
  
] satisfies NavItemConfig[];

export const navItemsClient = [
  { key: 'home', title: 'Inicio', href: paths.dashboard.home_client, icon: 'home-client' },
  { key: 'customeronline', title: 'Facturas Online', href: paths.dashboard.customeronline, icon: 'file-text' },
  { key: 'account', title: 'Cuenta', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];

export const navItemsMkt = [
  { key: 'integrations', title: 'Reglamento', href: paths.dashboard.integrations, icon: 'reglament' },
  { key: 'customers', title: 'Facturas', href: paths.dashboard.customers, icon: 'file-text' },
  {
    key: 'aprobacionline',
    title: 'Aprobación Facturas Online',
    href: paths.dashboard.aprobacionline,
    icon: 'fac-online',
  },
  { key: 'client', title: 'Clientes', href: paths.clients.list, icon: 'clients' },
] satisfies NavItemConfig[];
