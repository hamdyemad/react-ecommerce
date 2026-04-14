interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  mode?: 'light' | 'dark';
}

export function Pagination({ currentPage, totalPages, onPageChange, mode = 'light' }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          color: mode === 'light' ? '#334155' : '#cbd5e1',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: mode === 'light' ? '#e2e8f0' : '#334155'
        }}
        aria-label="Previous page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className="min-w-[40px] h-10 rounded-lg font-medium transition-all cursor-pointer"
            style={{
              backgroundColor: currentPage === page 
                ? (mode === 'light' ? '#212529' : '#ffffff')
                : (mode === 'light' ? '#ffffff' : '#1e293b'),
              color: currentPage === page 
                ? (mode === 'light' ? '#ffffff' : '#212529')
                : (mode === 'light' ? '#334155' : '#cbd5e1'),
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: currentPage === page
                ? (mode === 'light' ? '#212529' : '#ffffff')
                : (mode === 'light' ? '#e2e8f0' : '#334155')
            }}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span 
            key={index} 
            className="px-2"
            style={{ color: mode === 'light' ? '#64748b' : '#94a3b8' }}
          >
            {page}
          </span>
        )
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          color: mode === 'light' ? '#334155' : '#cbd5e1',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: mode === 'light' ? '#e2e8f0' : '#334155'
        }}
        aria-label="Next page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
