import React from "react";

export function Flag({ countryCode, className = "size-6 rounded-full overflow-hidden" }) {
  const code = countryCode?.toUpperCase();

  return (
    <div className={`relative shrink-0 select-none ${className}`}>  
      {code === "US" && (
        <svg viewBox="0 0 32 32" className="h-full w-full object-cover">
          <rect width="32" height="32" fill="#fff" />
          <path d="M0 0h32v2.46H0zm0 4.92h32V7.38H0zm0 4.92h32v2.46H0zm0 4.92h32v2.46H0zm0 4.92h32v2.46H0zm0 4.92h32v2.46H0zm0 4.92h32v2.46H0z" fill="#b22234" />
          <rect width="14.77" height="17.23" fill="#3c3b6e" />
          <circle cx="2.5" cy="2.5" r="0.4" fill="#fff" />
          <circle cx="5.5" cy="2.5" r="0.4" fill="#fff" />
          <circle cx="8.5" cy="2.5" r="0.4" fill="#fff" />
          <circle cx="11.5" cy="2.5" r="0.4" fill="#fff" />
          <circle cx="4" cy="5.5" r="0.4" fill="#fff" />
          <circle cx="7" cy="5.5" r="0.4" fill="#fff" />
          <circle cx="10" cy="5.5" r="0.4" fill="#fff" />
          <circle cx="2.5" cy="8.5" r="0.4" fill="#fff" />
          <circle cx="5.5" cy="8.5" r="0.4" fill="#fff" />
          <circle cx="8.5" cy="8.5" r="0.4" fill="#fff" />
          <circle cx="11.5" cy="8.5" r="0.4" fill="#fff" />
          <circle cx="4" cy="11.5" r="0.4" fill="#fff" />
          <circle cx="7" cy="11.5" r="0.4" fill="#fff" />
          <circle cx="10" cy="11.5" r="0.4" fill="#fff" />
          <circle cx="2.5" cy="14.5" r="0.4" fill="#fff" />
          <circle cx="5.5" cy="14.5" r="0.4" fill="#fff" />
          <circle cx="8.5" cy="14.5" r="0.4" fill="#fff" />
          <circle cx="11.5" cy="14.5" r="0.4" fill="#fff" />
        </svg>
      )}

      {code === "MX" && (
        <svg viewBox="0 0 32 32" className="h-full w-full object-cover">
          <rect width="10.67" height="32" fill="#006847" />
          <rect x="10.67" width="10.67" height="32" fill="#fff" />
          <rect x="21.33" width="10.67" height="32" fill="#ce1126" />
          {/* Eagle Emblem */}
          <ellipse cx="16" cy="16.5" rx="2" ry="2.5" fill="#8b5a2b" />
          <path d="M14.5 15l1.5-2 1.5 2z" fill="#006847" />
          <path d="M14 18c2 2 2 2 4 0" stroke="#006847" strokeWidth="1" fill="none" />
        </svg>
      )}

      {code === "EU" && (
        <svg viewBox="0 0 32 32" className="h-full w-full object-cover">
          <rect width="32" height="32" fill="#003399" />
          <circle cx="16" cy="7" r="0.8" fill="#ffcc00" />
          <circle cx="16" cy="25" r="0.8" fill="#ffcc00" />
          <circle cx="7" cy="16" r="0.8" fill="#ffcc00" />
          <circle cx="25" cy="16" r="0.8" fill="#ffcc00" />
          <circle cx="9.6" cy="9.6" r="0.8" fill="#ffcc00" />
          <circle cx="22.4" cy="9.6" r="0.8" fill="#ffcc00" />
          <circle cx="9.6" cy="22.4" r="0.8" fill="#ffcc00" />
          <circle cx="22.4" cy="22.4" r="0.8" fill="#ffcc00" />
          <circle cx="11.5" cy="11.5" r="0.8" fill="#ffcc00" />
          <circle cx="20.5" cy="11.5" r="0.8" fill="#ffcc00" />
          <circle cx="11.5" cy="20.5" r="0.8" fill="#ffcc00" />
          <circle cx="20.5" cy="20.5" r="0.8" fill="#ffcc00" />
        </svg>
      )}

      {code === "UK" && (
        <svg viewBox="0 0 32 32" className="h-full w-full object-cover">
          <rect width="32" height="32" fill="#00247d" />
          <path d="M0 0l32 32M32 0L0 32" stroke="#fff" strokeWidth="4" />
          <path d="M0 0l32 32M32 0L0 32" stroke="#cf142b" strokeWidth="2.2" />
          <path d="M16 0v32M0 16h32" stroke="#fff" strokeWidth="7" />
          <path d="M16 0v32M0 16h32" stroke="#cf142b" strokeWidth="4.2" />
        </svg>
      )}

      {code === "JP" && (
        <svg viewBox="0 0 32 32" className="h-full w-full object-cover">
          <rect width="32" height="32" fill="#fff" />
          <circle cx="16" cy="16" r="6.5" fill="#bc002d" />
        </svg>
      )}

      {code === "CH" && (
        <svg viewBox="0 0 32 32" className="h-full w-full object-cover">
          <rect width="32" height="32" fill="#da291c" />
          <rect x="13.5" y="7" width="5" height="18" fill="#fff" />
          <rect x="7" y="13.5" width="18" height="5" fill="#fff" />
        </svg>
      )}

      {/* Fallback if code doesn't match */}
      {!["US", "MX", "EU", "UK", "JP", "CH"].includes(code) && (
        <div className="flex h-full w-full items-center justify-center bg-indigo-900 text-[10px] font-bold text-white">
          {code || "?"}
        </div>
      )}
    </div>
  );
}
