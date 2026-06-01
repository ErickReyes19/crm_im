'use client';

import { Check, Leaf, Shield, Zap } from 'lucide-react';

const BENEFITS = [
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'Ingredientes orgánicos cuidadosamente seleccionados de proveedores certificados'
  },
  {
    icon: Shield,
    title: 'Dermatólogo Probado',
    description: 'Testado dermatológicamente y seguro para todo tipo de piel'
  },
  {
    icon: Zap,
    title: 'Resultados Visibles',
    description: 'Notarás cambios en tu piel en apenas 7 días de uso regular'
  }
];

const FEATURES = [
  'Libre de parabenos y químicos agresivos',
  'Cruelty-free y vegano',
  'Envases reciclables',
  'Fórmula hipoalergénica',
  'Apto para embarazadas',
  'Certificado orgánico USDA'
];

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ¿Por Qué Elegir <span className="gradient-text">Mía?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprometidos con tu confianza
          </p>
        </div>

        {/* Main Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="stagger-item p-8 bg-linear-to-br from-rose-50 to-pink-50 rounded-2xl hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-linear-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="bg-linear-to-r from-rose-500 to-pink-500 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-8">Características Incluidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Check className="w-6 h-6 text-white shrink-0 mt-1" />
                <span className="text-lg font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
