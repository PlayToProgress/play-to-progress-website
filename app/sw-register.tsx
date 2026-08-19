"use client";

import { useEffect } from "react";

// The service worker has been removed. This component now runs the
// opposite of what it used to: instead of registering /sw.js, it actively
// finds and unregisters any service worker a returning visitor's browser
// already installed from a previous version of this app, and clears out
// the caches it created. A service worker keeps running indefinitely once
// installed — simply no longer calling register() would leave it in place
// for anyone who already has it, silently intercepting requests forever.
// This component itself can be deleted once enough time has passed that
// no real visitor is still running the old service worker (a few weeks of
// normal traffic is a safe bar — check hosting analytics if unsure).
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      })
      .catch(() => {});

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {});
    }
  }, []);

  return null;
}