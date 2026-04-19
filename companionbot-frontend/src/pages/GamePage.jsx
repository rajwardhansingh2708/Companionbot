import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const activityContent = {
  "Breathing Exercise": {
    title: "Guided Breathing Exercise",
    description:
      "Follow the breathing rhythm below to slow your breath and reduce stress.",
    why:
      "Controlled breathing can reduce physical tension, slow racing thoughts, and help you regain calm.",
    use: "Best for stress, overload, and mental fatigue.",
    phaseMode: true,
  },
  "Grounding Activity": {
    title: "Grounding Activity",
    description:
      "Reconnect with the present moment using a simple 5-4-3-2-1 grounding method.",
    why:
      "Grounding helps bring your attention back to the present when sadness or loneliness becomes heavy.",
    use: "Best for sadness, loneliness, emotional heaviness, and feeling disconnected.",
    phaseMode: false,
  },
  "Calming Activity": {
    title: "Calming Activity",
    description:
      "Use this activity to settle anxious thoughts and bring your body back into a calmer rhythm.",
    why:
      "Gentle focus and breathing can help reduce anxiety and make your thoughts feel less overwhelming.",
    use: "Best for anxiety, nervousness, panic, or restlessness.",
    phaseMode: true,
  },
  "Focus Reset": {
    title: "Focus Reset",
    description:
      "Pause mental overload and gently return your attention to one thing at a time.",
    why:
      "A focus reset helps when stress scatters your attention and everything feels too much at once.",
    use: "Best for pressure, overthinking, and lack of focus.",
    phaseMode: false,
  },
  "Micro Break Routine": {
    title: "Micro Break Routine",
    description:
      "Take a short pause to reduce pressure and mentally recharge.",
    why:
      "Small breaks can reduce stress buildup and help you return with a clearer mind.",
    use: "Best for study stress, work pressure, and burnout feelings.",
    phaseMode: false,
  },
  "Journaling Prompt": {
    title: "Journaling Prompt",
    description:
      "Reflect through writing prompts to better understand what you are feeling.",
    why:
      "Writing can reduce emotional pressure and make difficult thoughts easier to process.",
    use: "Best for sadness, confusion, and emotional heaviness.",
    phaseMode: false,
  },
  "Comfort Reflection": {
    title: "Comfort Reflection",
    description:
      "Reflect on what makes you feel safe, supported, and grounded.",
    why:
      "Comfort reflection helps shift attention from pain toward safety and emotional reassurance.",
    use: "Best for loneliness, sadness, and emotional vulnerability.",
    phaseMode: false,
  },
  "Gratitude Reflection": {
    title: "Gratitude Reflection",
    description:
      "Pause and notice small positive moments, people, or experiences that matter to you.",
    why:
      "Gratitude reflection helps reinforce positive emotions and emotional balance.",
    use: "Best for positive mood and recovery.",
    phaseMode: false,
  },
  "Positive Journaling": {
    title: "Positive Journaling",
    description:
      "Write one good thing, one strength, and one hopeful thought from today.",
    why:
      "Positive journaling helps reinforce progress and self-awareness.",
    use: "Best for happy moments and recovery.",
    phaseMode: false,
  },
};

const groundingSteps = [
  "Name 5 things you can see around you.",
  "Name 4 things you can feel or touch.",
  "Name 3 things you can hear right now.",
  "Name 2 things you can smell.",
  "Name 1 thing you can focus on in this moment.",
];

const reflectionPrompts = {
  "Journaling Prompt": [
    "What are you feeling most strongly right now?",
    "What may have triggered this feeling today?",
    "What is one kind thing you can say to yourself?",
  ],
  "Comfort Reflection": [
    "What usually helps you feel safe or comforted?",
    "Who or what makes you feel supported?",
    "What is one small comforting thing you can do today?",
  ],
  "Gratitude Reflection": [
    "What is one small thing that went right today?",
    "Who are you thankful for right now?",
    "What is one positive moment you want to remember?",
  ],
  "Positive Journaling": [
    "What is one thing you handled well today?",
    "What strength did you show recently?",
    "What hopeful thought do you want to carry forward?",
  ],
  "Focus Reset": [
    "What is the one most important task right now?",
    "What can wait until later?",
    "What is one tiny next step you can do in 5 minutes?",
  ],
  "Micro Break Routine": [
    "What part of your body feels most tense right now?",
    "What small break would help you most at this moment?",
    "What is one thing you can return to later with a clearer mind?",
  ],
};

