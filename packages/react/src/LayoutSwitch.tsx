"use client";

import { Suspense } from "react";
import type { ComponentType, LazyExoticComponent, ReactNode } from "react";
import { useLayout } from "./useDimensions";
import { useMounted } from "./useMounted";

export interface LayoutVariant {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Componente normal o envuelto en `React.lazy(() => import(...))`. */
  readonly component: ComponentType | LazyExoticComponent<ComponentType>;
}

export interface LayoutSwitchProps {
  /**
   * Metadato y mecanismo de render a la vez: añadir una variante es una entrada
   * más en este array, nunca dos ediciones en dos sitios.
   */
  readonly variants: readonly LayoutVariant[];
  /** Se pinta mientras carga una variante perezosa y antes de montar. */
  readonly fallback?: ReactNode;
}

/**
 * Renderiza la variante de layout correspondiente al estado activo (`useLayout`).
 *
 * No asume que las variantes sean páginas completas: sirve igual para alternar
 * una sección suelta (un hero, una tarjeta) que la página entera.
 *
 * SSR-safe: antes de montar pinta la primera variante como opción neutra —
 * idéntica a la que emite el servidor— y solo tras el efecto de montaje lee el
 * valor real persistido y cambia si hace falta.
 */
export function LayoutSwitch({ variants, fallback = null }: LayoutSwitchProps) {
  const [activeId] = useLayout();
  const mounted = useMounted();

  const first = variants[0];
  if (first === undefined) return <Suspense fallback={fallback}>{fallback}</Suspense>;

  const resolved = (mounted && variants.find((variant) => variant.id === activeId)) || first;
  const Variant = resolved.component;

  return (
    <Suspense fallback={fallback}>
      <Variant />
    </Suspense>
  );
}

/** Identidad tipada, para escribir el array de variantes con autocompletado. */
export function defineLayoutVariants(variants: readonly LayoutVariant[]): readonly LayoutVariant[] {
  return variants;
}
