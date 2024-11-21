"use client";

import { useSearchParams } from "next/navigation";
import ResultsPage from "./[fileid]/page";

export default function Results() {
  const searchParams = useSearchParams();
  const fileid = searchParams.get("fileid");

  if (!fileid) return null;

  return <ResultsPage params={{ fileid }} />;
}