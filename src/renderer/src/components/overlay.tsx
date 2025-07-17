import type { RecordingState } from '@renderer/types';
import { AnimatePresence, motion } from 'motion/react';

export function Overlay({ status }: { status: RecordingState }) {
  const variants = {
    idle: {
      width: 60,
      height: 10,
      opacity: 0.65,
      backgroundColor: '#000000',
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)'
    },
    recording: {
      width: 100,
      height: 25,
      opacity: 1,
      backgroundColor: '#dc2626',
      boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.15)'
    },
    processing: {
      width: 100,
      height: 25,
      opacity: 1,
      backgroundColor: '#7829ff',
      boxShadow: '0 0 0 0 rgba(124, 58, 237, 0)'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const dotVariants = {
    hidden: {
      y: 0
    },
    show: {
      y: [-1.3, 1.3, -1.3],
      transition: {
        duration: 0.9,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <div className="pointer-events-none flex h-screen w-screen items-end justify-center pb-1">
      <div className="relative">
        {/* Main rectangle */}
        <motion.div
          className="pointer-events-auto flex h-8 cursor-pointer items-center justify-center rounded-full outline outline-white"
          variants={variants}
          animate={status}
          initial="idle"
          transition={{
            duration: 0.4,
            ease: 'easeInOut'
          }}
          whileHover={{ scale: 1.05 }}
        >
          {/* Icons and indicators */}
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              ></motion.div>
            )}

            {status === 'processing' && (
              <motion.div
                key="processing-icon"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="flex items-center space-x-2"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div key={index} className="h-1.5 w-1.5 rounded-full bg-white" variants={dotVariants} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
