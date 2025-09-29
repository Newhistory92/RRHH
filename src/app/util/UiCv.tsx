"use client"
import React, { useState } from 'react';
import { ChevronDown, ChevronUp,} from 'lucide-react';




export const formatDate = (date: string | number | Date) => new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${className}`}>{children}</div>
);
type SectionTitleProps = {
  icon: React.ElementType;
  title: string;
};

export const SectionTitle = ({ icon, title }: SectionTitleProps) => (
  <div className="flex items-center space-x-3 mb-6">
    {React.createElement(icon, { className: "w-7 h-7 text-[#1ABCD7] text-shadow-md" })}
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
  </div>
);
type AccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export const Accordion = ({ title, children, defaultOpen = false }: AccordionProps) => { const [isOpen, setIsOpen] = useState(defaultOpen); return ( <div className="border rounded-lg overflow-hidden"> <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"> <h3 className="font-semibold text-gray-700">{title}</h3> {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />} </button> {isOpen && <div className="p-4 border-t">{children}</div>} </div> ); };
type InputProps = {
  label: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  required?: boolean;
};

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
}: InputProps) => (
  <div>
	<label className="block text-sm font-medium text-gray-700">
	  {label}
	  {required && <span className="text-red-500">*</span>}
	</label>
	<input
	  type={type}
	  value={value || ''}
	  onChange={onChange}
	  disabled={disabled}
	  required={required}
	  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
	/>
  </div>
);
type SelectOption = { value: string; label: string };
type SelectProps = {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
};

export const Select = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
}: SelectProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
