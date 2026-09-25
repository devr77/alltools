"use client";
import React, { useState } from "react";
import yaml from "js-yaml";
import FAQSection from "@/app/components/FAQSection";
import { dataConverterFAQs } from "@/app/components/faqData";

function YamltoJson() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = () => {
    try {
      setError("");
      const json = yaml.load(input);
      setOutput(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setError("Invalid YAML: " + err.message);
    }
  };

  return (
    <div>
      <h2>YAML to JSON Converter</h2>
      <textarea
        rows={10}
        placeholder="Paste YAML here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", fontFamily: "monospace" }}
      />
      <button onClick={handleConvert}>Convert</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {output && (
        <textarea
          rows={10}
          value={output}
          readOnly
          style={{ width: "100%", fontFamily: "monospace" }}
        />
      )}
      <FAQSection faqs={dataConverterFAQs} />
    </div>
  );
}

export default YamltoJson;
