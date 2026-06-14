"use client";

import { createContext, useContext, type Context } from "react";

type SegmentData<T> = {
  Context: Context<T | undefined>;
  Provider: Context<T | undefined>["Provider"];
  useData: () => T;
};

export function createSegmentData<T>(name: string): SegmentData<T> {
  const Context = createContext<T | undefined>(undefined);

  function useData(): T {
    const value = useContext(Context);

    if (!value) {
      throw new Error(`use${name}Data must be used within ${name}DataProvider`);
    }

    return value;
  }

  return {
    Context,
    Provider: Context.Provider,
    useData,
  };
}
