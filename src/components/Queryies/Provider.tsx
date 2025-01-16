"use client"

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const TanstackClientProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanstackClientProvider;