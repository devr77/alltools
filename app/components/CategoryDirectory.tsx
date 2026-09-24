import Link from "next/link";
import { categories } from "../Constants";
import styles from "./ToolLayout.module.css";

export default function CategoryDirectory({ slug }: { slug: string }) {
  const category = categories.find((entry) => entry.slug === slug)!;
  return (
    <section>
      <header className={styles.categoryHeader}>
        <span className={styles.eyebrow}>THE TOOL COLLECTION · {category.tools.length} TOOLS</span>
        <h1>{category.name}</h1>
        <p>{category.description || "Useful tools for your next task."}</p>
      </header>
      <div className={styles.cards}>
        {category.tools.map((tool) => (
          <Link href={`/${slug}/${tool.slug}`} key={tool.slug} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">{tool.icon}</span>
            <h2>{tool.name}</h2><p>{tool.description}</p><span className={styles.open}>Open tool →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
