"use client"
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (date: string | number | Date) =>
  new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

const baseCls = "mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition";
const disabledCls = "bg-gray-50 text-gray-400 cursor-not-allowed";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type CardProps = { children: React.ReactNode; className?: string };
type SectionTitleProps = { icon: React.ElementType; title: string };
type AccordionProps = { title: string; children: React.ReactNode; defaultOpen?: boolean };
type InputProps = { label: string; type?: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; disabled?: boolean; required?: boolean };
type SelectOption = { value: string; label: string };
type SelectProps = { label: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>; options: SelectOption[]; disabled?: boolean; required?: boolean };

// ─── Componentes ──────────────────────────────────────────────────────────────

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

export const SectionTitle = ({ icon: Icon, title }: SectionTitleProps) => (
  <div className="flex items-center gap-3 mb-6">
    <Icon className="w-6 h-6 text-primary" />
    <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
  </div>
);

export const Accordion = ({ title, children, defaultOpen = false }: AccordionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
      >
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 py-3 border-t border-gray-100">{children}</div>}
    </div>
  );
};

const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

export const Input = ({ label, type = 'text', value, onChange, disabled = false, required = false }: InputProps) => (
  <div>
    <FieldLabel label={label} required={required} />
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`${baseCls} ${disabled ? disabledCls : 'bg-white'}`}
    />
  </div>
);

export const Select = ({ label, value, onChange, options, disabled = false, required = false }: SelectProps) => (
  <div>
    <FieldLabel label={label} required={required} />
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`${baseCls} ${disabled ? disabledCls : 'bg-white'}`}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);