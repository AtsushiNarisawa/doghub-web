"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-0">
      {faqs.map((faq, i) => (
        <div key={i} className="border-t border-[#E5DDD8]">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
          >
            <p className="text-[#3C200F] group-hover:text-[#B87942] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
              <span className="text-[#B87942] mr-2">Q.</span>{faq.q}
            </p>
            <span
              className="text-[#B87942] flex-shrink-0 ml-4 transition-transform duration-300 border border-[#B87942] rounded-full w-6 h-6 flex items-center justify-center"
              style={{ transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: openIndex === i ? "500px" : "0px",
              opacity: openIndex === i ? 1 : 0,
            }}
          >
            <p className="text-[#8F7B65] pl-5 pb-5" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
