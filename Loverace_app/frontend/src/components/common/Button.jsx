import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-gradient-to-br from-primary to-rose text-white shadow-[0_4px_20px_rgba(192,0,42,0.35)] active:shadow-none',
    secondary:
      'bg-white text-primary border-2 border-blush hover:bg-blush active:bg-blush',
    ghost:
      'bg-transparent text-primary border border-[var(--border)] hover:bg-blush',
    danger:
      'bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg',
    icon:
      'bg-white border border-[var(--border)] text-primary rounded-full shadow-sm hover:bg-blush',
  };

  const sizes = {
    sm: 'text-sm px-4 py-2 gap-1.5',
    md: 'text-base px-6 py-3 gap-2',
    lg: 'text-lg px-8 py-4 gap-2',
    icon: 'p-3',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      className={clsx(base, variants[variant], sizes[size === 'icon' ? 'icon' : size], className)}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
