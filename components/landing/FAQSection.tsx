'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: '¿Cómo funciona el proceso de compra?',
    answer:
      'Es muy simple: Regístrate en la plataforma, explora nuestro catálogo de proveedores certificados, selecciona los productos que deseas, completa tu orden y nosotros nos encargamos de la entrega a tu ubicación.'
  },
  {
    question: '¿Qué tipos de productos pueden importar?',
    answer:
      'Ofrecemos una amplia variedad de productos: electrónica, textiles, herramientas, cosméticos, alimentos, equipos industriales y mucho más. Todos vienen de proveedores verificados y certificados.'
  },
  {
    question: '¿Cuál es el tiempo de entrega?',
    answer:
      'Manejamos entregas en 15-30 días laborales dependiendo del producto y ubicación. Enviamos directamente desde los proveedores con todas las certificaciones y documentación completa.'
  },
  {
    question: '¿Hay monto mínimo de compra?',
    answer:
      'No tenemos monto mínimo obligatorio. Puedes comprar desde un solo producto. Sin embargo, ofrecemos descuentos especiales para pedidos mayores. Consúltanos para obtener cotizaciones personalizadas.'
  },
  {
    question: '¿Los productos tienen garantía?',
    answer:
      'Sí, todos nuestros productos vienen con la garantía del fabricante. Si algún producto no es lo que esperabas, tenemos una política de devolución sin preguntas en 30 días.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos transferencias bancarias, tarjetas de crédito, PayPal y otros métodos de pago seguros. Todas las transacciones son encriptadas y protegidas.'
  }
];

function FAQItem({ faq, index }: { faq: typeof FAQS[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="stagger-item border border-gray-200 rounded-xl overflow-hidden hover:border-rose-300 transition-colors"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-rose-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-rose-500 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-6 py-4 bg-rose-50 border-t border-gray-200 animate-fade-in-up">
          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Preguntas <span className="gradient-text">Frecuentes</span>
          </h2>
          <p className="text-lg text-gray-600">
            Respondemos tus dudas sobre compras y importaciones
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-linear-to-r from-emerald-100 to-green-100 rounded-2xl text-center">
          <p className="text-gray-900 font-medium mb-2">¿Tienes más preguntas?</p>
          <p className="text-gray-700 mb-4">
            Nuestro equipo está disponible para asistirte en cualquier momento
          </p>
          <button className="px-6 py-2 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-full font-bold hover:shadow-lg transition-all duration-250 btn-smooth">
            Contactar Soporte
          </button>
        </div>
      </div>
    </section>
  );
}
