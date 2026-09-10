"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function splitWords(element: HTMLElement) {
  if (element.dataset.splitReady === "true") return;

  const text = element.textContent || "";
  const parts = text.split(/(\s+)/);
  element.textContent = "";
  element.setAttribute("aria-label", text.trim());

  parts.forEach((part) => {
    if (!part.trim()) {
      element.appendChild(document.createTextNode(part));
      return;
    }

    const mask = document.createElement("span");
    const word = document.createElement("span");
    mask.className = "split-word-mask";
    word.className = "split-word";
    word.textContent = part;
    mask.setAttribute("aria-hidden", "true");
    mask.appendChild(word);
    element.appendChild(mask);
  });

  element.dataset.splitReady = "true";
}

export function CinematicScroller() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      document.querySelectorAll("[data-split-reveal]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.visibility = "visible";
      });
      document.querySelectorAll("[data-story-section], [data-reveal-item]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.visibility = "visible";
      });
      return;
    }

    // 1. Initialize Lenis Smooth Scrolling (Desktop wheel only - preserve native 120Hz touch on mobile)
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    if (!isCoarse) {
      lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.95,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    // 2. Split Word Kinetic Typography
    const splitElements = gsap.utils.toArray<HTMLElement>("[data-split-reveal]");
    splitElements.forEach((element) => {
      splitWords(element);
      const words = element.querySelectorAll(".split-word");
      if (!words.length) return;

      gsap.fromTo(
        words,
        { yPercent: 105, autoAlpha: 0, filter: "blur(6px)" },
        {
          yPercent: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 0.95,
          ease: "power4.out",
          stagger: 0.042,
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
          },
        },
      );
    });

    // 3. Section-by-Section Storytelling Reveals
    const storySections = gsap.utils.toArray<HTMLElement>("[data-story-section]");
    storySections.forEach((section) => {
      const items = section.querySelectorAll("[data-reveal-item]");
      const targets = items.length ? items : section.children;

      gsap.fromTo(
        targets,
        { y: 32, autoAlpha: 0, filter: "blur(6px)" },
        {
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "power4.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        },
      );
    });

    // 4. Sticky Card Depth Stacking
    const stacks = gsap.utils.toArray<HTMLElement>("[data-sticky-stack]");
    stacks.forEach((stack) => {
      const cards = gsap.utils.toArray<HTMLElement>(stack.querySelectorAll("[data-stack-card]"));
      cards.forEach((card, index) => {
        const nextCard = cards[index + 1];
        if (!nextCard) return;

        gsap.to(card, {
          scale: 0.93 + index * 0.015,
          autoAlpha: 0.76,
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: nextCard,
            start: "top 78%",
            end: "top 26%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    });

    // 5. Parallax Layers
    const parallaxLayers = gsap.utils.toArray<HTMLElement>("[data-parallax-layer]");
    parallaxLayers.forEach((layer) => {
      const speed = Number(layer.dataset.speed || -0.15);
      const section = layer.closest<HTMLElement>("[data-parallax-section]") || layer;

      gsap.to(layer, {
        y: () => window.innerHeight * speed,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    // 6. Accessible Keyboard Focus in View
    const revealFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement) || !event.target.matches(":focus-visible")) return;
      const rect = event.target.getBoundingClientRect();
      if (rect.top < 72 || rect.bottom > window.innerHeight) {
        event.target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    document.addEventListener("focusin", revealFocus);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      clearTimeout(refreshTimer);
      document.removeEventListener("focusin", revealFocus);
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}
