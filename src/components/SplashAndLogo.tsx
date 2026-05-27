import { motion } from "motion/react";

export function FlashDropLogo({ size = 64 }: { size?: number }) {
  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer pulsing ring in Material Emerald / Indigo gradient */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-indigo-600 opacity-20 blur-sm"
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Middle squircle shape representing container state */}
      <div 
        className="absolute inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 shadow-lg flex items-center justify-center p-0.5"
      >
        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden relative">
          {/* Internal gradient flow */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-emerald-500/10" />
          
          {/* Lightning flash icon symbolizing rapid drops with zero quality loss */}
          <svg
            className="w-1/2 h-1/2 text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6h-2V5H5v14h6v2zm10-7l-1.5 5.5H23V21h-5l1.5-6H17V11h6L21 14zM10.5 7H7v2h3.5l-1.5 5.5h2.5V16L15 10H11.5l1.5-3H10.5z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      id="splash-screen"
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center select-none z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* High-tech subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <div className="flex flex-col items-center z-10 max-w-sm px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <FlashDropLogo size={120} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 font-sans"
        >
          FlashDrop Lite
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-slate-400 mt-2 text-sm font-sans"
        >
          High-Speed Zero Loss File Sharing
        </motion.p>

        {/* Loading progress bubble */}
        <div className="w-48 h-1.5 bg-slate-900 rounded-full mt-10 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-xs text-slate-500 font-mono mt-4"
        >
          WiFi Direct &middot; WebRTC Sec &middot; Android first
        </motion.p>
      </div>
    </motion.div>
  );
}
