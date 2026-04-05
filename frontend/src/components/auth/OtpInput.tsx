import { useRef, useState, useEffect, useCallback, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  disabled?: boolean;
  error?: boolean;
  resendCooldown?: number; // seconds
}

export default function OtpInput({
  length = 6,
  onComplete,
  onResend,
  disabled = false,
  error = false,
  resendCooldown = 30,
}: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [popIndices, setPopIndices] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Shake on error
  useEffect(() => {
    if (error) {
      setIsShaking(true);
      const t = setTimeout(() => setIsShaking(false), 600);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Pop animation helper
  const triggerPop = useCallback((index: number) => {
    setPopIndices((prev) => new Set(prev).add(index));
    setTimeout(() => {
      setPopIndices((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 300);
  }, []);

  const handleChange = (index: number, val: string) => {
    if (disabled || isSuccess) return;
    if (!/^\d*$/.test(val)) return;

    const next = [...values];
    next[index] = val.slice(-1);
    setValues(next);

    if (val) triggerPop(index);

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    const otp = next.join('');
    if (otp.length === length && next.every((v) => v !== '')) {
      setIsSuccess(true);
      setTimeout(() => onComplete(otp), 800);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || isSuccess) return;
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!data) return;

    const next = [...values];
    for (let i = 0; i < data.length; i++) {
      next[i] = data[i];
      triggerPop(i);
    }
    setValues(next);

    const focusIdx = Math.min(data.length, length - 1);
    inputs.current[focusIdx]?.focus();

    if (data.length === length) {
      setIsSuccess(true);
      setTimeout(() => onComplete(data), 800);
    }
  };

  const handleResend = () => {
    if (!canResend || disabled) return;
    setValues(Array(length).fill(''));
    setIsSuccess(false);
    setTimer(resendCooldown);
    setCanResend(false);
    inputs.current[0]?.focus();
    onResend?.();
  };

  const filledCount = values.filter((v) => v !== '').length;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* OTP Input Boxes */}
      <div
        className={`flex items-center justify-center gap-2 sm:gap-3 ${
          isShaking ? 'animate-shake' : ''
        }`}
        style={
          isShaking
            ? {
                animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
              }
            : undefined
        }
      >
        {values.map((val, i) => {
          const isFocused = focusedIndex === i;
          const isFilled = val !== '';
          const isPop = popIndices.has(i);

          return (
            <div key={i} className="relative">
              <input
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                disabled={disabled || isSuccess}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={() => setFocusedIndex(i)}
                aria-label={`Digit ${i + 1} of ${length}`}
                className={`
                  h-14 w-11 sm:h-16 sm:w-14 rounded-xl border-2 bg-background 
                  text-center text-xl sm:text-2xl font-bold 
                  transition-all duration-300 ease-out
                  focus:outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isSuccess
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                      : error
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      : isFocused
                      ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10 scale-105'
                      : isFilled
                      ? 'border-primary/60 bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }
                  ${isPop ? 'scale-110' : ''}
                `}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animationDelay: isSuccess ? `${i * 80}ms` : undefined,
                }}
              />
              {/* Success checkmark overlay */}
              {isSuccess && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    animation: 'fadeInUp 0.4s ease-out forwards',
                    animationDelay: `${i * 80 + 200}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progressive fill indicator dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
              i < filledCount
                ? isSuccess
                  ? 'w-4 bg-green-500'
                  : error
                  ? 'w-4 bg-red-500'
                  : 'w-4 bg-primary'
                : 'w-1.5 bg-border'
            }`}
          />
        ))}
      </div>

      {/* Resend Timer */}
      {onResend && (
        <div className="text-center text-sm">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={disabled}
              className="text-primary font-semibold hover:underline focus:outline-none 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 hover:text-primary/80"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-muted-foreground">
              Resend in{' '}
              <span className="font-mono font-semibold text-foreground tabular-nums">
                {String(Math.floor(timer / 60)).padStart(2, '0')}:
                {String(timer % 60).padStart(2, '0')}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Inline keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

