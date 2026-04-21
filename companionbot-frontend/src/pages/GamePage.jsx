import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const activityContent = {
  "Breathing Exercise": {
    title: "Guided Breathing Exercise",
    description: "Slow your breath and relax your body.",
    phaseMode: true,
  },
  "Calming Activity": {
    title: "Calming Activity",
    description: "Ease your mind and settle anxious thoughts.",
    phaseMode: true,
  },
  "Grounding Activity": {
    title: "Grounding Activity",
    description: "Reconnect with the present moment.",
    phaseMode: false,
  },
  "Focus Reset": {
    title: "Focus Reset",
    description: "Step back from overload and focus on one manageable thing.",
    phaseMode: false,
  },
  "Micro Break Routine": {
    title: "Micro Break Routine",
    description: "Take a short guided pause to reset your mind and body.",
    phaseMode: false,
  },
  "Comfort Reflection": {
    title: "Comfort Reflection",
    description: "Reflect on what makes you feel supported and safe.",
    phaseMode: false,
  },
  "Journaling Prompt": {
    title: "Journaling Prompt",
    description: "Write through your feelings with small reflective prompts.",
    phaseMode: false,
  },
  "Gratitude Reflection": {
    title: "Gratitude Reflection",
    description: "Notice the people and moments you appreciate right now.",
    phaseMode: false,
  },
  "Positive Journaling": {
    title: "Positive Journaling",
    description: "Capture strengths, progress, and hopeful thoughts from today.",
    phaseMode: false,
  },
};

const groundingSteps = [
  { prompt: "Name 5 things you can see around you.", count: 5 },
  { prompt: "Name 4 things you can feel or touch.", count: 4 },
  { prompt: "Name 3 things you can hear right now.", count: 3 },
  { prompt: "Name 2 things you can smell.", count: 2 },
  { prompt: "Name 1 thing you can focus on in this moment.", count: 1 },
];

const reflectionSteps = {
  "Focus Reset": [
    "What is the one task that matters most right now?",
    "What is one smaller first step you can do next?",
    "What is one thing you can ignore until later?",
  ],
  "Micro Break Routine": [
    "Where does your body feel the most tension right now?",
    "What small break would help you most in this moment?",
    "What is one thing you can return to later with a clearer mind?",
  ],
  "Comfort Reflection": [
    "What place, memory, or person feels comforting to you?",
    "What usually helps you feel safer or more grounded?",
    "What is one small comfort you can give yourself today?",
  ],
  "Journaling Prompt": [
    "What are you feeling most strongly right now?",
    "What may have triggered this feeling today?",
    "What is one kind sentence you want to tell yourself?",
  ],
  "Gratitude Reflection": [
    "What is one small thing that went right today?",
    "Who is one person you are thankful for?",
    "What is one moment you want to remember?",
  ],
  "Positive Journaling": [
    "What is one thing you handled well today?",
    "What strength did you show recently?",
    "What is one hopeful thought for tomorrow?",
  ],
};

const resultMessages = {
  "Grounding Activity": {
    title: "You grounded yourself successfully",
    text: "You just guided your attention away from racing thoughts and back into the present moment. Even a small grounding exercise can reduce emotional intensity and help you feel steadier.",
  },
  "Focus Reset": {
    title: "Your thoughts are more organized now",
    text: "You’ve taken something overwhelming and broken it into smaller pieces. That can make the next step feel lighter and more manageable.",
  },
  "Micro Break Routine": {
    title: "You gave your mind a short recovery space",
    text: "Even a brief pause can reduce stress buildup and help your body soften. Small resets like this can make a big difference over time.",
  },
  "Comfort Reflection": {
    title: "You reconnected with sources of comfort",
    text: "You reminded yourself that support, safety, and comfort still exist around you. That can be especially helpful on emotionally heavy days.",
  },
  "Journaling Prompt": {
    title: "You gave your feelings some structure",
    text: "Writing things out helps turn emotional pressure into something clearer and easier to understand. That is a meaningful step forward.",
  },
  "Gratitude Reflection": {
    title: "You strengthened your positive awareness",
    text: "By noticing small good things, you helped your mind hold onto balance instead of only stress or sadness.",
  },
  "Positive Journaling": {
    title: "You recognized your progress",
    text: "You took a moment to notice strength and hope in yourself. That kind of reflection can build confidence over time.",
  },
  "Breathing Exercise": {
    title: "Your breathing slowed your body down",
    text: "Steady breathing can calm physical tension and help your mind feel less rushed. Even one minute can help create space.",
  },
  "Calming Activity": {
    title: "You gave your mind a calmer rhythm",
    text: "Slowing down like this can help anxious energy settle and make things feel a little more manageable.",
  },
};

