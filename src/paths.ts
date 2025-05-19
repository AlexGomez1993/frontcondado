export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signInClient: '/auth/sign-in-client',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    customeronline: '/dashboard/customeronline',
    aprobacionline: '/dashboard/aprobacionline',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    home_client: '/dashboard/home_client',
  },
  errors: { notFound: '/errors/not-found' },
  campaigns: {
    list: '/campaigns/list',
    create: '/campaigns/create',
    edit: '/campaigns/edit/:id',
    addPromotions: '/comercial_stores/addPromotions/:id',
    addStores: '/comercial_stores/addStores/:id',
  },
  promotions: { list: '/promotions/list', create: '/promotions/create', edit: '/promotions/edit/:id' },
  comercial_stores: {
    list: '/comercial_stores/list',
    create: '/comercial_stores/create',
    edit: '/comercial_stores/edit/:id',
  },
  payment_methods: {
    list: '/payment_methods/list',
    create: '/payment_methods/create',
    edit: '/payment_methods/edit/:id',
  },
  clients: {
    list: '/clients/list',
    create: '/clients/create',
    edit: '/clients/edit/:id',
  },
} as const;
