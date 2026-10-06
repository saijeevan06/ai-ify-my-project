import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  prefix?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, hint, prefix, id, className, ...rest }, ref) {
  const fid = id ?? `f-${rest.name}`;
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label htmlFor={fid} className="t-small font-medium text-ink">
        {label}
      </label>
      <div
        className={cn(
          'flex min-h-[52px] items-center rounded-btn border bg-surface transition-colors duration-[180ms] focus-within:border-ink',
          error ? 'border-[1.5px] border-error' : 'border-line',
        )}
      >
        {prefix && <span className="pl-4 font-mono text-[14px] text-muted">{prefix}</span>}
        <input
          ref={ref}
          id={fid}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fid}-err` : undefined}
          className="h-full w-full min-w-0 bg-transparent px-4 py-3 text-[16px] text-ink outline-none placeholder:text-faint focus-visible:outline-none"
          {...rest}
        />
      </div>
      {error ? (
        <p id={`${fid}-err`} role="alert" className="t-small text-error">
          {error}
        </p>
      ) : (
        hint && <p className="t-small text-muted">{hint}</p>
      )}
    </div>
  );
});
