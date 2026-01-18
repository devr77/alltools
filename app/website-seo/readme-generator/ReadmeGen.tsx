"use client";
import React, { useState } from "react";

function ReadmeGen() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [install, setInstall] = useState("");
  const [usage, setUsage] = useState("");
  const [author, setAuthor] = useState("");
  const [license, setLicense] = useState("");
  const [contributing, setContributing] = useState("");
  const [issues, setIssues] = useState("");
  const [readme, setReadme] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const md = `# ${projectName || "Project Name"}

${description || "Project description."}

## Installation

\`\`\`sh
${install || "npm install"}
\`\`\`

## Usage

\`\`\`sh
${usage || "npm start"}
\`\`\`

${(author && `## Author\n\n${author}\n`) || ""}
${(license && `## License\n\n${license}\n`) || ""}
${(contributing && `## Contributing\n\n${contributing}\n`) || ""}
${(issues && `## Issues\n\n${issues}\n`) || ""}
`;
    setReadme(md);
    setShowResult(true);
  };

  const handleDownload = () => {
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <h2>README Generator</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Project Name:{" "}
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Project"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Description:{" "}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short project description"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Install Command:{" "}
            <input
              type="text"
              value={install}
              onChange={(e) => setInstall(e.target.value)}
              placeholder="npm install"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Usage Command:{" "}
            <input
              type="text"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              placeholder="npm start"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Author:{" "}
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your Name"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            License:{" "}
            <input
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="MIT"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Contributing:{" "}
            <input
              type="text"
              value={contributing}
              onChange={(e) => setContributing(e.target.value)}
              placeholder="Contribution guidelines"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Issues:{" "}
            <input
              type="text"
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="Where to report issues"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 22px",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(60,60,120,0.08)",
            cursor: "pointer",
            marginTop: "16px",
            transition: "background 0.2s, transform 0.1s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-2px) scale(1.03)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)";
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
          }}
        >
          Generate README
        </button>
      </form>
      {showResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Generated README.md</h3>
          <textarea
            rows={12}
            style={{ width: "100%" }}
            value={readme}
            readOnly
          />
          <br />
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <button
              onClick={handleDownload}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Download README.md"
            >
              {/* Download SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download README.md
            </button>
            <button
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: copied ? "#22c55e" : "inherit",
              }}
              title="Copy README.md"
            >
              {/* Copy SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "2px" }}
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadmeGen;
