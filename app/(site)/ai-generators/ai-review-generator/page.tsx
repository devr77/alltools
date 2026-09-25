import React from "react";
import AIReviewGen from "./AIReviewGen";

export const metadata = {
  title: "AI Review Generator - Create Authentic Product Reviews with AI",
  description: "Generate high-quality, authentic product and service reviews using AI. Perfect for content creators, businesses, and e-commerce. Create compelling reviews in seconds with our free online tool.",
  keywords: "AI review generator, product reviews, service reviews, AI content creation, review writing, business reviews, e-commerce reviews",
  openGraph: {
    title: "AI Review Generator - Authentic Reviews Made Easy",
    description: "Create compelling product and service reviews with AI technology. Generate authentic reviews for your business or content needs.",
    type: "website",
  },
};

function page() {
  return (
    <div>
      <AIReviewGen />
    </div>
  );
}

export default page;
