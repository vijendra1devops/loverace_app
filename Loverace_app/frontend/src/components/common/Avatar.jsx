import clsx from 'clsx';

const STAGE_COLORS = {
  1: 'ring-pink-400',
  2: 'ring-rose-500',
  3: 'ring-primary',
  4: 'ring-primary-dark',
};

export default function Avatar({
  src,
  name = '?',
  size = 'md',
  stage = null,
  online = false,
  className = '',
  onClick,
}) {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-28 h-28 text-2xl',
  };

  const ringColor = stage ? STAGE_COLORS[stage] || 'ring-pink-400' : '';

  return (
    <div
      className={clsx('relative inline-flex flex-shrink-0', className)}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div
        className={clsx(
          'rounded-full overflow-hidden bg-blush flex items-center justify-center',
          sizes[size],
          stage ? `ring-2 ring-offset-1 ${ringColor}` : '',
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="font-bold text-primary select-none">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
}
