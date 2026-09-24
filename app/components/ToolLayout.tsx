"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { usePostHog } from "posthog-js/react";
import { categories } from "../Constants";
import styles from "./ToolLayout.module.css";

export default function ToolLayout({ categorySlug, children }: { categorySlug: string; children: ReactNode }) {
  const pathname = usePathname();
  const posthog = usePostHog();
  const [feedback, setFeedback] = useState("");
  const category = categories.find((entry) => entry.slug === categorySlug)!;
  const current = category.tools.find((tool) => pathname === `/${categorySlug}/${tool.slug}`);
  const related = category.tools.filter((tool) => tool.slug !== current?.slug).slice(0, 3);
  async function share() {
    try { await navigator.clipboard.writeText(window.location.href); setFeedback("Link copied."); }
    catch { setFeedback("Copy this page’s address from your browser to share it."); }
  }
  return (
    <div className={styles.shell}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/${categorySlug}`}>{category.name}</Link>{current && <><span>/</span><span aria-current="page">{current.name}</span></>}</nav>
      <div className={current ? `${styles.toolPanel} tool-content` : undefined}>{children}</div>
      {current && <>
        <section className={styles.feedback} aria-label="Tool feedback">
          <span>Was this tool helpful?</span>
          <button type="button" onClick={() => { posthog.capture("tool_feedback", { category: categorySlug, tool: current.slug, useful: true }); setFeedback("Thanks for your feedback."); }}>Yes</button>
          <button type="button" onClick={() => { posthog.capture("tool_feedback", { category: categorySlug, tool: current.slug, useful: false }); setFeedback("Thanks for your feedback."); }}>Not yet</button>
          <button type="button" onClick={share}>Share tool ↗</button><span role="status">{feedback}</span>
        </section>
        {related.length > 0 && <section className={styles.related}><h2>More in {category.name}</h2><div className={styles.cards}>{related.map((tool) => <Link className={styles.card} href={`/${categorySlug}/${tool.slug}`} key={tool.slug}><h3>{tool.name}</h3><p>{tool.description}</p><span className={styles.open}>Open tool →</span></Link>)}</div></section>}
      </>}
    </div>
  );
}
