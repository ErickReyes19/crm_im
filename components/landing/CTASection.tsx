'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-linear-to-r from-rose-500 to-pink-500 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 animate-fade-in-up">
          Comienza Tus Compras Hoy
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in-up">
          Únete a miles de empresas que confían en Importaciones Mía. Obtén acceso exclusivo a catálogos premium.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up">
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-rose-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 btn-smooth"
          >
            Comprar Ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#contacto"
            className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
          >
            Más Información
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer id="contacto" className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/logo.jpeg"
              alt="Importaciones Mía"
              width={48}
              height={48}
              className="rounded-full"
            />
            <h3 className="text-xl font-bold text-white">Importaciones Mía</h3>
            <p className="text-sm leading-relaxed">
              Tu portal confiable de importaciones de calidad premium desde los mejores proveedores del mundo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#productos" className="hover:text-rose-400 transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="#beneficios" className="hover:text-rose-400 transition-colors">
                  Beneficios
                </Link>
              </li>
              <li>
                <Link href="#testimonios" className="hover:text-rose-400 transition-colors">
                  Testimonios
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-rose-400 transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-rose-400 transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-rose-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-rose-400 transition-colors">
                  Política de Devolución
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-rose-400 transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contáctanos</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-rose-400 shrink-0" />
                <a href="mailto:info@cosme.com" className="hover:text-rose-400 transition-colors">
                  info@cosme.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 text-rose-400 shrink-0" />
                <a href="tel:+34900000000" className="hover:text-rose-400 transition-colors">
                  +34 900 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-rose-400 shrink-0" />
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2026 Importaciones Mía. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              {['Facebook', 'Instagram', 'LinkedIn', 'WhatsApp'].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
