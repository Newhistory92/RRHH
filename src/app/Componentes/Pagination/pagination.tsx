import { ChevronLeft, ChevronRight } from "lucide-react";
import {PaginationProps} from '@/app/Interfas/Interfaces';




export const Pagination = ({ 
    totalItems, 
    itemsPerPage, 
    currentPage, 
    onPageChange 
}: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="mt-6 flex items-center justify-between">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
                Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
            </button>
        </div>
    );
};