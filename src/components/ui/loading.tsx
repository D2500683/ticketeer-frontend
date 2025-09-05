import { Ticket } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Loading = ({ size = "md", className = "" }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-orange-500 rounded-full flex items-center justify-center animate-pulse`}>
        <Ticket className={`${iconSizes[size]} text-white animate-bounce`} />
      </div>
    </div>
  );
};

export { Loading };
