import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-light focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-blue-600 focus:ring-secondary",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger",
    success: "bg-success text-white hover:bg-green-600 focus:ring-success",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
