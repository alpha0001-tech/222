export {};

declare global {
  interface Window {
    Lenis: any;
    gsap: any;
    lucide: any;
  }
}

export interface StickySectionRefs {
  section: HTMLDivElement | null;
  bg: HTMLDivElement | null;
  content: HTMLDivElement | null;
}
