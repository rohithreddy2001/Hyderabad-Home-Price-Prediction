// src/components/icons.js
import React from 'react';

/* Decorative icons used in the form. They are aria-hidden by default. */

export const IconPin = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="#6B7280" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0z" stroke="#6B7280" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

export const IconApartment = ({ size = 18, stroke = '#2F80ED' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3.2" y="4.2" width="17.6" height="15.6" rx="1.6" stroke={stroke} strokeWidth="1.2" />
    <path d="M8.2 8.4h1v1h-1zM11.2 8.4h3v1h-3zM8.2 11.4h3v1h-3zM8.2 14.4h3v1h-3zM14.2 11.4h1v1h-1zM14.2 14.4h1v1h-1z" fill={stroke} opacity="0.12" />
  </svg>
);

export const IconHouse = ({ size = 18, stroke = '#2F80ED' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3.2 11.4L12 5l8.8 6.4" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M7 21V13h10v8" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

export const IconVilla = ({ size = 18, stroke = '#2F80ED' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3.2 12l8.8-6 8.8 6" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M7 21V12h10v9" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    <rect x="10.6" y="14" width="2.8" height="3" rx="0.4" fill={stroke} opacity="0.12"/>
  </svg>
);

export const IconArea = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#6B7280" strokeWidth="1.2"/>
    <path d="M8 8h8M8 12h4" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconBed = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 10v6h18v-6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3z" stroke="#6B7280" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M7 10v-2a2 2 0 0 1 2-2h6" stroke="#6B7280" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);
