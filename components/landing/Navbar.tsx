'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 animate-fade-in"
          >
            <Image
              src="/logo.jpeg"
              alt="Importaciones Mía"
              width={40}
              height={40}
              className="rounded-full shadow-lg"
            />
            <span className="font-bold text-xl text-gray-900 hidden sm:inline">
              Mía
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">

            <Link
              href="#beneficios"
              className="text-gray-700 hover:text-rose-500 transition-colors duration-200 font-medium"
            >
              Beneficios
            </Link>
            <Link
              href="#testimonios"
              className="text-gray-700 hover:text-rose-500 transition-colors duration-200 font-medium"
            >
              Testimonios
            </Link>
            <Link
              href="#contacto"
              className="text-gray-700 hover:text-rose-500 transition-colors duration-200 font-medium"
            >
              Contacto
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-6 py-2.5 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-250 btn-smooth"
            >
              Iniciar Sesión
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4 animate-fade-in-up">
            <Link
              href="#productos"
              className="block text-gray-700 hover:text-rose-500 transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Productos
            </Link>
            <Link
              href="#beneficios"
              className="block text-gray-700 hover:text-rose-500 transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Beneficios
            </Link>
            <Link
              href="#testimonios"
              className="block text-gray-700 hover:text-rose-500 transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Testimonios
            </Link>
            <Link
              href="#contacto"
              className="block text-gray-700 hover:text-rose-500 transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </Link>
            <Link
              href="/login"
              className="block px-4 py-2 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold text-center"
              onClick={() => setIsOpen(false)}
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
