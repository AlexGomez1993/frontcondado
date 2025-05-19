export interface Invoice {
    numero: string;
    monto: string;
    tienda_id: number;
    tienda_nombre: string;
    formapago_id: number;
    formapago_nombre: string;
    numcupones: number;
}

export interface PromotionInvoice {
    id:number;
    nombre: string;
    montominimo: string;
    nuevoSaldo: string;
    saldoInicial: string;
    facturas: Invoice[];
}

export interface CampaignInvoice {
    id: number;
    nombre: string;
    totalcupones: number;
    tipo_configuracion: number;
    promociones: PromotionInvoice[];
}

export interface CustomerInvoice {
    cliente_id: number;
    usuario_id: number;
    ruc: string;
    campanias: CampaignInvoice[];
}
