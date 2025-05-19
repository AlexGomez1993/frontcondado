import { Users, BookOpenText, CheckCircle, FileText, Gift, House, Storefront, Ticket, Wallet } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'file-text': FileText,
  user: UserIcon,
  users: UsersIcon,
  gift: Gift,
  ticket: Ticket,
  store: Storefront,
  'fac-online': CheckCircle,
  payment_methods: Wallet,
  'home-client': House,
  reglament: BookOpenText,
  clients: Users
} as Record<string, Icon>;
