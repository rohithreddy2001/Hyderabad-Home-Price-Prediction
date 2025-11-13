// src/components/SearchableSelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible searchable combo box.
 * Props:
 * - id, label, options[], value, onChange
 * - placeholder
 * - leadingIcon: React node (displayed inside input on the left)
 * - optionIcons: map { optionValue: ReactNode } used inside dropdown list
 *
 * Note: icons should be aria-hidden (decorative) so screen readers read the label/value as text.
 */

export default function SearchableSelect({
  id,
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  leadingIcon = null,
  optionIcons = {}
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef();

  // filtered matching options based on query or show all when query empty
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setHighlight(0);
    }
  }, [open]);

  function handleKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, Math.max(0, filtered.length - 1)));
      setOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) {
        onChange(filtered[highlight]);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="field" ref={wrapperRef} style={{ position: 'relative' }}>
      {label && <label className="label" htmlFor={id}>{label}</label>}

      <div style={{ position: 'relative' }}>
        {leadingIcon && (
          <div style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            {leadingIcon}
          </div>
        )}

        <input
          id={id}
          className="select-input"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          value={open ? query : (value || '')}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setHighlight(0); }}
          onKeyDown={handleKey}
          style={{ paddingLeft: leadingIcon ? 40 : undefined }}
          aria-label={label}
        />

        {open && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              zIndex: 40,
              marginTop: 8,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 8,
              maxHeight: 260,
              overflow: 'auto',
              padding: 6,
              boxShadow: '0 6px 24px rgba(16,24,40,0.08)'
            }}
          >
            {filtered.length === 0 && (
              <li style={{ padding: 10, color: 'var(--muted)', fontSize: 'var(--type-sm)' }}>No matches</li>
            )}

            {filtered.map((opt, i) => {
              const isSelected = value === opt;
              const isHighlighted = i === highlight;
              return (
                <li
                  key={opt}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(ev) => { ev.preventDefault(); onChange(opt); setOpen(false); }}
                  onMouseEnter={() => setHighlight(i)}
                  style={{
                    padding: 8,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    background: isHighlighted ? 'rgba(47,128,237,0.06)' : 'transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 'var(--type-sm)'
                  }}
                >
                  <span style={{ width: 26, display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                    {optionIcons[opt] ?? null}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isSelected && <span style={{ color: 'var(--primary)', fontSize: 12 }}>✓</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

SearchableSelect.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  leadingIcon: PropTypes.node,
  optionIcons: PropTypes.object
};
