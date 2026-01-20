"use client";
import React, { useState } from "react";

interface LlmsTxtData {
  websiteUrl: string;
  name: string;
  description: string;
  sitemapUrl: string;
  contactEmail: string;
  keyPages: string[];
  lastUpdated: string;
}

function LlmsTxtGen() {
  const [formData, setFormData] = useState<LlmsTxtData>({
    websiteUrl: "",
    name: "",
    description: "",
    sitemapUrl: "",
    contactEmail: "",
    keyPages: [],
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [generatedTxt, setGeneratedTxt] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<string>("");

  const handleInputChange = (field: keyof LlmsTxtData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyPage = () => {
    if (currentPage.trim()) {
      setFormData(prev => ({
        ...prev,
        keyPages: [...prev.keyPages, currentPage.trim()]
      }));
      setCurrentPage("");
    }
  };

  const removeKeyPage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPages: prev.keyPages.filter((_, i) => i !== index)
    }));
  };

  const generateLlmsTxt = () => {
    const content = `# ${formData.name}

## About
${formData.description}

## Website
${formData.websiteUrl}

## Sitemap
${formData.sitemapUrl || `${formData.websiteUrl}/sitemap.xml`}

## Contact
${formData.contactEmail}

## Key Pages
${formData.keyPages.map(page => `- ${page}`).join('\n')}

## Last Updated
${formData.lastUpdated}

---
This LLMs.txt file was generated for better AI understanding of the website content and structure.`;

    setGeneratedTxt(content);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTxt);
      alert("LLMs.txt content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard");
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([generatedTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llms.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">LLMs.txt Generator</h1>
        <p className="text-gray-600">Generate structured LLMs.txt files for better AI understanding of your website</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Website Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Website Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Website URL</label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
              placeholder="A brief description of your website and its purpose..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sitemap URL (optional)</label>
            <input
              type="url"
              value={formData.sitemapUrl}
              onChange={(e) => handleInputChange('sitemapUrl', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/sitemap.xml"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Updated</label>
            <input
              type="date"
              value={formData.lastUpdated}
              onChange={(e) => handleInputChange('lastUpdated', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Key Pages</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyPage()}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/about"
              />
              <button
                onClick={addKeyPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {formData.keyPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate flex-1">{page}</span>
                  <button
                    onClick={() => removeKeyPage(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateLlmsTxt}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 font-medium"
          >
            Generate LLMs.txt
          </button>
        </div>

        {/* Generated Content */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated LLMs.txt</h2>

          {generatedTxt ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={downloadTxt}
                  className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
                >
                  Download .txt File
                </button>
              </div>

              <div className="border border-gray-300 rounded-md">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                  <span className="text-sm font-medium">llms.txt</span>
                </div>
                <pre className="p-4 text-sm whitespace-pre-wrap font-mono bg-white min-h-96 overflow-auto">
                  {generatedTxt}
                </pre>
              </div>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-8 text-center text-gray-500 bg-gray-50">
              <div className="text-4xl mb-4">📄</div>
              <p>Fill out the form and click &quot;Generate LLMs.txt&quot; to see your content here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LlmsTxtGen;
