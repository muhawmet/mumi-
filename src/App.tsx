import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStudioStore } from './store/useStudioStore';
import { AppLayout } from './components/Layout/AppLayout';

const DashboardStep = lazy(() =>
  import('./pages/Dashboard/DashboardStep').then((module) => ({ default: module.DashboardStep })),
);
const DirectorStep = lazy(() =>
  import('./pages/Director/DirectorStep').then((module) => ({ default: module.DirectorStep })),
);
const RecipeStep = lazy(() =>
  import('./pages/Recipe/RecipeStep').then((module) => ({ default: module.RecipeStep })),
);
const ScenesStep = lazy(() =>
  import('./pages/Scenes/ScenesStep').then((module) => ({ default: module.ScenesStep })),
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
  const generateScenes = useStudioStore((state) => state.generateScenes);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key === 'Enter') {
        e.preventDefault();
        if (currentStep === 'timeline') generateScenes();
        else advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance, currentStep, generateScenes]);

  return (
    <AppLayout>
      <Suspense fallback={<div style={{ color: 'var(--text-muted)', padding: 24 }}>Yükleniyor…</div>}>
        <AnimatePresence mode="wait">
          {currentStep === 'dashboard' && (
            <motion.div key="dashboard" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <DashboardStep />
            </motion.div>
          )}
          {currentStep === 'director' && (
            <motion.div key="director" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <DirectorStep />
            </motion.div>
          )}
          {currentStep === 'recipe' && (
            <motion.div key="recipe" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <RecipeStep />
            </motion.div>
          )}
          {currentStep === 'scenes' && (
            <motion.div key="scenes" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <ScenesStep />
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
