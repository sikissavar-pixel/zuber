"use client";
import React, { useEffect } from "react";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import type { PluginListenerHandle } from "@capacitor/core";

const MobileAppBridge: React.FC = () => {
  useEffect(() => {
    let backHandle: PluginListenerHandle | undefined;
    const setup = async () => {
      // Back button behavior: go back if possible
      backHandle = await App.addListener("backButton", () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });

      // Set status bar style to match dark theme
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0c0c0c" });
      } catch {}
    };
    setup();

    return () => {
      backHandle?.remove();
    };
  }, []);

  return null;
};

export default MobileAppBridge;