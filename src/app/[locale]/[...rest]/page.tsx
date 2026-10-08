import { notFound } from "next/navigation";

/** Any unknown path under a language shows the localized "not found" page of that language. */
export default function CatchAllPage() {
  notFound();
}
