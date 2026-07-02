import { createRoot } from "react-dom/client";
import { Router, Switch, Route, useLocation } from "wouter";
import { AnimatePresence, motion } from "motion/react";
import App from "./App";
import GetDemoPage from "./pages/GetDemoPage";
import "./index.css";

const pageVariants = {
  initial: { opacity: 0, scale: 0.97, filter: "blur(14px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: "blur(14px)",
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

function AnimatedRoutes() {
  const [location] = useLocation();
  const routeKey = location === "/demo" ? "demo" : "home";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Switch>
          <Route path="/demo" component={GetDemoPage} />
          <Route component={App} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")!).render(
  <Router>
    <AnimatedRoutes />
  </Router>
);
