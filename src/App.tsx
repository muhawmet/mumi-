import { AnimatePresence, motion } from "framer-motion";
import { useStudioStore } from "./store/useStudioStore";
import { AppLayout } from "./components/Layout/AppLayout";
import { DashboardStep } from "./pages/Dashboard/DashboardStep";
import { RecipeStep } from "./pages/Recipe/RecipeStep";
import { TimelineStep } from "./pages/Timeline/TimelineStep";

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function App() {
  const currentStep = useStudioStore((state) => state.currentStep);

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        {currentStep === "dashboard" && (
          <motion.div
            key="dashboard"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <DashboardStep />
          </motion.div>
        )}
        {currentStep === "recipe" && (
          <motion.div
            key="recipe"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <RecipeStep />
          </motion.div>
        )}
        {currentStep === "timeline" && (
          <motion.div
            key="timeline"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <TimelineStep />
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

export default App;
