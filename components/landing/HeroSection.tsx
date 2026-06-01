'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-pink-50 to-white z-0" />

      {/* Decorative Circles */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float z-0" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-in-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full w-fit">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-semibold text-rose-700">
                Importaciones Premium
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Importaciones <span className="gradient-text">Mía</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-md">
              Descubre productos importados de calidad premium, cuidadosamente seleccionados de los mejores proveedores del mundo. Tu portal de confianza en importaciones.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* <Link
                href="#productos"
                className="px-8 py-4 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 btn-smooth"
              >
                Explorar Productos
                <ArrowRight className="w-5 h-5" />
              </Link> */}
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-rose-500 text-rose-500 rounded-full font-bold text-lg hover:bg-rose-50 transition-all duration-300"
              >
                Acceder
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                100% Confiable
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                Certificado
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                Garantizado
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 sm:h-125 lg:h-150 animate-slide-in-right">
            <div className="absolute inset-0 bg-linear-to-br from-rose-400 to-pink-500 rounded-3xl opacity-20 blur-2xl" />
            <Image
              src="/imagen1.png"
              alt="Importaciones Mía"
              fill
              className="object-cover rounded-3xl  hover-scale"
              priority
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Desplázate</span>
            <div className="w-6 h-10 border-2 border-rose-500 rounded-full flex justify-center p-2">
              <div className="w-1 h-2 bg-rose-500 rounded-full animate-pulse-custom" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
