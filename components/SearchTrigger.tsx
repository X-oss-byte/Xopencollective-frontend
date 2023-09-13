import React from 'react';
import { Search } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

const SearchTrigger = ({ setShowSearchModal }) => {
  React.useEffect(() => {
    const handleKeydown = e => {
      if (e.key === '/' && e.target.tagName === 'BODY') {
        e.preventDefault();
        setShowSearchModal(show => !show);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <button
      className="relative flex h-8 w-8 items-center justify-center gap-1.5 rounded-full border text-slate-500 ring-black ring-offset-2 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 xl:w-auto xl:justify-start xl:px-2 xl:pr-4"
      onClick={() => setShowSearchModal(true)}
    >
      <Search size={16} />
      <span className="hidden text-xs xl:block">
        <FormattedMessage
          defaultMessage="Type {slash} to search for Collectives..."
          values={{ slash: <span className="rounded-sm border bg-slate-100 px-1">/</span> }}
        />
      </span>
    </button>
  );
};

export default SearchTrigger;