export default function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activityType, setActivityType] = useState("Breathing Exercise");
  const [phase, setPhase] = useState("Inhale");
  const [seconds, setSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const incomingType = location.state?.type;
    const savedType = localStorage.getItem("suggestedActivity");

    if (incomingType && activityContent[incomingType]) {
      setActivityType(incomingType);
    } else if (savedType && activityContent[savedType]) {
      setActivityType(savedType);
    }
  }, [location]);

  useEffect(() => {
    setPhase("Inhale");
    setSeconds(60);
    setIsRunning(false);
    setStepIndex(0);
    setResponses({});
    setShowResult(false);
  }, [activityType]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const phaseInterval = setInterval(() => {
      setPhase((prev) =>
        prev === "Inhale" ? "Hold" : prev === "Hold" ? "Exhale" : "Inhale"
      );
    }, 4000);

    return () => clearInterval(phaseInterval);
  }, [isRunning]);

  function resetActivity() {
    setIsRunning(false);
    setSeconds(60);
    setPhase("Inhale");
    setStepIndex(0);
    setResponses({});
    setShowResult(false);
  }

  function handleResponseChange(value) {
    setResponses((prev) => ({
      ...prev,
      [stepIndex]: value,
    }));
  }

  function countValidItems(text) {
    return text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0).length;
  }

  function nextStep() {
    if (stepIndex < stepList.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  }

  const isGrounding = activityType === "Grounding Activity";

  const stepList = isGrounding
    ? groundingSteps
    : (reflectionSteps[activityType] || []).map((item) => ({ prompt: item }));

  const currentStep = stepList[stepIndex];
  const currentResponse = responses[stepIndex] || "";

  const canProceed = isGrounding
    ? countValidItems(currentResponse) >= currentStep.count
    : currentResponse.trim().length > 0;

  const result = resultMessages[activityType] || {
    title: "You completed the activity",
    text: "You took a few minutes to support yourself, and that matters. Small supportive actions can help create steadiness over time.",
  };

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#7cc9c3]">
              {activityContent[activityType].title}
            </h1>
            <p className="mt-2 text-gray-400">
              {activityContent[activityType].description}
            </p>
          </div>

          <button
            onClick={() => navigate("/chat")}
            className="rounded-lg border border-gray-700 bg-[#1a1a1a] px-4 py-2"
          >
            Back
          </button>
        </div>

        <div className="rounded-3xl bg-[#111] p-10 shadow-xl">
          {showResult ? (
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-semibold text-[#7cc9c3]">
                {result.title}
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                {result.text}
              </p>

              {!activityContent[activityType].phaseMode ? (
                <div className="mt-8 rounded-2xl bg-[#181818] p-6 text-left">
                  <p className="mb-3 text-sm uppercase tracking-[0.18em] text-gray-400">
                    Your reflections
                  </p>
                  <div className="space-y-4">
                    {Object.entries(responses).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-gray-500">
                          Step {Number(key) + 1}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-gray-200">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={resetActivity}
                  className="rounded-full bg-[#7cc9c3] px-5 py-2 text-black"
                >
                  Do Again
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="rounded-full border border-gray-700 px-5 py-2"
                >
                  Return to Chat
                </button>
              </div>
            </div>
          ) : activityContent[activityType].phaseMode ? (
            <div className="text-center">
              <h2 className="text-xl text-gray-400">Current Phase</h2>

              <div className="mt-8 flex justify-center">
                <div
                  className={`flex h-52 w-52 items-center justify-center rounded-full text-xl font-semibold transition-all duration-[4000ms] ${
                    phase === "Inhale"
                      ? "scale-110"
                      : phase === "Exhale"
                        ? "scale-90"
                        : "scale-100"
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(124,201,195,0.9) 0%, rgba(0,0,0,0) 70%)",
                  }}
                >
                  {phase}
                </div>
              </div>

              <p className="mt-8 text-lg">
                Time: <span className="text-[#7cc9c3]">{seconds}s</span>
              </p>

              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => setIsRunning(true)}
                  className="rounded-full bg-[#7cc9c3] px-5 py-2 text-black"
                >
                  Start
                </button>

                <button
                  onClick={resetActivity}
                  className="rounded-full border border-gray-700 px-5 py-2"
                >
                  Reset
                </button>
              </div>

              <p className="mt-6 text-sm text-gray-400">
                Follow the circle. Inhale, hold, and exhale slowly.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <h2 className="text-xl text-gray-400">
                  Step {stepIndex + 1} of {stepList.length}
                </h2>
                <p className="mt-6 text-xl">{currentStep.prompt}</p>
                {isGrounding ? (
                  <p className="mt-3 text-sm text-gray-500">
                    Write each item on a new line. You need at least {currentStep.count}.
                  </p>
                ) : null}
              </div>

              <div className="mt-8">
                <textarea
                  value={currentResponse}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  placeholder={
                    isGrounding
                      ? "Write one item per line..."
                      : "Write your response here..."
                  }
                  className="min-h-[160px] w-full rounded-2xl border border-[#2a2a2a] bg-[#181818] p-4 text-white outline-none placeholder:text-gray-500"
                />
              </div>

              {isGrounding ? (
                <p className="mt-3 text-sm text-gray-400">
                  You entered {countValidItems(currentResponse)} of {currentStep.count} required items.
                </p>
              ) : null}

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="rounded-full bg-[#7cc9c3] px-5 py-2 text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {stepIndex === stepList.length - 1 ? "Finish" : "Next"}
                </button>

                <button
                  onClick={resetActivity}
                  className="rounded-full border border-gray-700 px-5 py-2"
                >
                  Restart
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-400">
                {Object.keys(responses).length > 0
                  ? `Completed ${Object.keys(responses).length} of ${stepList.length} steps`
                  : "Start by writing your response."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
