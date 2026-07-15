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
const QAStep = lazy(() =>
  import('./pages/QA/QAStep').then((module) => ({ default: module.QAStep })),
);

/* Cross-fade: çıkan içerik kaymadan solar (popLayout onu akıştan çıkarır),
   gelen içerik hafif yükselerek gelir — stage geçişinde cam asla boş kalmaz. */
const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
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
      {/* Suspense her adımın İÇİNDE: yalnız gelen adım suspend eder,
          çıkan adım cross-fade boyunca ekranda yaşar (1sn boş cam yasağı). */}
      <AnimatePresence mode="popLayout">
        {currentStep === 'dashboard' && (
          <motion.div key="dashboard" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28 }}>
            <Suspense fallback={null}><DashboardStep /></Suspense>
          </motion.div>
        )}
        {currentStep === 'director' && (
          <motion.div key="director" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28 }}>
            <Suspense fallback={null}><DirectorStep /></Suspense>
          </motion.div>
        )}
        {currentStep === 'recipe' && (
          <motion.div key="recipe" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28 }}>
            <Suspense fallback={null}><RecipeStep /></Suspense>
          </motion.div>
        )}
        {currentStep === 'scenes' && (
          <motion.div key="scenes" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28 }}>
            <Suspense fallback={null}><ScenesStep /></Suspense>
          </motion.div>
        )}
        {currentStep === 'timeline' && (
          <motion.div key="timeline" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28 }}>
            <Suspense fallback={null}><TimelineStep /></Suspense>
          </motion.div>
        )}
        {currentStep === 'qa' && (
          <motion.div key="qa" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28 }}>
            <Suspense fallback={null}><QAStep /></Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

export default App;
