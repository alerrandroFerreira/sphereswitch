"use client";

import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { EMBED_PARAM, PREVIEW_PARAM, serializePreviewValue } from "@sphereswitch/core";

export interface ABCombo {
  readonly font?: string;
  readonly palette?: string;
  readonly layout?: string;
}

export interface ABCompareProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly comboA: ABCombo;
  readonly comboB: ABCombo;
  readonly labelA?: string;
  readonly labelB?: string;
}

/** URL de la página actual forzando una combinación, marcada como iframe embebido. */
export function previewUrl(combo: ABCombo): string {
  const url = new URL(window.location.href);
  url.searchParams.delete(PREVIEW_PARAM);
  url.searchParams.delete(EMBED_PARAM);
  url.searchParams.set(
    PREVIEW_PARAM,
    serializePreviewValue(combo as Readonly<Record<string, string | undefined>>),
  );
  url.searchParams.set(EMBED_PARAM, "1");
  return url.toString();
}

/**
 * Comparación A/B: dos iframes al 50 %, cada uno cargando la página actual con
 * su `?sphereswitch-preview=...` propio. Scroll sincronizado entre ambos.
 *
 * Los iframes son del mismo origen, así que se puede acceder a su
 * `contentWindow` para replicar el scroll.
 */
export function ABCompare({
  open,
  onOpenChange,
  comboA,
  comboB,
  labelA = "A",
  labelB = "B",
}: ABCompareProps) {
  const frameA = useRef<HTMLIFrameElement | null>(null);
  const frameB = useRef<HTMLIFrameElement | null>(null);
  const syncing = useRef(false);

  useEffect(() => {
    if (!open) return;
    const a = frameA.current;
    const b = frameB.current;
    if (!a || !b) return;

    const cleanups: Array<() => void> = [];

    function link(source: HTMLIFrameElement, target: HTMLIFrameElement): void {
      const win = source.contentWindow;
      if (!win) return;
      const onScroll = (): void => {
        if (syncing.current) return;
        syncing.current = true;
        target.contentWindow?.scrollTo(win.scrollX, win.scrollY);
        requestAnimationFrame(() => {
          syncing.current = false;
        });
      };
      win.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => win.removeEventListener("scroll", onScroll));
    }

    const wire = (): void => {
      link(a, b);
      link(b, a);
    };
    a.addEventListener("load", wire);
    b.addEventListener("load", wire);
    cleanups.push(() => {
      a.removeEventListener("load", wire);
      b.removeEventListener("load", wire);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sphereswitch-root sphereswitch-palette-overlay" />
        <Dialog.Content
          className="sphereswitch-root sphereswitch-ab"
          aria-label="Comparación A/B de SphereSwitch"
        >
          <div className="sphereswitch-ab-pane">
            <span className="sphereswitch-ab-label">{labelA}</span>
            <iframe
              ref={frameA}
              title={`Comparación ${labelA}`}
              src={previewUrl(comboA)}
              data-testid="ab-frame-a"
            />
          </div>
          <div className="sphereswitch-ab-pane">
            <span className="sphereswitch-ab-label">{labelB}</span>
            <iframe
              ref={frameB}
              title={`Comparación ${labelB}`}
              src={previewUrl(comboB)}
              data-testid="ab-frame-b"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
