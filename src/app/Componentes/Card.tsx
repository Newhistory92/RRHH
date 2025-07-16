export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);