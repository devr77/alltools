"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./RandomRoller.module.css";

// Rejection sampling avoids favoring outcomes when the range does not divide 2^32.
function randomOutcome(sides: number) {
  const limit = Math.floor(4294967296 / sides) * sides;
  const buffer = new Uint32Array(1);
  do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % sides + 1;
}

export default function RandomRoller({ mode }: { mode: "coin" | "dice" }) {
  const coin = mode === "coin";
  const [count, setCount] = useState("1");
  const [sides, setSides] = useState("6");
  const [results, setResults] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const label = (value: number) => coin ? value === 1 ? "Heads" : "Tails" : String(value);
  function clear() { setResults([]); setMessage(""); setError(""); }
  function generate(event: FormEvent) {
    event.preventDefault(); clear();
    const quantity = Number(count), faces = coin ? 2 : Number(sides);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100 || !Number.isInteger(faces) || faces < 2 || faces > 1000) {
      setError("Choose 1–100 results and, for dice, 2–1,000 sides."); return;
    }
    try {
      const next = Array.from({ length: quantity }, () => randomOutcome(faces));
      setResults(next);
      setMessage(coin ? `${quantity} coin${quantity === 1 ? "" : "s"} flipped.` : `${quantity} dice rolled.`);
    } catch { setError("Random generation is unavailable in this browser. Try HTTPS or localhost in a current browser."); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(results.map(label).join(", ")); setMessage("Results copied."); }
    catch { setMessage("Copy unavailable. Select and copy the displayed results."); }
  }
  const heads = results.filter((value) => value === 1).length;
  return <div className={styles.tool}>
    <h1>{coin ? "Coin Flip" : "Dice Roller"}</h1>
    <p>{coin ? "Make a quick choice or explore probability with random heads and tails." : "Roll dice for games, classroom activities, or quick random choices."}</p>
    <form onSubmit={generate} className={styles.form}>
      <label>Number of {coin ? "coins" : "dice"}<input type="number" min="1" max="100" step="1" required value={count} onChange={(e) => { setCount(e.target.value); clear(); }} /></label>
      {!coin && <label>Sides per die<input type="number" min="2" max="1000" step="1" required value={sides} onChange={(e) => { setSides(e.target.value); clear(); }} /></label>}
      <div className={styles.actions}><button type="submit" className={styles.primary}>{coin ? "Flip coins" : "Roll dice"}</button><button type="button" onClick={() => { setCount("1"); setSides("6"); clear(); }}>Reset</button></div>
    </form>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <p role="status">{message}</p>
    {results.length > 0 && <section className={styles.results} aria-label="Random results">
      <h2>Your results</h2>
      <ol className={styles.values}>{results.map((value, index) => <li key={index} aria-label={`${coin ? "Coin" : "Die"} ${index + 1}: ${label(value)}`}>{label(value)}</li>)}</ol>
      <p>{coin ? `Heads: ${heads} · Tails: ${results.length - heads}` : `Total: ${results.reduce((sum, value) => sum + value, 0)}`}</p>
      <button type="button" onClick={copy}>Copy results</button>
    </section>}
    <section className={styles.help}><h2>How it works</h2><p>Choose how many {coin ? "coins to flip" : "dice to roll and the number of sides"}, then generate results. Each outcome is independent, so repeats are normal. Randomness comes from your browser’s Web Crypto API; processing stays on your device.</p><p>Need a minimum and maximum instead? Use the <Link href="/trending-tools/random-number-generator">Random Number Generator</Link>.</p></section>
  </div>;
}
