"use client";
import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
}

function FAQSection({ title = "Frequently Asked Questions", faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "2rem auto",
      padding: "1rem",
      borderTop: "1px solid #e5e7eb",
      marginTop: "3rem"
    }}>
      <h2 style={{
        fontSize: "1.5rem",
        fontWeight: "bold",
        marginBottom: "1.5rem",
        color: "#1f2937",
        textAlign: "center"
      }}>
        {title}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              style={{
                width: "100%",
                padding: "1rem 1.5rem",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1f2937",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              aria-expanded={openIndex === index}
            >
              <span>{faq.question}</span>
              <svg
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  transition: "transform 0.2s",
                  transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {openIndex === index && (
              <div
                style={{
                  padding: "0 1.5rem 1rem 1.5rem",
                  color: "#6b7280",
                  lineHeight: "1.6",
                  fontSize: "0.95rem",
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQSection;
