import { motion } from 'framer-motion';

export const ProductSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
      <div className="flex justify-between mb-3">
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
    </div>
  </div>
);

export const CartItemSkeleton = () => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />
    <div className="flex-1">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
    </div>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      <div className="w-8 h-5 bg-gray-200 rounded animate-pulse" />
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    </div>
    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
    </div>
    <div className="h-10 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100">
    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
    <div className="flex-1">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
    </div>
    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
    <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
  </div>
);

interface SkeletonGridProps {
  count?: number;
  type?: 'product' | 'cart' | 'card' | 'table';
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 4, type = 'product' }) => {
  const SkeletonComponent = {
    product: ProductSkeleton,
    cart: CartItemSkeleton,
    card: DashboardCardSkeleton,
    table: TableRowSkeleton
  }[type];

  return (
    <div className={`grid gap-4 ${type === 'product' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonComponent />
        </motion.div>
      ))}
    </div>
  );
};
