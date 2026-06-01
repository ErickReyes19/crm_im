'use client';

import { ArrowRight, Droplet, Sparkles, Sun, Moon } from 'lucide-react';

const STEPS = [
  {
    icon: Droplet,
    number: '01',
    title: 'Regístrate',
    description: 'Crea tu cuenta en Importaciones Mía en menos de 2 minutos'
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'Explora Catálogo',
    description: 'Navega entre miles de productos de proveedores certificados'
  },
  {
    icon: Sun,
    number: '03',
    title: 'Realiza tu Orden',
    description: 'Selecciona tus productos y completa tu compra de forma segura'
  },
  {
    icon: Moon,
    number: '04',
    title: 'Recibe tu Compra',
    description: 'Entrega rápida y segura directamente a tu ubicación'
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-linear-to-b from-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Tu Proceso de <span className="gradient-text">Compra</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Solo 4 pasos simples para conseguir tus productos
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection Lines (Desktop Only) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-linear-to-r from-transparent via-pink-300 to-transparent" />

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="stagger-item relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover-lift h-full">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-linear-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-rose-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow (Mobile) */}
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-rose-300 mt-6 lg:hidden" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Result Preview */}
        <div className="mt-16 bg-linear-to-r from-rose-500 to-pink-500 rounded-3xl p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Satisfacción Garantizada</h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Todos nuestros productos vienen con garantía. Si no estás satisfecho, devolvemos tu dinero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold">✓</p>
              <p>Calidad Asegurada</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">✓</p>
              <p>Precios Justos</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">✓</p>
              <p>Envío Rápido</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