export default function GamePage() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState("Inhale");
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [activityType, setActivityType] = useState("Breathing Exercise");
  const [stepIndex, setStepIndex] = useState(0);
  const [stepAnswers, setStepAnswers] = useState({});

  useEffect(() => {
    const savedActivity = localStorage.getItem("suggestedActivity");
    if (savedActivity && activityContent[savedActivity]) {
      setActivityType(savedActivity);
    }
  }, []);

  useEffect(() => {
    setStepIndex(0);
    setStepAnswers({});
    setIsRunning(false);
    setSeconds(60);
    setPhase("Inhale");
  }, [activityType]);

  useEffect(() => {
    if (!activityContent[activityType]?.phaseMode) return;

    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, activityType]);

  useEffect(() => {
    if (!activityContent[activityType]?.phaseMode) return;

    let breathingInterval;
    if (isRunning) {
      breathingInterval = setInterval(() => {
        setPhase((prev) => {
          if (prev === "Inhale") return "Hold";
          if (prev === "Hold") return "Exhale";
          return "Inhale";
        });
      }, 4000);
    }

    return () => clearInterval(breathingInterval);
  }, [isRunning, activityType]);

  function handleStart() {
    setIsRunning(true);
  }

  function handleReset() {
    setIsRunning(false);
    setSeconds(60);
    setPhase("Inhale");
    setStepIndex(0);
    setStepAnswers({});
  }

  function handleNextStep() {
    const currentAnswer = stepAnswers[stepIndex]?.trim();
    if (!activityContent[activityType]?.phaseMode && !currentAnswer) return;

    const steps =
      activityType === "Grounding Activity"
        ? groundingSteps
        : reflectionPrompts[activityType] || [];

    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    }
  }

  function handleAnswerChange(value) {
    setStepAnswers((prev) => ({
      ...prev,
      [stepIndex]: value,
    }));
  }

  function handleReturnToChat() {
    navigate("/chat");
  }

  const currentActivity = activityContent[activityType];
  const currentSteps =
    activityType === "Grounding Activity"
      ? groundingSteps
      : reflectionPrompts[activityType] || [];

  const isComplete =
    !currentActivity.phaseMode && stepIndex === currentSteps.length - 1 && stepAnswers[stepIndex]?.trim();

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-gray-400">
              Calming Activity
            </p>
            <h1 className="mt-2 text-4xl font-semibold">
              {currentActivity.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
              {currentActivity.description}
            </p>
          </div>

          <button
            onClick={handleReturnToChat}
            className="rounded-full border border-[#2a2a2a] bg-[#151515] px-5 py-3 text-sm font-medium transition hover:bg-[#1d1d1d]"
          >
            Return to Chat
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2.5rem] border border-[#222222] bg-[#111111] p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.35)]">
            {currentActivity.phaseMode ? (
              <>
                <p className="text-sm uppercase tracking-[0.18em] text-gray-400">
                  Current Phase
                </p>

                <h2 className="mt-4 text-3xl font-semibold text-[#7cc9c3]">
                  {phase}
                </h2>

                <div className="mt-10 flex items-center justify-center">
                  <div
                    className={`flex h-52 w-52 items-center justify-center rounded-full text-xl font-semibold text-white transition-all duration-[4000ms] ${
                      phase === "Inhale"
                        ? "scale-110"
                        : phase === "Exhale"
                        ? "scale-90"
                        : "scale-100"
                    }`}
                    style={{
                      background:
                        "radial-gradient(circle, rgba(124,201,195,0.95) 0%, rgba(60,120,140,0.35) 70%, rgba(0,0,0,0) 100%)",
                      boxShadow: "0 0 60px rgba(124, 201, 195, 0.35)",
                    }}
                  >
                    {phase}
                  </div>
                </div>

                <p className="mt-10 text-lg text-gray-300">
                  Time Remaining: <span className="font-semibold text-white">{seconds}s</span>
                </p>

                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={handleStart}
                    className="rounded-full bg-[#7cc9c3] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Start
                  </button>

                  <button
                    onClick={handleReset}
                    className="rounded-full border border-[#2a2a2a] bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#202020]"
                  >
                    Restart Activity
                  </button>
                </div>
              </>
            ) : (
              <div className="text-left">
                <p className="text-sm uppercase tracking-[0.18em] text-gray-400">
                  {activityType === "Grounding Activity"
                    ? "Guided Grounding"
                    : "Reflection Activity"}
                </p>

                <div className="mt-6 rounded-2xl bg-[#171717] p-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                    Step {stepIndex + 1} of {currentSteps.length}
                  </p>
                  <p className="mt-4 text-lg leading-8 text-gray-200">
                    {currentSteps[stepIndex]}
                  </p>

                  <textarea
                    value={stepAnswers[stepIndex] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Write your response here..."
                    className="mt-5 min-h-[120px] w-full rounded-2xl border border-[#2a2a2a] bg-[#111111] p-4 text-sm text-white outline-none"
                  />
                </div>

                <div className="mt-8 flex justify-center gap-4">
                  {isComplete ? (
                    <div className="rounded-full bg-[#173231] px-6 py-3 text-sm font-semibold text-[#7cc9c3]">
                      Activity Complete
                    </div>
                  ) : (
                    <button
                      onClick={handleNextStep}
                      disabled={!stepAnswers[stepIndex]?.trim()}
                      className="rounded-full bg-[#7cc9c3] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next Step
                    </button>
                  )}

                  <button
                    onClick={handleReset}
                    className="rounded-full border border-[#2a2a2a] bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#202020]"
                  >
                    Restart Activity
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-[#222222] bg-[#111111] p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-400">
                Why This Helps
              </p>
              <p className="mt-4 text-sm leading-7 text-gray-300">
                {currentActivity.why}
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#222222] bg-[#111111] p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-400">
                Suggested Use
              </p>
              <p className="mt-4 text-sm leading-7 text-gray-300">
                {currentActivity.use}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
