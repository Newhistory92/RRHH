import { X } from "lucide-react";
import { ReactNode } from "react";

type ModalProps = {
  show: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
};

export const Modal = ({ show, onClose, title, children }: ModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-transform  animate-in fade-in-0 scale-100">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};