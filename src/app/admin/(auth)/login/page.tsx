'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  Delete,
  Sparkles,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { adminUsers } from '@/lib/mock-data';
import { markSpaSessionActive } from '@/lib/spaAuthSession';

// ==================== SECURITY CONSTANTS ====================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_STORAGE_KEY = 'bvilla_security_lockout_v2';
const AUTH_STORAGE_KEY = 'bvilla_auth';
const PIN_LENGTH = 6;

// Exponential Backoff Lockout Duration
// Lần 1: 30s | Lần 2: 60s | Lần 3: 120s | Lần 4: 300s (5 phút) | Lần 5+: 900s (15 phút)
const getLockoutDurationSeconds = (lockoutCount: number): number => {
  if (lockoutCount <= 1) return 30;
  if (lockoutCount === 2) return 60;
  if (lockoutCount === 3) return 120;
  if (lockoutCount === 4) return 300;
  return 900;
};

export default function LoginPage() {
  const router = useRouter();

  // Glassy OTP State
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Security & Lockout states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCount, setLockoutCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  const [totalLockoutDuration, setTotalLockoutDuration] = useState(30);

  // Status & Feedback animations
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile / touch devices to prevent unwanted virtual keyboard popup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const isSmall = window.innerWidth < 768;
      setIsMobile(isTouch || isSmall);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Restore lockout status from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(LOCKOUT_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        const lockedUntil = Number(data.lockedUntil) || 0;
        const count = Number(data.lockoutCount) || 0;
        const attempts = Number(data.failedAttempts) || 0;

        setLockoutCount(count);
        setFailedAttempts(attempts);

        if (lockedUntil > now) {
          const secondsRemaining = Math.ceil((lockedUntil - now) / 1000);
          const duration = getLockoutDurationSeconds(count);
          setTotalLockoutDuration(duration);
          setLockoutSecondsLeft(secondsRemaining);
          setIsLocked(true);
        } else if (attempts >= MAX_FAILED_ATTEMPTS) {
          setFailedAttempts(0);
          localStorage.setItem(
            LOCKOUT_STORAGE_KEY,
            JSON.stringify({
              failedAttempts: 0,
              lockoutCount: count,
              lockedUntil: 0,
            })
          );
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isLocked || lockoutSecondsLeft <= 0) return;

    const interval = setInterval(() => {
      setLockoutSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsLocked(false);
          setFailedAttempts(0);
          setErrorMessage('');

          try {
            const stored = localStorage.getItem(LOCKOUT_STORAGE_KEY);
            const currentCount = stored ? JSON.parse(stored).lockoutCount || 0 : 0;
            localStorage.setItem(
              LOCKOUT_STORAGE_KEY,
              JSON.stringify({
                failedAttempts: 0,
                lockoutCount: currentCount,
                lockedUntil: 0,
              })
            );
          } catch {
            // Ignore
          }
          // Refocus first slot after unlock (desktop with physical keyboard only)
          if (!isMobile) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, isMobile, lockoutSecondsLeft]);

  // Focus the current active input on mount or unlock (Desktop with physical keyboard ONLY)
  useEffect(() => {
    // On phones / touch devices, NEVER auto-focus on load to prevent the OS virtual keyboard from covering the screen
    if (isMobile) return;

    if (!isLocked && !isLoading && !isSuccess) {
      inputRefs.current[0]?.focus();
    }
  }, [isLocked, isLoading, isMobile, isSuccess]);

  // Shake animation trigger
  const triggerShake = () => {
    setIsShaking(true);
    setIsError(true);
    setTimeout(() => {
      setIsShaking(false);
      setIsError(false);
    }, 650);
  };

  // Verify PIN submission via secure Server API
  const verifyPin = useCallback(
    async (pinCode: string) => {
      if (isLocked) {
        triggerShake();
        setErrorMessage(
          `Hệ thống đang tạm khóa an ninh. Vui lòng chờ ${lockoutSecondsLeft}s trước khi thử lại.`
        );
        return;
      }

      if (pinCode.length < PIN_LENGTH) {
        triggerShake();
        setErrorMessage(`Vui lòng nhập đủ ${PIN_LENGTH} chữ số của mã PIN bảo mật.`);
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: pinCode }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setIsLoading(false);
          triggerShake();

          if (res.status === 429) {
            // Server rate-limit lockout
            const waitSec = data.lockoutSecondsLeft || 60;
            setIsLocked(true);
            setLockoutSecondsLeft(waitSec);
            setTotalLockoutDuration(waitSec);
            setErrorMessage(data.message || 'CẢNH BÁO BẢO MẬT: Quá nhiều lần thử sai. Tạm khóa đăng nhập.');
          } else {
            const nextFailed = failedAttempts + 1;
            setFailedAttempts(nextFailed);

            if (nextFailed >= MAX_FAILED_ATTEMPTS) {
              const nextLockoutCount = lockoutCount + 1;
              const durationSec = getLockoutDurationSeconds(nextLockoutCount);
              const lockedUntil = Date.now() + durationSec * 1000;

              setLockoutCount(nextLockoutCount);
              setTotalLockoutDuration(durationSec);
              setLockoutSecondsLeft(durationSec);
              setIsLocked(true);

              try {
                localStorage.setItem(
                  LOCKOUT_STORAGE_KEY,
                  JSON.stringify({
                    failedAttempts: MAX_FAILED_ATTEMPTS,
                    lockoutCount: nextLockoutCount,
                    lockedUntil,
                  })
                );
              } catch {}

              setErrorMessage(
                `CẢNH BÁO BẢO MẬT: Nhập sai mã PIN quá ${MAX_FAILED_ATTEMPTS} lần liên tiếp! Hệ thống tạm thời khóa đăng nhập ${durationSec} giây.`
              );
            } else {
              const remaining = MAX_FAILED_ATTEMPTS - nextFailed;
              try {
                localStorage.setItem(
                  LOCKOUT_STORAGE_KEY,
                  JSON.stringify({
                    failedAttempts: nextFailed,
                    lockoutCount,
                    lockedUntil: 0,
                  })
                );
              } catch {}

              setErrorMessage(
                data.message || `Mã PIN không chính xác! Bạn còn ${remaining}/${MAX_FAILED_ATTEMPTS} lần thử trước khi bị tạm khóa.`
              );
            }
          }

          // Clear pin inputs on error
          setTimeout(() => {
            setPin(Array(PIN_LENGTH).fill(''));
            setActiveIndex(0);
            if (!isLocked && !isMobile) {
              inputRefs.current[0]?.focus();
            }
          }, 400);

          return;
        }

        // PIN IS CORRECT
        setErrorMessage('');
        try {
          localStorage.removeItem(LOCKOUT_STORAGE_KEY);
        } catch {}

        markSpaSessionActive();
        const userIdx = data.user?.userIndex ?? 0;
        const user = adminUsers[userIdx] || adminUsers[0];
        if (typeof window !== 'undefined') {
          const authPayload = {
            user,
            authenticatedAt: Date.now(),
          };

          // Session storage (active for this single SPA session only)
          sessionStorage.setItem('bvilla_admin_session', JSON.stringify(authPayload));
          // Note: DO NOT store in localStorage so that F5/reload or closing browser forces re-login
          localStorage.removeItem('bvilla_auth');
        }

        setIsLoading(false);
        setIsSuccess(true);

        setTimeout(() => {
          let target = '/admin';
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectParam = urlParams.get('redirect');
            if (redirectParam && redirectParam.startsWith('/admin') && !redirectParam.startsWith('/admin/login')) {
              target = redirectParam;
            }
          }
          router.replace(target);
        }, 500);
      } catch {
        setIsLoading(false);
        triggerShake();
        setErrorMessage('Không thể kết nối đến máy chủ bảo mật. Vui lòng thử lại.');
      }
    },
    [failedAttempts, isLocked, lockoutCount, lockoutSecondsLeft, router]
  );

  // Handle slot input change
  const handleInputChange = (idx: number, value: string) => {
    if (isLocked || isLoading || isSuccess) return;

    // Filter only digits
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    if (!cleanDigit) return;

    const newPin = [...pin];
    newPin[idx] = cleanDigit;
    setPin(newPin);

    // Auto-advance
    if (idx < PIN_LENGTH - 1) {
      setActiveIndex(idx + 1);
      inputRefs.current[idx + 1]?.focus();
    } else {
      // Reached last digit -> check auto verify
      const fullPin = newPin.join('');
      if (fullPin.length === PIN_LENGTH) {
        verifyPin(fullPin);
      }
    }
  };

  // Handle KeyDown navigation (Backspace, Arrows)
  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLocked || isLoading || isSuccess) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...pin];

      if (newPin[idx]) {
        newPin[idx] = '';
        setPin(newPin);
      } else if (idx > 0) {
        newPin[idx - 1] = '';
        setPin(newPin);
        setActiveIndex(idx - 1);
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      setActiveIndex(idx - 1);
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < PIN_LENGTH - 1) {
      e.preventDefault();
      setActiveIndex(idx + 1);
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      verifyPin(pin.join(''));
    }
  };

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent) => {
    if (isLocked || isLoading || isSuccess) return;
    e.preventDefault();

    const pastedDigits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pastedDigits) return;

    const newPin = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < pastedDigits.length; i++) {
      newPin[i] = pastedDigits[i];
    }
    setPin(newPin);

    const nextIdx = Math.min(pastedDigits.length, PIN_LENGTH - 1);
    setActiveIndex(nextIdx);
    if (!isMobile) {
      inputRefs.current[nextIdx]?.focus();
    }

    if (pastedDigits.length === PIN_LENGTH) {
      verifyPin(pastedDigits);
    }
  };

  // Tactile Glass Keypad Click
  const handleKeypadPress = (val: string) => {
    if (isLocked || isLoading || isSuccess) return;

    if (val === 'CLEAR') {
      setPin(Array(PIN_LENGTH).fill(''));
      setActiveIndex(0);
      if (!isMobile) {
        inputRefs.current[0]?.focus();
      }
      return;
    }

    if (val === 'BACK') {
      // Find last filled index
      const lastFilled = pin.reduce((acc, curr, i) => (curr !== '' ? i : acc), -1);
      if (lastFilled >= 0) {
        const newPin = [...pin];
        newPin[lastFilled] = '';
        setPin(newPin);
        setActiveIndex(lastFilled);
        if (!isMobile) {
          inputRefs.current[lastFilled]?.focus();
        }
      }
      return;
    }

    // Number digit 0-9
    const firstEmpty = pin.findIndex((d) => d === '');
    const targetIdx = firstEmpty !== -1 ? firstEmpty : activeIndex;

    if (targetIdx >= 0 && targetIdx < PIN_LENGTH) {
      const newPin = [...pin];
      newPin[targetIdx] = val;
      setPin(newPin);

      if (targetIdx < PIN_LENGTH - 1) {
        setActiveIndex(targetIdx + 1);
        if (!isMobile) {
          inputRefs.current[targetIdx + 1]?.focus();
        }
      } else {
        const fullPin = newPin.join('');
        if (fullPin.length === PIN_LENGTH) {
          verifyPin(fullPin);
        }
      }
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0E1114] text-[#FAF8F5] relative overflow-y-auto selection:bg-[#C2A476] selection:text-black">
      {/* Subtle background ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C2A476]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a88d5f]/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-md space-y-4 transition-all duration-300 relative z-10 my-auto ${
          isShaking ? 'animate-shake' : 'animate-fade-in'
        }`}
      >
        {/* ========================================================
            CENTERED BRAND HEADER (LOGO & BRAND NAME)
            ======================================================== */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#C2A476] via-[#E2C799] to-[#a88d5f] p-0.5 shadow-2xl mb-3 flex items-center justify-center hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#14171A] rounded-[14px] flex items-center justify-center p-2.5 overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="B Villa Da Nang Logo"
                width={42}
                height={42}
                priority
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(194,164,118,0.5)]"
              />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-white">
            B VILLA DA NANG
          </h1>
          <p className="text-[10px] sm:text-[11px] tracking-[0.25em] text-[#C2A476] uppercase font-bold mt-1">
            Luxury Coastal Retreats
          </p>
        </div>

        {/* Glass Card Container (Centered) */}
        <div className="backdrop-blur-2xl bg-white/[0.035] border border-white/10 rounded-3xl p-5 sm:p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C2A476] to-transparent opacity-80" />

            {/* Header: Title & Badges */}
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C2A476]/15 border border-[#C2A476]/30 flex items-center justify-center text-[#C2A476]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Đăng Nhập Quản Trị
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Nhập mã số PIN bảo mật (6 số) để xác thực quyền quản trị viên.
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold tracking-wide shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bảo Mật Cao</span>
              </div>
            </div>

            {/* ACTIVE LOCKOUT NOTIFICATION (Brute-force protection) */}
            {isLocked && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-600/20 via-red-500/10 to-amber-500/20 border border-red-500/40 text-red-400 space-y-3 animate-security-pulse shadow-lg backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                      HỆ THỐNG ĐÃ KHÓA AN TOÀN
                    </h4>
                    <p className="text-[11px] text-red-300/90 mt-0.5 leading-relaxed">
                      Nhập sai quá {MAX_FAILED_ATTEMPTS} lần liên tiếp (Lần phạt #{lockoutCount}). Tạm dừng mọi thao tác để chống dò mật khẩu.
                    </p>
                  </div>
                </div>

                {/* Countdown Visual Timer */}
                <div className="bg-black/40 rounded-xl p-2.5 border border-red-500/25 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="text-xs font-semibold text-neutral-300">
                      Mở khóa tự động sau:
                    </span>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-red-400 bg-red-500/20 px-2 py-0.5 rounded-lg border border-red-500/30">
                    {String(Math.floor(lockoutSecondsLeft / 60)).padStart(2, '0')}:
                    {String(lockoutSecondsLeft % 60).padStart(2, '0')}s
                  </span>
                </div>

                {/* Progress Bar of Lockout */}
                <div className="w-full h-1 bg-red-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-1000 ease-linear rounded-full"
                    style={{
                      width: `${Math.max(0, (lockoutSecondsLeft / totalLockoutDuration) * 100)}%`,
                    }}
                  />
                </div>

                <p className="text-[10px] text-neutral-400 text-center italic">
                  * Nhập sai tiếp sau mở khóa sẽ tăng thời gian phạt lên {getLockoutDurationSeconds(lockoutCount + 1)}s.
                </p>
              </div>
            )}

            {/* Error Banner when incorrect */}
            {!isLocked && errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  {errorMessage}
                  {failedAttempts > 0 && (
                    <div className="mt-1 flex items-center gap-1.5 font-bold text-amber-400">
                      <span>Số lần sai:</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px]">
                        {failedAttempts} / {MAX_FAILED_ATTEMPTS}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Banner */}
            {isSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                <div>
                  <p className="text-sm">Xác thực mã PIN thành công!</p>
                  <p className="font-normal text-emerald-300/80 text-[11px]">
                    Đang chuyển hướng vào bảng điều khiển quản trị...
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================
                GLASSY OTP SLOTS (6 BOXES WITH LUXURY GLASSMORPHISM)
                ======================================================== */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#C2A476]">
                  Mã PIN 6 Chữ Số
                </span>
                <button
                  type="button"
                  onClick={() => setIsMasked(!isMasked)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-[#C2A476] transition-colors cursor-pointer"
                  title={isMasked ? 'Hiển thị số' : 'Ẩn số (chế độ bảo mật)'}
                >
                  {isMasked ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hiện số</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ẩn số</span>
                    </>
                  )}
                </button>
              </div>

              {/* 6 Glassy Input Slots */}
              <div
                onPaste={handlePaste}
                className="grid grid-cols-6 gap-2 sm:gap-3 py-2"
              >
                {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
                  const digit = pin[idx];
                  const isCurrentActive = activeIndex === idx && !isLocked;
                  const isFilled = Boolean(digit);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!isLocked && !isLoading && !isSuccess) {
                          setActiveIndex(idx);
                          if (!isMobile) {
                            inputRefs.current[idx]?.focus();
                          }
                        }
                      }}
                      className={`relative w-full aspect-[4/5] sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer select-none overflow-hidden ${
                        isLocked
                          ? 'bg-white/[0.02] border border-white/5 opacity-40 cursor-not-allowed'
                          : isSuccess
                          ? 'bg-emerald-500/15 border-2 border-emerald-400 ring-4 ring-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                          : isError
                          ? 'bg-rose-500/15 border-2 border-rose-500 ring-4 ring-rose-500/25 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                          : isCurrentActive
                          ? 'bg-[#C2A476]/15 border-2 border-[#C2A476] ring-4 ring-[#C2A476]/25 shadow-[0_0_25px_rgba(194,164,118,0.5)] -translate-y-1 scale-105'
                          : isFilled
                          ? 'bg-[#C2A476]/10 border border-[#C2A476]/60 shadow-sm'
                          : 'bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/[0.07]'
                      }`}
                    >
                      {/* Hidden Accessible Input for Native Keyboard on Desktop & Screen Readers */}
                      <input
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode={isMobile ? "none" : "numeric"}
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        disabled={isLocked || isLoading || isSuccess}
                        onChange={(e) => handleInputChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onFocus={(e) => {
                          setActiveIndex(idx);
                          if (isMobile) {
                            e.target.blur();
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full text-center"
                        autoComplete="off"
                      />

                      {/* Visual Content: Number / Bead / Cursor */}
                      {isFilled ? (
                        isMasked ? (
                          /* Masked Luxury Bead */
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-[#C2A476] to-[#FAF8F5] shadow-[0_0_12px_rgba(194,164,118,0.8)] animate-scale-up" />
                        ) : (
                          /* Crisp Gold Digit */
                          <span className="font-mono text-2xl sm:text-3xl font-black text-[#C2A476] filter drop-shadow-[0_2px_8px_rgba(194,164,118,0.4)] animate-scale-up">
                            {digit}
                          </span>
                        )
                      ) : isCurrentActive ? (
                        /* Pulsing Glassy Cursor */
                        <span className="w-0.5 h-6 sm:h-7 bg-[#C2A476] rounded-full animate-pulse shadow-[0_0_8px_#C2A476]" />
                      ) : (
                        /* Subtle Empty Dash */
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      )}

                      {/* Glass Sheen Top Reflection */}
                      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================
                TACTILE GLASSY NUMERIC KEYPAD (1-9, C, 0, BACKSPACE)
                ======================================================== */}
            <div className="pt-3 pb-1">
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[320px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => {
                  const isClear = key === 'CLEAR';
                  const isBack = key === 'BACK';

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isLocked || isLoading || isSuccess}
                      onClick={() => handleKeypadPress(key)}
                      className={`relative aspect-[16/11] rounded-2xl flex items-center justify-center font-mono font-bold transition-all duration-150 select-none cursor-pointer border ${
                        isLocked
                          ? 'bg-white/[0.01] border-white/5 text-neutral-600 cursor-not-allowed'
                          : isClear
                          ? 'bg-white/[0.03] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border-white/10 hover:border-rose-500/40 text-xs tracking-wider uppercase active:scale-95'
                          : isBack
                          ? 'bg-white/[0.03] hover:bg-amber-500/20 text-neutral-400 hover:text-amber-400 border-white/10 hover:border-amber-500/40 active:scale-95'
                          : 'bg-white/[0.04] hover:bg-[#C2A476]/20 text-white hover:text-[#C2A476] border-white/10 hover:border-[#C2A476]/50 shadow-sm text-lg sm:text-xl active:scale-95 active:bg-[#C2A476]/30'
                      }`}
                    >
                      {isClear ? (
                        <span className="font-sans font-bold flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </span>
                      ) : isBack ? (
                        <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <span>{key}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Session Indicator */}
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 px-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#C2A476]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phiên Làm Việc An Ninh</span>
              </div>
              <span className="text-[10px] text-neutral-500">
                Tự động thoát khi đóng tab
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-5">
              <button
                type="button"
                disabled={isLoading || isLocked || isSuccess}
                onClick={() => verifyPin(pin.join(''))}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  isLocked
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                    : isSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-[#C2A476] via-[#d4ba94] to-[#C2A476] bg-[length:200%_auto] hover:bg-right text-[#0E1114] hover:shadow-[0_0_30px_rgba(194,164,118,0.5)] hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#0E1114] border-t-transparent rounded-full animate-spin" />
                    <span>Đang xác thực an toàn...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Xác Thực Thành Công</span>
                  </div>
                ) : isLocked ? (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neutral-500" />
                    <span>Đang Khóa An Ninh ({lockoutSecondsLeft}s)</span>
                  </div>
                ) : (
                  <>
                    <span>Đăng Nhập Quản Trị Viên</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            {/* Bottom Security Footer */}
            <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-neutral-500">
              <Shield className="w-3 h-3 text-[#C2A476]" />
              <span>TLS 1.3 • Chống Brute-Force Exponential Backoff • PIN Glassy OTP</span>
            </div>
          </div>
        </div>
      </div>
  );
}
