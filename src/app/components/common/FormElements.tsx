"use client";

import React from 'react';

export const Input = ({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <input
            {...props}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-800 placeholder:text-gray-400"
        />
    </div>
);

export const Select = ({ label, options, ...props }: { label?: string; options: { label: string; value: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <select
            {...props}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-gray-800 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export const Button = ({ children, variant = "primary", icon: Icon, ...props }: { children: React.ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost"; icon?: any } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
    };

    return (
        <button
            {...props}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
        >
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
};

export const Badge = ({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "yellow" | "red" | "gray" }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
        red: "bg-red-50 text-red-600 border-red-100",
        gray: "bg-gray-50 text-gray-600 border-gray-100"
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
            {children}
        </span>
    );
};
