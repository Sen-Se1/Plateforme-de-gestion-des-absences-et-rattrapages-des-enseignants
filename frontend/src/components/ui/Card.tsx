import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  description,
  footer,
}) => {
  return (
    <div className={`bg-neutral-card rounded-xl shadow-md overflow-hidden border border-slate-100 ${className}`}>
      {(title || description) && (
        <div className="p-6 pb-0">
          {title && <h3 className="text-xl font-bold text-slate-primary">{title}</h3>}
          {description && <p className="mt-2 text-slate-secondary text-sm">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && <div className="p-6 pt-0 border-t border-slate-50">{footer}</div>}
    </div>
  );
};

export default Card;
