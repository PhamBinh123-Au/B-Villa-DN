'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  Delete,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Lock,
  Cpu,
  Fingerprint,
  Check,
} from 'lucide-react';
import { adminUsers } from '@/lib/mock-data';
import { markSpaSessionActive } from '@/lib/spaAuthSession';

// ==================== SECURITY & ANIMATION CONSTANTS ====================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_STORAGE_KEY = 'bvilla_security_lockout_v2';
const PIN_LENGTH = 6;
const DEMO_VALID_PIN = '200928';
const DEMO_INVALID_PIN = '123456';

// Exponential Backoff Lockout Duration
const getLockoutDurationSeconds = (lockoutCount: number): number => {
  if (lockoutCount <= 1) return 30;
  if (lockoutCount === 2) return 60;
  if (lockoutCount === 3) return 120;
  if (lockoutCount === 4) return 300;
  return 900;
};

type AuthPhase = 'idle' | 'collapsing' | 'orbiting' | 'success' | 'error';

export default function GlassyLoginPage() {
  const router = useRouter();

  // Glassy OTP State
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Signature Settigation Animation Phase
  const [authPhase, setAuthPhase] = useState<AuthPhase>('idle');

  // Security & Lockout states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCount, setLockoutCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  const [totalLockoutDuration, setTotalLockoutDuration] = useState(30);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  // Detect mobile / touch devices
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
      // Ignore storage errors
    }
  }, []);

  // Countdown timer effect for lockout
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
          } catch {}

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

  // Focus the first input on desktop mount
  useEffect(() => {
    if (isMobile) return;
    if (!isLocked && authPhase === 'idle') {
      inputRefs.current[0]?.focus();
    }
  }, [authPhase, isLocked, isMobile]);

  // Execute PIN Verification with Settigation Cinematic Flow
  const verifyPin = useCallback(
    async (pinCode: string, isSimulatedDemo: boolean = false, forceSuccess: boolean = false) => {
      if (isLocked) {
        setErrorMessage(
          `Hệ thống đang tạm khóa an ninh. Vui lòng chờ ${lockoutSecondsLeft}s trước khi thử lại.`
        );
        return;
      }

      if (pinCode.length < PIN_LENGTH) {
        setErrorMessage(`Vui lòng nhập đủ ${PIN_LENGTH} chữ số của mã PIN bảo mật.`);
        return;
      }

      setErrorMessage('');

      // ==========================================
      // PHASE 1: Collapse into glowing glass beads
      // ==========================================
      setAuthPhase('collapsing');

      // Wait 350ms for collapse animation to finish, then start orbital spin
      await new Promise((res) => setTimeout(res, 350));

      // ==========================================
      // PHASE 2: Orbital Spiral & Security Scanner
      // ==========================================
      setAuthPhase('orbiting');

      // Enforce a minimum orbital scan duration so the user experiences the gorgeous animation
      const minScanTime = new Promise((res) => setTimeout(res, 1400));

      let serverResult: { ok: boolean; status?: number; data?: any } = { ok: false };

      if (isSimulatedDemo) {
        await minScanTime;
        serverResult = {
          ok: forceSuccess,
          status: forceSuccess ? 200 : 401,
          data: forceSuccess
            ? { success: true, message: 'Đăng nhập thành công (Demo Mode)' }
            : { success: false, message: 'Mã PIN demo không chính xác.' },
        };
      } else {
        const fetchPromise = (async () => {
          try {
            const res = await fetch('/api/admin/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pin: pinCode }),
            });
            const data = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, data };
          } catch (err) {
            return { ok: false, status: 500, data: { message: 'Lỗi kết nối máy chủ.' } };
          }
        })();

        const [result] = await Promise.all([fetchPromise, minScanTime]);
        serverResult = result;
      }

      // ==========================================
      // PHASE 3: Success or Error Reaction
      // ==========================================
      if (serverResult.ok) {
        // === SUCCESS STATE ===
        setAuthPhase('success');

        try {
          localStorage.removeItem(LOCKOUT_STORAGE_KEY);
        } catch {}

        markSpaSessionActive();
        const userIdx = serverResult.data?.user?.userIndex ?? 0;
        const user = adminUsers[userIdx] || adminUsers[0];

        if (typeof window !== 'undefined') {
          const authPayload = {
            user,
            authenticatedAt: Date.now(),
          };
          sessionStorage.setItem('bvilla_admin_session', JSON.stringify(authPayload));
          localStorage.removeItem('bvilla_auth');
        }

        // Smooth transition into admin dashboard
        setTimeout(() => {
          let target = '/admin';
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectParam = urlParams.get('redirect');
            if (
              redirectParam &&
              redirectParam.startsWith('/admin') &&
              !redirectParam.startsWith('/admin/login')
            ) {
              target = redirectParam;
            }
          }
          router.replace(target);
        }, 1300);
      } else {
        // === ERROR STATE ===
        setAuthPhase('error');

        if (!isSimulatedDemo) {
          if (serverResult.status === 429) {
            const waitSec = serverResult.data?.lockoutSecondsLeft || 60;
            setIsLocked(true);
            setLockoutSecondsLeft(waitSec);
            setTotalLockoutDuration(waitSec);
            setErrorMessage(
              serverResult.data?.message || 'CẢNH BÁO BẢO MẬT: Quá nhiều lần thử sai. Tạm khóa đăng nhập.'
            );
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
                `CẢNH BÁO: Nhập sai mã PIN quá ${MAX_FAILED_ATTEMPTS} lần! Hệ thống tạm thời khóa ${durationSec} giây.`
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
                serverResult.data?.message ||
                  `Mã PIN không chính xác! Bạn còn ${remaining}/${MAX_FAILED_ATTEMPTS} lần thử.`
              );
            }
          }
        } else {
          setErrorMessage('Mã PIN không chính xác! (Chế độ mô phỏng thử nghiệm lỗi)');
        }

        // Allow error shake to play, then restore idle input state
        setTimeout(() => {
          setPin(Array(PIN_LENGTH).fill(''));
          setActiveIndex(0);
          setAuthPhase('idle');
          if (!isLocked && !isMobile) {
            inputRefs.current[0]?.focus();
          }
        }, 750);
      }
    },
    [failedAttempts, isLocked, lockoutCount, lockoutSecondsLeft, router, isMobile]
  );

  // Handle single digit input
  const handleInputChange = (idx: number, value: string) => {
    if (isLocked || authPhase !== 'idle') return;

    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    if (!cleanDigit) return;

    const newPin = [...pin];
    newPin[idx] = cleanDigit;
    setPin(newPin);

    if (idx < PIN_LENGTH - 1) {
      setActiveIndex(idx + 1);
      inputRefs.current[idx + 1]?.focus();
    } else {
      const fullPin = newPin.join('');
      if (fullPin.length === PIN_LENGTH) {
        verifyPin(fullPin);
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLocked || authPhase !== 'idle') return;

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

  // Handle Clipboard Paste
  const handlePaste = (e: React.ClipboardEvent) => {
    if (isLocked || authPhase !== 'idle') return;
    e.preventDefault();

    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;

    const newPin = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newPin[i] = pasted[i];
    }
    setPin(newPin);

    const nextIdx = Math.min(pasted.length, PIN_LENGTH - 1);
    setActiveIndex(nextIdx);
    if (!isMobile) {
      inputRefs.current[nextIdx]?.focus();
    }

    if (pasted.length === PIN_LENGTH) {
      verifyPin(pasted);
    }
  };

  // Tactile Glass Numeric Keypad Click
  const handleKeypadPress = (val: string) => {
    if (isLocked || authPhase !== 'idle') return;

    if (val === 'CLEAR') {
      setPin(Array(PIN_LENGTH).fill(''));
      setActiveIndex(0);
      if (!isMobile) inputRefs.current[0]?.focus();
      return;
    }

    if (val === 'BACK') {
      const lastFilled = pin.reduce((acc, curr, i) => (curr !== '' ? i : acc), -1);
      if (lastFilled >= 0) {
        const newPin = [...pin];
        newPin[lastFilled] = '';
        setPin(newPin);
        setActiveIndex(lastFilled);
        if (!isMobile) inputRefs.current[lastFilled]?.focus();
      }
      return;
    }

    // Number 0-9
    const firstEmpty = pin.findIndex((d) => d === '');
    const targetIdx = firstEmpty !== -1 ? firstEmpty : activeIndex;

    if (targetIdx >= 0 && targetIdx < PIN_LENGTH) {
      const newPin = [...pin];
      newPin[targetIdx] = val;
      setPin(newPin);

      if (targetIdx < PIN_LENGTH - 1) {
        setActiveIndex(targetIdx + 1);
        if (!isMobile) inputRefs.current[targetIdx + 1]?.focus();
      } else {
        const fullPin = newPin.join('');
        if (fullPin.length === PIN_LENGTH) {
          verifyPin(fullPin);
        }
      }
    }
  };

  // Trigger Demo Automation
  const runDemoScenario = async (isCorrect: boolean) => {
    if (isLocked || isDemoRunning || authPhase !== 'idle') return;
    setIsDemoRunning(true);
    setErrorMessage('');
    const demoCode = isCorrect ? DEMO_VALID_PIN : DEMO_INVALID_PIN;

    // Simulate human typing with 70ms interval
    const tempPin = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < PIN_LENGTH; i++) {
      tempPin[i] = demoCode[i];
      setPin([...tempPin]);
      setActiveIndex(i);
      await new Promise((r) => setTimeout(r, 65));
    }

    setIsDemoRunning(false);
    verifyPin(demoCode, true, isCorrect);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-[#08090D] text-white relative overflow-hidden select-none">
      {/* ========================================================
          1. MYSTICAL COSMIC BACKGROUND & FLOATING GRADIENT ORBS
          ======================================================== */}
      {/* Dynamic Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating Ambient Mesh Orb 1 (Neon Violet #8B5CF6) */}
      <motion.div
        animate={{
          x: [0, 80, -50, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-1/5 w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-[#8B5CF6]/45 to-[#6366F1]/30 blur-[110px] pointer-events-none"
      />

      {/* Floating Ambient Mesh Orb 2 (Cyan / Turquoise #06B6D4) */}
      <motion.div
        animate={{
          x: [0, -90, 60, 0],
          y: [0, 70, -40, 0],
          scale: [1.1, 0.95, 1.2, 1.1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-br from-[#06B6D4]/40 to-[#0EA5E9]/25 blur-[120px] pointer-events-none"
      />

      {/* Floating Ambient Mesh Orb 3 (Hot Magenta / Rose #EC4899) */}
      <motion.div
        animate={{
          x: [0, 60, -70, 0],
          y: [0, 50, -60, 0],
          scale: [0.9, 1.15, 0.95, 0.9],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 right-1/3 w-[320px] h-[320px] rounded-full bg-gradient-to-r from-[#EC4899]/35 to-[#F43F5E]/20 blur-[100px] pointer-events-none"
      />

      {/* Subtle Star Sparkles Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.06),transparent_70%)] pointer-events-none" />

      {/* ========================================================
          2. THE MAIN GLASS CARD (GLASSMORPHISM WITH SETTIGATION VIBE)
          ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: authPhase === 'error' ? [-12, 12, -10, 10, -5, 5, 0] : 0,
        }}
        transition={{
          duration: authPhase === 'error' ? 0.65 : 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full max-w-md relative z-10 my-auto"
      >
        {/* Outer Frosted Glass Card Container */}
        <div
          className={`backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 relative overflow-hidden transition-all duration-500 ${
            authPhase === 'error'
              ? 'bg-rose-950/30 border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.35)]'
              : authPhase === 'success'
              ? 'bg-emerald-950/30 border-2 border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.35)]'
              : 'bg-white/[0.04] sm:bg-slate-900/45 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)_inset]'
          }`}
        >
          {/* Shimmer Light Sweeping Ray across border */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1,
            }}
            className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none opacity-85"
          />

          {/* Top Brand & Verification Header */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* Holographic Logo Emblem */}
            <div className="relative mb-3 group cursor-pointer">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#C2A476] via-[#06B6D4] to-[#8B5CF6] p-[1.5px] shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-[#0D1117] rounded-[14.5px] flex items-center justify-center p-2.5 overflow-hidden">
                  <Image
                    src="/images/logo.png"
                    alt="B Villa Da Nang Logo"
                    width={40}
                    height={40}
                    priority
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]"
                  />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[10px] text-cyan-300">
                <Sparkles className="w-3 h-3 text-cyan-300" />
              </span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] tracking-[0.28em] uppercase font-bold text-[#C2A476]">
                B VILLA DA NANG
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-cyan-400">
                SECURITY HUB
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Xác Thực Bảo Mật</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-medium">
                2FA
              </span>
            </h2>

            <p className="text-xs text-neutral-400 font-light mt-1.5 max-w-xs leading-relaxed">
              Vui lòng nhập mã PIN / OTP bảo mật để truy cập bảng điều khiển quản trị.
            </p>
          </div>

          {/* ACTIVE LOCKOUT NOTIFICATION (Brute-Force Shield) */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-red-600/25 via-red-500/15 to-amber-500/20 border border-red-500/40 text-red-300 space-y-2.5 backdrop-blur-md shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/25 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                    HỆ THỐNG ĐÃ KHÓA BẢO VỆ
                  </h4>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Nhập sai quá {MAX_FAILED_ATTEMPTS} lần (Lần phạt #{lockoutCount}). Tạm dừng mọi
                    thao tác xác thực.
                  </p>
                </div>
              </div>

              {/* Countdown Visual Timer */}
              <div className="bg-black/50 rounded-xl p-2 border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-red-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-xs font-medium text-neutral-300">Mở khóa sau:</span>
                </div>
                <span className="text-xs font-bold font-mono text-red-400 bg-red-500/20 px-2 py-0.5 rounded-lg border border-red-500/40">
                  {String(Math.floor(lockoutSecondsLeft / 60)).padStart(2, '0')}:
                  {String(lockoutSecondsLeft % 60).padStart(2, '0')}s
                </span>
              </div>

              {/* Lockout Progress Bar */}
              <div className="w-full h-1 bg-red-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${Math.max(0, (lockoutSecondsLeft / totalLockoutDuration) * 100)}%`,
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* ERROR MESSAGE NOTIFICATION */}
          {!isLocked && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {errorMessage}
                {failedAttempts > 0 && (
                  <span className="block mt-0.5 text-[11px] text-amber-400 font-semibold">
                    Lần thử sai: {failedAttempts} / {MAX_FAILED_ATTEMPTS}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================================
              3. SETTIGATION SIGNATURE DYNAMIC ANIMATION STAGE
              ======================================================== */}
          <div className="relative min-h-[120px] flex items-center justify-center my-2">
            <AnimatePresence mode="wait">
              {/* STAGE A: IDLE INPUT CELLS (6 GLASSY BOXES) */}
              {authPhase === 'idle' && (
                <motion.div
                  key="idle-cells"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 px-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Nhập mã 6 chữ số</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsMasked(!isMasked)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
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

                  {/* 6 Glassy Input Cells */}
                  <div
                    onPaste={handlePaste}
                    className="grid grid-cols-6 gap-2 sm:gap-3 py-1"
                  >
                    {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
                      const digit = pin[idx];
                      const isCurrentActive = activeIndex === idx && !isLocked;
                      const isFilled = Boolean(digit);

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!isLocked && authPhase === 'idle') {
                              setActiveIndex(idx);
                              if (!isMobile) inputRefs.current[idx]?.focus();
                            }
                          }}
                          className={`relative w-full aspect-[4/5] sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer select-none overflow-hidden ${
                            isLocked
                              ? 'bg-white/[0.02] border border-white/5 opacity-40 cursor-not-allowed'
                              : isCurrentActive
                              ? 'bg-cyan-500/15 border-2 border-cyan-400 ring-4 ring-cyan-500/25 shadow-[0_0_25px_rgba(6,182,212,0.5)] -translate-y-1 scale-105'
                              : isFilled
                              ? 'bg-white/[0.08] border border-cyan-400/50 shadow-sm'
                              : 'bg-white/[0.04] border border-white/15 hover:border-white/30 hover:bg-white/[0.07]'
                          }`}
                        >
                          {/* Accessible Hidden Input for Native Keyboard */}
                          <input
                            ref={(el) => {
                              inputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode={isMobile ? 'none' : 'numeric'}
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            disabled={isLocked || authPhase !== 'idle'}
                            onChange={(e) => handleInputChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            onFocus={(e) => {
                              setActiveIndex(idx);
                              if (isMobile) e.target.blur();
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full text-center"
                            autoComplete="off"
                          />

                          {/* Visual Content: Digit / Glow Dot / Blinking Cursor */}
                          {isFilled ? (
                            isMasked ? (
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-[#FAF8F5] shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-scale-up" />
                            ) : (
                              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)] animate-scale-up">
                                {digit}
                              </span>
                            )
                          ) : isCurrentActive ? (
                            <span className="w-0.5 h-6 sm:h-7 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#06B6D4]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          )}

                          {/* Top Glass Highlight */}
                          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STAGE B: COLLAPSING -> ORBITAL SPIRAL VERIFICATION SCANNER */}
              {(authPhase === 'collapsing' || authPhase === 'orbiting') && (
                <motion.div
                  key="orbital-scanner"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="flex flex-col items-center justify-center py-4"
                >
                  {/* Central Security Orbit Arena */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* Pulsing Concentric Radar Rings */}
                    <motion.div
                      animate={{
                        scale: [1, 1.8, 2.4],
                        opacity: [0.8, 0.3, 0],
                      }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                      className="absolute w-20 h-20 rounded-full border border-cyan-400/40 pointer-events-none"
                    />

                    <motion.div
                      animate={{
                        scale: [0.8, 1.5, 2],
                        opacity: [0.7, 0.25, 0],
                      }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: 0.5,
                      }}
                      className="absolute w-20 h-20 rounded-full border border-purple-500/40 pointer-events-none"
                    />

                    {/* Central Glowing Cryptographic Core */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#06B6D4]/30 via-slate-900 to-[#8B5CF6]/30 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        className="text-cyan-400"
                      >
                        <Cpu className="w-8 h-8" />
                      </motion.div>
                    </div>

                    {/* 6 Glass Beads Orbiting Around Core in Perfect Spiral Geometry */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: authPhase === 'orbiting' ? 1.2 : 0.8,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
                        const angle = (idx * 360) / PIN_LENGTH;
                        const rad = (angle * Math.PI) / 180;
                        const radius = 54; // Orbit radius in pixels
                        const x = Math.cos(rad) * radius;
                        const y = Math.sin(rad) * radius;

                        return (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-300 to-purple-400 shadow-[0_0_16px_#06B6D4] ring-2 ring-white/60"
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                          />
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Dynamic Status Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center"
                  >
                    <p className="text-xs font-semibold text-cyan-300 tracking-wider flex items-center justify-center gap-1.5 uppercase font-mono">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Đang giải mã token xác thực...</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                      Hệ thống đang kiểm tra chữ ký điện tử quản trị viên
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* STAGE C: SUCCESS BURST & ANIMATED SVG CHECKMARK */}
              {authPhase === 'success' && (
                <motion.div
                  key="success-burst"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center justify-center py-4 text-center"
                >
                  {/* Glowing Emerald Checkmark Halo */}
                  <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                    {/* Outward Particle Ripple */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.9 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full bg-emerald-400/30 border border-emerald-400"
                    />

                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/25 via-emerald-600/30 to-teal-400/20 border-2 border-emerald-400 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.7)]">
                      {/* Animated SVG Path Checkmark */}
                      <svg
                        className="w-10 h-10 text-emerald-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-emerald-300 tracking-tight">
                    Xác Thực Thành Công!
                  </h3>
                  <p className="text-xs text-emerald-200/80 mt-1 max-w-xs font-light">
                    Quyền truy cập quản trị viên hợp lệ. Đang chuyển hướng vào Dashboard...
                  </p>
                </motion.div>
              )}

              {/* STAGE D: ERROR SHAKE & RECOVERY */}
              {authPhase === 'error' && (
                <motion.div
                  key="error-state"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.6)] mb-2 animate-bounce">
                    <ShieldAlert className="w-8 h-8 text-rose-400" />
                  </div>
                  <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                    Xác Thực Thất Bại
                  </h4>
                  <p className="text-xs text-rose-300/80 mt-0.5">
                    Mã xác thực không hợp lệ. Đang khôi phục ô nhập...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ========================================================
              4. TACTILE GLASS NUMERIC KEYPAD (1-9, C, 0, BACK)
              ======================================================== */}
          {authPhase === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="pt-2 pb-1"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[310px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => {
                  const isClear = key === 'CLEAR';
                  const isBack = key === 'BACK';

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={isLocked || authPhase !== 'idle'}
                      onClick={() => handleKeypadPress(key)}
                      className={`relative aspect-[16/11] rounded-2xl flex items-center justify-center font-mono font-bold transition-all duration-150 select-none cursor-pointer border ${
                        isLocked
                          ? 'bg-white/[0.01] border-white/5 text-neutral-600 cursor-not-allowed'
                          : isClear
                          ? 'bg-white/[0.03] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border-white/10 hover:border-rose-500/40 text-xs tracking-wider uppercase active:scale-95'
                          : isBack
                          ? 'bg-white/[0.03] hover:bg-amber-500/20 text-neutral-400 hover:text-amber-400 border-white/10 hover:border-amber-500/40 active:scale-95'
                          : 'bg-white/[0.04] hover:bg-cyan-500/20 text-white hover:text-cyan-300 border-white/10 hover:border-cyan-500/40 shadow-sm text-lg sm:text-xl active:scale-95 active:bg-cyan-500/30'
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
            </motion.div>
          )}

          {/* Footer Security Badges */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 px-1">
            <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mã Hóa 256-bit AES</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
              <span>SSL/TLS Verified</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. DEMO SIMULATION TOGGLE PILLS (REQUIREMENT #4)
            ======================================================== */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
            🧪 Demo hiệu ứng:
          </span>

          <div className="flex items-center gap-2">
            {/* Demo Success Button */}
            <button
              type="button"
              disabled={isLocked || isDemoRunning || authPhase !== 'idle'}
              onClick={() => runDemoScenario(true)}
              className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Mã Đúng (Thành Công)</span>
            </button>

            {/* Demo Error Button */}
            <button
              type="button"
              disabled={isLocked || isDemoRunning || authPhase !== 'idle'}
              onClick={() => runDemoScenario(false)}
              className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-400 text-rose-300 text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Mã Sai (Báo Lỗi)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
