import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudioStore } from './store/useStudioStore';
import { AppLayout } from './components/Layout/AppLayout';

const DashboardStep = lazy(() =>
  import('./pages/Dashboard/DashboardStep').then((module) => ({ default: module.DashboardStep })),
);
const RecipeStep = lazy(() =>
  import('./pages/Recipe/RecipeStep').then((module) => ({ default: module.RecipeStep })),
);
const TimelineStep = lazy(() =>
  import('./pages/Timeline/TimelineStep').then((module) => ({ default: module.TimelineStep })),
);

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function App() {
  const currentStep = useStudioStore((state) => state.currentStep);
  const advance = useStudioStore((state) => state.advance);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key === 'Enter') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance]);

  return (
    <AppLayout>
      <Suspense fallback={<div style={{ color: 'var(--text-muted)', padding: 24 }}>Yükleniyor…</div>}>
        <AnimatePresence mode="wait">
          {currentStep === 'dashboard' && (
            <motion.div key="dashboard" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <DashboardStep />
            </motion.div>
          )}
          {currentStep === 'recipe' && (
            <motion.div key="recipe" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <RecipeStep />
            </motion.div>
          )}
          {currentStep === 'timeline' && (
            <motion.div key="timeline" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <TimelineStep />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
    </AppLayout>
  );
}

export default App;
