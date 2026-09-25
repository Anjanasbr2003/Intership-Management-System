import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No Data Found', 
  message = 'There is currently no data to display here.',
  action = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-applePageEnter">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-text-disabled" strokeWidth={1.5} />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{message}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
