import { Building, Phone, Mail, MapPin } from "lucide-react";

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  rtn?: string; // Registro Tributario Nacional
  logo?: string;
}

export const COMPANY_INFO: CompanyInfo = {
  name: "Carwash Peña Blanca",
  address: "Peña Blanca, Cortés frente a Cielos y Pisos Peña Blanca",
  phone: "9464-8987",
  email: "CARWASHPB@OUTLOOK.COM",
  rtn: "08011234567890", // RTN de ejemplo para Honduras
};

interface CompanyHeaderProps {
  showLogo?: boolean;
  showRTN?: boolean;
}

export function CompanyHeader({ showLogo = true, showRTN = true }: CompanyHeaderProps) {
  return (
    <div className="text-center border-b pb-4 mb-6">
      {showLogo && (
        <div className="mb-4">
          {/* Placeholder para logo - puede ser reemplazado por imagen */}
          <div className="w-16 h-16 bg-car-blue rounded-lg flex items-center justify-center mx-auto">
            <Building className="text-white text-2xl" />
          </div>
        </div>
      )}
      
      <h1 className="text-2xl font-bold text-gray-900">{COMPANY_INFO.name}</h1>
      
      <div className="mt-3 space-y-1 text-sm text-gray-600">
        <div className="flex items-center justify-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>{COMPANY_INFO.address}</span>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4" />
            <span>{COMPANY_INFO.phone}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4" />
            <span>{COMPANY_INFO.email}</span>
          </div>
        </div>
        
        {showRTN && COMPANY_INFO.rtn && (
          <div className="text-xs">
            RTN: {COMPANY_INFO.rtn}
          </div>
        )}
      </div>
    </div>
  );
}

interface InvoiceNumberProps {
  invoiceNumber: string;
  date: Date;
}

export function InvoiceHeader({ invoiceNumber, date }: InvoiceNumberProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">FACTURA</h2>
        <p className="text-sm text-gray-600">No. {invoiceNumber}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">Fecha:</p>
        <p className="font-medium">
          {date.toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}

interface TaxSummaryProps {
  subtotal: number;
  taxRate?: number;
  taxAmount: number;
  total: number;
  currency?: string;
}

export function TaxSummary({ 
  subtotal, 
  taxRate = 15, 
  taxAmount, 
  total, 
  currency = "L" 
}: TaxSummaryProps) {
  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Subtotal:</span>
        <span>{currency} {subtotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span>Impuesto sobre Ventas ({taxRate}%):</span>
        <span>{currency} {taxAmount.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-lg font-bold border-t pt-2">
        <span>TOTAL A PAGAR:</span>
        <span className="text-car-blue">{currency} {total.toFixed(2)}</span>
      </div>
    </div>
  );
}