import { ReactNode } from "react";

const variantClasses = {
  primary:
    "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  danger:
    "bg-red-500 text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300",
  warning:
    "bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 disabled:bg-yellow-300",
  success:
    "bg-green-500 text-white shadow-theme-xs hover:bg-green-600 disabled:bg-green-300",
  info:
    "bg-blue-500 text-white shadow-theme-xs hover:bg-blue-600 disabled:bg-blue-300",
  light:
    "bg-gray-200 text-gray-800 shadow-theme-xs hover:bg-gray-300 disabled:bg-gray-100",
  dark:
    "bg-gray-800 text-white shadow-theme-xs hover:bg-gray-900 disabled:bg-gray-700",
  outline:
    "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-400",
  link:
    "bg-transparent text-blue-600 underline hover:text-blue-700",
};

type Variant = keyof typeof variantClasses;

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: Variant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${sizeClasses[size]} ${
        variantClasses[variant]
      } ${className} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;