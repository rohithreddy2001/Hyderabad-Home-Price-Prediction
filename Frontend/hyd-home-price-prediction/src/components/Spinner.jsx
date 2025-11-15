// src/components/Spinner.jsx
import React from 'react';

export default function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" aria-hidden>
      <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(47,128,237,0.15)" strokeWidth="5" />
      <path d="M45 25a20 20 0 0 1-20 20" fill="none" stroke="#2F80ED" strokeWidth="5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
