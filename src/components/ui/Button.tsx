import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'accent';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg';
  /** Stretch to container width; label left, key right. */
  block?: boolean;
  loading?: boolean;
  loadingText?: string;
  /** Replace the arrow key icon. Pass `null` for no key. */
  icon?: ReactNode | null;
}

const styles: Record<Variant, { base: string; key: string }> = {
  primary: {
    base: 'bg-ink text-dark-text shadow-key hover:bg-[#2A2A28] active:translate-y-[2px] active:shadow-none',
    key: 'bg-accent text-ink',
  },
  secondary: {
    base: 'border border-ink text-ink hover:bg-sunken active:translate-y-[1px]',
    key: 'bg-sunken text-ink',
  },
  accent: {
    base: 'bg-accent text-ink shadow-[0_2px_0_0_#F4F1EA] hover:bg-accent-hover active:translate-y-[2px] active:shadow-none',
    key: 'bg-ink text-accent',
  },
};

/** Figma: Button (Type × State). The arrow sits on a highlighter “key”; pressing pushes the keycap down. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, loading, loadingText = 'Working…', icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const s = styles[variant];
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'group inline-flex select-none items-center gap-3 rounded-btn pl-5 pr-2 text-[16px] font-medium transition-[background-color,transform,box-shadow] duration-[180ms] ease-out-expo',
        size === 'lg' ? 'min-h-14 py-3' : 'min-h-12 py-2',
        block ? 'w-full justify-between' : 'justify-center',
        isDisabled ? 'cursor-not-allowed !border-transparent !bg-sunken !text-faint !shadow-none' : s.base,
        icon === null && 'pr-5',
        className,
      )}
      {...rest}
    >
      <span className="truncate">{loading ? loadingText : children}</span>
      {icon !== null && (
        <span
          aria-hidden
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-[6px] transition-transform duration-[180ms] ease-out-expo group-hover:translate-x-0.5',
            isDisabled ? 'bg-line text-faint' : s.key,
          )}
        >
          {loading ? <span className="font-mono text-[13px] tracking-widest">···</span> : (icon ?? <ArrowRight size={16} strokeWidth={2} />)}
        </span>
      )}
    </button>
  );
});
