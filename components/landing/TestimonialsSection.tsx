'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'María García',
    role: 'Propietaria de Tienda',
    image: '/imagen1.jpeg',
    content:
      'Importaciones Mía me ha permitido tener acceso a productos de calidad sin intermediarios. Los precios son competitivos y la entrega siempre puntual.',
    rating: 5
  },
  {
    name: 'Laura Rodríguez',
    role: 'Emprendedora',
    image: '/imagen2.jpeg',
    content:
      'Excelente servicio. He trabajado con muchos proveedores, pero Mía se destaca por su profesionalismo y variedad de productos certificados.',
    rating: 5
  },
  {
    name: 'Sofia Martínez',
    role: 'Gerente de Comercio',
    image: '/imagen3.jpeg',
    content:
      'La plataforma es fácil de usar y el soporte es excepcional. Recomiendo Importaciones Mía a todos mis colegas en el sector.',
    rating: 5
  },
  {
    name: 'Carmen López',
    role: 'Dueña de Negocio',
    image: '/imagen4.jpeg',
    content:
      'Confiable, transparente y con catálogos actualizados. He incrementado mi negocio gracias a la calidad de productos que Mía ofrece.',
    rating: 5
  }
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof TESTIMONIALS[0]; index: number }) {
  return (
    <div
      className="stagger-item bg-white rounded-2xl p-8 shadow-lg hover-lift relative"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Quote Icon */}
      <Quote className="w-8 h-8 text-rose-200 mb-4" />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 leading-relaxed mb-6 italic">
        &ldquo;{testimonial.content}&ldquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-bold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-20 bg-linear-to-b from-rose-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Lo que Dicen Nuestros <span className="gradient-text">Clientes</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Miles de clientes satisfechos con sus compras
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-gray-200">
          {[
            { value: '50K+', label: 'Clientas Satisfechas' },
            { value: '4.9⭐', label: 'Calificación Promedio' },
            { value: '98%', label: 'Tasa de Recompra' }
          ].map((stat, index) => (
            <div
              key={index}
              className="stagger-item text-center py-6"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </p>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
