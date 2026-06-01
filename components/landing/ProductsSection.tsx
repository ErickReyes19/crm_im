'use client';

import Image from 'next/image';
import { Star, Heart } from 'lucide-react';
import { useState } from 'react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Sérum Luminoso',
    category: 'Sérum Facial',
    price: '$45.99',
    rating: 4.8,
    image: '/imagen2.jpeg',
    description: 'Vitamina C pura con efecto antioxidante'
  },
  {
    id: 2,
    name: 'Crema Hidratante',
    category: 'Cremas',
    price: '$52.99',
    rating: 4.9,
    image: '/imagen3.jpeg',
    description: 'Hidratación profunda de 24 horas'
  },
  {
    id: 3,
    name: 'Limpiador Suave',
    category: 'Limpieza',
    price: '$28.99',
    rating: 4.7,
    image: '/imagen4.jpeg',
    description: 'Limpia sin resecar la piel'
  },
  {
    id: 4,
    name: 'Mascarilla Renovadora',
    category: 'Tratamientos',
    price: '$38.99',
    rating: 4.9,
    image: '/imagen5.jpeg',
    description: 'Renovación celular en 15 minutos'
  },
  {
    id: 5,
    name: 'Contorno de Ojos',
    category: 'Ojos',
    price: '$35.99',
    rating: 4.8,
    image: '/imagen6.jpeg',
    description: 'Reduce ojeras y bolsas'
  },
  {
    id: 6,
    name: 'Bálsamo Labial',
    category: 'Labios',
    price: '$15.99',
    rating: 4.6,
    image: '/logo.jpeg',
    description: 'Protección y brillo natural'
  }
];

function ProductCard({ product, index }: { product: typeof PRODUCTS[0]; index: number }) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div
      className="group stagger-item h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="bg-white rounded-2xl shadow-lg hover-lift h-full flex flex-col overflow-hidden">
        {/* Image Container */}
        <div className="relative h-64 bg-linear-to-br from-emerald-100 to-green-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorited
                  ? 'fill-emerald-500 text-emerald-500'
                  : 'text-gray-400'
              } transition-colors`}
            />
          </button>
          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur rounded-full text-xs font-semibold text-emerald-600">
            {product.category}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {product.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-700">
              {product.rating}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-2xl font-bold gradient-text">
              {product.price}
            </span>
            <button className="px-4 py-2 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all duration-250 btn-smooth">
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  return (
    <section id="productos" className="py-20 bg-linear-to-b from-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Nuestros <span className="gradient-text">Productos Estrella</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Seleccionados especialmente para transformar tu rutina de belleza
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16 animate-fade-in-up">
          <button className="px-10 py-4 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 btn-smooth">
            Ver Todos los Productos
          </button>
        </div>
      </div>
    </section>
  );
}
