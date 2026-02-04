"use client";

import { useState } from "react";
import { categories } from "../Constants";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categorySlug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug);
    } else {
      newExpanded.add(categorySlug);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">ToolsBase</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {/* Home Link */}
              <a
                href="/"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                onClick={onClose}
              >
                <span className="mr-3">🏠</span>
                Home
              </a>

              {/* Categories */}
              {categories.map((category) => (
                <div key={category.slug}>
                  <button
                    onClick={() => toggleCategory(category.slug)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${
                        expandedCategories.has(category.slug) ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Tools in Category */}
                  {expandedCategories.has(category.slug) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {/* View All Link */}
                      <a
                        href={`/${category.slug}`}
                        className="flex items-center px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={onClose}
                      >
                        <span className="mr-2">→</span>
                        View all {category.name} tools
                      </a>

                      {/* Individual Tools */}
                      {category.tools.map((tool) => (
                        <a
                          key={tool.slug}
                          href={`/${category.slug}/${tool.slug}`}
                          className="flex items-center px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={onClose}
                        >
                          <span className="mr-2">{tool.icon}</span>
                          {tool.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-muted space-y-1">
              <a
                href="/about"
                className="block hover:underline"
                onClick={onClose}
              >
                About
              </a>
              <a
                href="/privacy"
                className="block hover:underline"
                onClick={onClose}
              >
                Privacy Policy
              </a>
              <a
                href="/contact"
                className="block hover:underline"
                onClick={onClose}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
