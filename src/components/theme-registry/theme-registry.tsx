"use client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import NextAppDirEmotionCacheProvider from "./emotion-cache";
import theme from "./theme";

const emotionCacheOptions = {
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
};

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentTheme = theme();

  return (
    <NextAppDirEmotionCacheProvider options={emotionCacheOptions}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}

