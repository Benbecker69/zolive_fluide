import { Bricolage_Grotesque, Hanken_Grotesk, Instrument_Serif } from "next/font/google";

/**
 * Fonts are downloaded at build time and served by the application:
 * no request leaves for a third-party domain at run time.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

/** Class names that expose the three font variables; set once on the root element. */
export const fontVariables = `${bricolage.variable} ${hanken.variable} ${instrument.variable}`;
