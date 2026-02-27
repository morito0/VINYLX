"use client";

import { useState, useCallback } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { useRouter } from "next/navigation";
import { GENRES, COUNTRIES } from "@/lib/constants";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
};

interface OnboardingWizardProps {
  userId: string;
  username: string;
}

export function OnboardingWizard({ userId, username }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPending, setIsPending] = useState(false);

  const [country, setCountry] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const next = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const back = useCallback(() => {
    setDirection(-1);
    setStep((s) => s - 1);
  }, []);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length < 5
          ? [...prev, genre]
          : prev
    );
  }, []);

  const handleFinish = async () => {
    setIsPending(true);
    const result = await completeOnboarding({
      userId,
      country,
      birth_date: birthDate,
      favorite_genres: selectedGenres,
    });

    if (result.error) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }

    toast.success("¡Bienvenido a VinylX!");
    router.refresh();
  };

  const canProceedStep1 = country.length > 0;
  const canProceedStep2 = birthDate.length > 0;

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Progress indicator */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step
                    ? "w-10 bg-accent-orange"
                    : "w-6 bg-white/10"
                }`}
              />
            ))}
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 0 && (
                <StepWrapper key="step-0" direction={direction}>
                  <h1 className="mb-2 text-center font-mono text-3xl font-bold tracking-tighter">
                    ¡Hola, <span className="text-accent-orange">{username}</span>!
                  </h1>
                  <p className="mb-8 text-center text-muted">
                    Antes de empezar, cuéntanos un poco sobre ti para personalizar
                    tu experiencia.
                  </p>

                  <label className="mb-2 block text-sm font-medium text-foreground">
                    ¿De dónde eres?
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-accent-orange"
                  >
                    <option value="" disabled>
                      Selecciona tu país
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={next}
                      disabled={!canProceedStep1}
                      className="rounded-full bg-accent-orange px-8 py-3 text-sm font-semibold text-background transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                    >
                      Siguiente
                    </button>
                  </div>
                </StepWrapper>
              )}

              {step === 1 && (
                <StepWrapper key="step-1" direction={direction}>
                  <h2 className="mb-2 text-center font-mono text-2xl font-bold tracking-tighter">
                    ¿Cuándo naciste?
                  </h2>
                  <p className="mb-8 text-center text-sm text-muted">
                    Esto nos ayuda a mostrarte tendencias generacionales.
                  </p>

                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-white/5 bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-accent-orange [color-scheme:dark]"
                  />

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={back}
                      className="rounded-full border border-white/5 px-6 py-3 text-sm font-semibold text-muted transition-all hover:border-muted active:scale-95"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={next}
                      disabled={!canProceedStep2}
                      className="rounded-full bg-accent-orange px-8 py-3 text-sm font-semibold text-background transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                    >
                      Siguiente
                    </button>
                  </div>
                </StepWrapper>
              )}

              {step === 2 && (
                <StepWrapper key="step-2" direction={direction}>
                  <h2 className="mb-2 text-center font-mono text-2xl font-bold tracking-tighter">
                    Tus géneros favoritos
                  </h2>
                  <p className="mb-6 text-center text-sm text-muted">
                    Elige hasta 5 géneros que definan tu gusto.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    {GENRES.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                            isSelected
                              ? "border-accent-orange bg-accent-orange/15 text-accent-orange"
                              : "border-white/5 bg-card text-muted hover:border-white/20 hover:text-foreground"
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-center text-xs text-muted">
                    {selectedGenres.length}/5 seleccionados
                  </p>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={back}
                      disabled={isPending}
                      className="rounded-full border border-white/5 px-6 py-3 text-sm font-semibold text-muted transition-all hover:border-muted active:scale-95 disabled:opacity-40"
                    >
                      Atrás
                    </button>
                    <div className="flex gap-3">
                      {selectedGenres.length === 0 && (
                        <button
                          onClick={handleFinish}
                          disabled={isPending}
                          className="rounded-full border border-white/5 px-6 py-3 text-sm font-semibold text-muted transition-all hover:border-muted active:scale-95 disabled:opacity-40"
                        >
                          {isPending ? "Guardando..." : "Omitir"}
                        </button>
                      )}
                      {selectedGenres.length > 0 && (
                        <button
                          onClick={handleFinish}
                          disabled={isPending}
                          className="rounded-full bg-accent-orange px-8 py-3 text-sm font-semibold text-background transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
                        >
                          {isPending ? "Guardando..." : "Comenzar"}
                        </button>
                      )}
                    </div>
                  </div>
                </StepWrapper>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}

function StepWrapper({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: number;
}) {
  return (
    <m.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
