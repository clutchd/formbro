import type { Metadata } from "next";
import { APP_DESCRIPTION } from "@formbro/shared/brand";
import { HomePage } from "../home-page";

export const metadata: Metadata = {
  title: "FormBro | Operational forms for teams and agents",
  description: APP_DESCRIPTION,
};

export default function Home() {
  return <HomePage />;
}
