export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);



export const getScoreColor = (score) => {
  if (score >= 9) return 'bg-emerald-500';
  if (score >= 7) return 'bg-lime-500';
  if (score >= 5) return 'bg-yellow-500';
  if (score >= 3) return 'bg-orange-500';
  return 'bg-red-500';
};


export const CardTitle = ({ children, icon: Icon }) => (
  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
    {Icon && <Icon className="mr-3 h-5 w-5 text-indigo-500" />}
    {children}
  </h3>
);

//se mantiene
export const SoftSkillBar = ({ skill, score }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{skill}</span>
            <span className={`text-sm font-bold text-gray-700 dark:text-gray-200`}>{score}/10</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className={`${getScoreColor(score)} h-2.5 rounded-full`} style={{ width: `${score * 10}%` }}></div>
        </div>
    </div>
);
