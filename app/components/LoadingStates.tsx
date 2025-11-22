// Reusable Loading State Components
// These provide better UX than generic "Loading..." text

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="animate-pulse space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <div className="h-12 bg-gray-200 rounded flex-1"></div>
        <div className="h-12 bg-gray-200 rounded w-32"></div>
        <div className="h-12 bg-gray-200 rounded w-24"></div>
        <div className="h-12 bg-gray-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-10 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-28"></div>
      <div className="h-32 bg-gray-200 rounded w-full"></div>
    </div>
    <div className="flex gap-4">
      <div className="h-12 bg-gray-200 rounded w-32"></div>
      <div className="h-12 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="animate-pulse bg-white rounded-lg shadow p-6">
    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-32"></div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const InvoiceDetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    {/* Status badges */}
    <div className="flex gap-4">
      <div className="h-8 bg-gray-200 rounded w-32"></div>
      <div className="h-8 bg-gray-200 rounded w-32"></div>
    </div>

    {/* Info cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-40"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-40"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Items table */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <TableSkeleton rows={3} />
    </div>
  </div>
);

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );
};

export const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

export const InlineLoader = ({ message }: { message?: string }) => (
  <div className="flex items-center gap-2 text-gray-600">
    <LoadingSpinner size="sm" />
    {message && <span className="text-sm">{message}</span>}
  </div>
);
