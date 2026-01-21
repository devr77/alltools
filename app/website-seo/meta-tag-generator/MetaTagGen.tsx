"use client";
import React, { useState } from "react";
import FAQSection from "../../components/FAQSection";
import { websiteSEOFAQs } from "../../components/faqData";

function MetaTagGen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [contentType, setContentType] = useState("UTF-8");
  const [language, setLanguage] = useState("English");
  const [revisitAfter, setRevisitAfter] = useState("1");
  const [author, setAuthor] = useState("");
  const [copied, setCopied] = useState(false);

  const metaTags = `<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="keywords" content="${keywords}" />
<meta name="robots" content="${robotsIndex ? "index" : "noindex"},${robotsFollow ? "follow" : "nofollow"}" />
<meta http-equiv="Content-Type" content="text/html; charset=${contentType}" />
<meta http-equiv="content-language" content="${language}" />
<meta name="revisit-after" content="${revisitAfter} days" />
<meta name="author" content="${author}" />`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(metaTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <h2>Meta Tag Generator</h2>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          maxWidth: 600,
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Title */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            Site Title <span style={{ color: "red" }}>*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter page title"
            required
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem 1.25rem",
              fontSize: "1.1rem",
              outline: "none",
              border: "1.5px solid #1976d2",
              borderRadius: "12px",
              boxSizing: "border-box",
              color: "#222",
              background: "#fff",
            }}
          />
        </label>
        {/* Description */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            Description
          </span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter meta description"
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem 1.25rem",
              fontSize: "1.1rem",
              outline: "none",
              border: "1.5px solid #1976d2",
              borderRadius: "12px",
              boxSizing: "border-box",
              color: "#222",
              background: "#fff",
            }}
          />
        </label>
        {/* Keywords */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            Keywords (comma separated)
          </span>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. seo, meta tags, generator"
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem 1.25rem",
              fontSize: "1.1rem",
              outline: "none",
              border: "1.5px solid #1976d2",
              borderRadius: "12px",
              boxSizing: "border-box",
              color: "#222",
              background: "#fff",
            }}
          />
        </label>
        {/* Robots Index */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={robotsIndex}
            onChange={() => setRobotsIndex((v) => !v)}
          />
          Allow robots to index your website?
        </label>
        {/* Robots Follow */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={robotsFollow}
            onChange={() => setRobotsFollow((v) => !v)}
          />
          Allow robots to follow all links?
        </label>
        {/* Content Type */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            What type of content will your site display?
          </span>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem 1.25rem",
              fontSize: "1.1rem",
              outline: "none",
              border: "1.5px solid #1976d2",
              borderRadius: "12px",
              boxSizing: "border-box",
              color: "#222",
              background: "#fff",
            }}
          >
            <option value="UTF-8">UTF-8</option>
            <option value="ISO-8859-1">ISO-8859-1</option>
            <option value="windows-1252">windows-1252</option>
          </select>
        </label>
        {/* Language */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            What is your site primary language?
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem 1.25rem",
              fontSize: "1.1rem",
              outline: "none",
              border: "1.5px solid #1976d2",
              borderRadius: "12px",
              boxSizing: "border-box",
              color: "#222",
              background: "#fff",
            }}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="Hindi">Hindi</option>
            {/* Add more as needed */}
          </select>
        </label>
        {/* Revisit After */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            Search engines should revisit this page after
          </span>
          <input
            type="number"
            min={1}
            value={revisitAfter}
            onChange={(e) => setRevisitAfter(e.target.value)}
            style={{
              display: "inline-block",
              width: "80px",
              marginLeft: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "1.1rem",
              outline: "none",
              border: "1.5px solid #1976d2",
              borderRadius: "12px",
              boxSizing: "border-box",
              color: "#222",
              background: "#fff",
            }}
          />{" "}
          days.
        </label>
        {/* Author */}
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>Author:</span>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.75rem 1.25rem",
              fontSize: "1.1rem",
              outline: "none",
              border: "1.5px solid #1976d2",
              borderRadius: "12px",
              boxSizing: "border-box",
              color: "#222",
              background: "#fff",
            }}
          />
        </label>
      </form>
      <div style={{ marginTop: "2rem" }}>
        <h3>Generated Meta Tags</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
              />
              <rect
                x="3"
                y="3"
                width="13"
                height="13"
                rx="2"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
              />
            </svg>
            {copied ? "Copied!" : "Copy Meta Tags"}
          </button>
        </div>
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            marginTop: "1rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {metaTags}
        </pre>
      </div>
      <FAQSection faqs={websiteSEOFAQs} />
    </div>
  );
}

export default MetaTagGen;
