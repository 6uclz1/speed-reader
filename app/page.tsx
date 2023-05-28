"use client";
import Head from "next/head";
import SpeedReader from "./components/SpeedReader";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Speed Reader</title>
      </Head>
      <main>
        <SpeedReader />
      </main>
    </div>
  );
}
