import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FakeExerciseMonitoringDemo } from "./posture/demo/FakeExerciseMonitoringDemo";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <FakeExerciseMonitoringDemo />
  </StrictMode>,
);
