import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { texts } from "./config/invitation";
import { Backdrop } from "./components/Backdrop";
import { DeclineScreen } from "./components/DeclineScreen";
import { EnvelopeScreen } from "./components/EnvelopeScreen";
import { InvitationScreen } from "./components/InvitationScreen";
import { SuccessScreen } from "./components/SuccessScreen";
import { TransitionScreen } from "./components/TransitionScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";

type Screen = "welcome" | "declined" | "transition" | "envelope" | "success";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  // Защита от повторных нажатий, пока идёт смена экранов
  const transitioning = useRef(false);

  useEffect(() => {
    document.title = texts.pageTitle;
  }, []);

  const go = useCallback((next: Screen) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setScreen(next);
  }, []);

  const handleExitComplete = useCallback(() => {
    transitioning.current = false;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Backdrop />
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        {screen === "welcome" && (
          <WelcomeScreen key="welcome" onYes={() => go("transition")} onDecline={() => go("declined")} />
        )}
        {screen === "declined" && <DeclineScreen key="declined" />}
        {screen === "transition" && <TransitionScreen key="transition" onOpen={() => go("envelope")} />}
        {screen === "envelope" && (
          <EnvelopeScreen
            key="envelope"
            renderLetter={(revealed) => (
              <InvitationScreen revealed={revealed} onSuccess={() => go("success")} />
            )}
          />
        )}
        {screen === "success" && <SuccessScreen key="success" />}
      </AnimatePresence>
    </MotionConfig>
  );
}
