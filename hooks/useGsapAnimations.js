'use client';
import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Registrar ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Usar useLayoutEffect en cliente, useEffect en servidor
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const useGsapAnimations = () => {
  useIsomorphicLayoutEffect(() => {
    // Limpiar ScrollTrigger al desmontar
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return { gsap, ScrollTrigger };
};

// Animación de fade in desde abajo
export const fadeInUp = (element, options = {}) => {
  if (!element) return null;

  const {
    delay = 0,
    duration = 1,
    y = 50,
    stagger = 0,
    scrollTrigger = null
  } = options;

  // Asegurar que el elemento esté visible antes de animar
  gsap.set(element, { opacity: 1 });

  return gsap.from(element, {
    y,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
    clearProps: 'all',
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...scrollTrigger
    } : null
  });
};

// Animación de fade in desde la izquierda
export const fadeInLeft = (element, options = {}) => {
  if (!element) return null;

  const {
    delay = 0,
    duration = 1,
    x = -50,
    stagger = 0,
    scrollTrigger = null
  } = options;

  // Asegurar que el elemento esté visible antes de animar
  gsap.set(element, { opacity: 1 });

  return gsap.from(element, {
    x,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
    clearProps: 'all',
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...scrollTrigger
    } : null
  });
};

// Animación de fade in desde la derecha
export const fadeInRight = (element, options = {}) => {
  if (!element) return null;

  const {
    delay = 0,
    duration = 1,
    x = 50,
    stagger = 0,
    scrollTrigger = null
  } = options;

  // Asegurar que el elemento esté visible antes de animar
  gsap.set(element, { opacity: 1 });

  return gsap.from(element, {
    x,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: 'power3.out',
    clearProps: 'all',
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...scrollTrigger
    } : null
  });
};

// Animación de scale
export const scaleIn = (element, options = {}) => {
  if (!element) return null;

  const {
    delay = 0,
    duration = 1,
    scale = 0.8,
    stagger = 0,
    scrollTrigger = null
  } = options;

  // Asegurar que el elemento esté visible antes de animar
  gsap.set(element, { opacity: 1 });

  return gsap.from(element, {
    scale,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: 'back.out(1.7)',
    clearProps: 'all',
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...scrollTrigger
    } : null
  });
};

// Animación de reveal (cortina)
export const reveal = (element, options = {}) => {
  if (!element) return null;

  const {
    delay = 0,
    duration = 1.2,
    direction = 'left',
    scrollTrigger = null
  } = options;

  const clipPathStart = direction === 'left'
    ? 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
    : direction === 'right'
    ? 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)'
    : 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';

  const clipPathEnd = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

  return gsap.fromTo(element,
    { clipPath: clipPathStart },
    {
      clipPath: clipPathEnd,
      duration,
      delay,
      ease: 'power4.inOut',
      clearProps: 'all',
      scrollTrigger: scrollTrigger ? {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
        ...scrollTrigger
      } : null
    }
  );
};

// Animación de texto por caracteres
export const textReveal = (element, options = {}) => {
  if (!element || !element.children) return null;

  const {
    delay = 0,
    duration = 1,
    stagger = 0.03,
    scrollTrigger = null
  } = options;

  // Asegurar que los elementos estén visibles antes de animar
  gsap.set(element.children, { opacity: 1 });

  return gsap.from(element.children, {
    y: 100,
    opacity: 0,
    rotateX: -90,
    duration,
    delay,
    stagger,
    ease: 'power4.out',
    clearProps: 'all',
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      ...scrollTrigger
    } : null
  });
};

// Animación paralela horizontal
export const parallaxHorizontal = (element, options = {}) => {
  const {
    x = -100,
    scrollTrigger = null
  } = options;

  return gsap.to(element, {
    x,
    ease: 'none',
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      ...scrollTrigger
    } : null
  });
};

// Animación de hover para cards
export const cardHover = (element) => {
  const tl = gsap.timeline({ paused: true });

  tl.to(element, {
    y: -10,
    scale: 1.02,
    duration: 0.3,
    ease: 'power2.out'
  });

  return {
    play: () => tl.play(),
    reverse: () => tl.reverse()
  };
};
