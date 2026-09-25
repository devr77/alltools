import React from "react";
import LlmsTxtGen from "./LlmsTxtGen";

export const metadata = {
  title: "LLMs.txt Generator - Create Structured Website Metadata for AI",
  description: "Generate LLMs.txt files to help AI systems better understand your website structure, content, and key pages. Improve SEO for large language models with our free online tool.",
  keywords: "LLMs.txt, AI SEO, website metadata, AI optimization, structured data, large language models",
  openGraph: {
    title: "LLMs.txt Generator - AI Website Metadata Tool",
    description: "Create LLMs.txt files for better AI understanding of your website. Free online tool for generating structured metadata.",
    type: "website",
  },
};

function page() {
  return (
    <div>
      <LlmsTxtGen />
    </div>
  );
}

export default page;
