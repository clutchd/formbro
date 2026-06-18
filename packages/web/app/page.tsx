import type { Metadata } from "next";
import { HomePage } from "./home-page";

export const metadata: Metadata = {
  title: "FormBro",
  description: "The open-source form platform for serious workflows.",
};

export default function Home() {
  return <HomePage />;
}
