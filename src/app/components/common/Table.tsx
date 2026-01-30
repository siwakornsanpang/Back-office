"use client";

import React from 'react';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
    isLoading?: boolean;
}

export const Table = ({ headers, children, isLoading }: TableProps) => {
    return (
        <div className="w-full overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {headers.map((header, index) => (
                            <th key={index} className="px-6 py-4 text-sm font-semibold text-gray-600">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-12 text-center">
                                <div className="flex justify-center items-center gap-2 text-gray-400">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>กำลังโหลดข้อมูล...</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        children
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const TableRow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
        {children}
    </tr>
);

export const TableCell = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string } & React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className={`px-6 py-4 text-sm text-gray-700 ${className}`} {...props}>
        {children}
    </td>
);

