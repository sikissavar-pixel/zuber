"use client";

import { Loader } from "@googlemaps/js-api-loader";

let loader: Loader | null = null;
let loaderPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps only runs in the browser."));
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    const message = "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY tanımlı değil.";
    if (process.env.NODE_ENV === "production") {
      console.error(message);
    } else {
      console.warn(message);
    }
    return Promise.reject(new Error(message));
  }

  if (!loader) {
    loader = new Loader({
      apiKey,
      language: "tr",
      region: "TR",
      libraries: ["places"],
      version: "weekly",
    });
  }

  if (!loaderPromise) {
    loaderPromise = loader.load();
  }

  return loaderPromise;
}

