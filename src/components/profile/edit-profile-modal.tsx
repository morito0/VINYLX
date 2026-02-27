"use client";

import { useState, useCallback, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  updateProfileDetails,
  type UpdateDetailsInput,
} from "@/lib/actions/profiles";
import { GENRES, COUNTRIES } from "@/lib/constants";

interface EditProfileModalProps {
  profile: {
    country: string | null;
    birth_date: string | null;
    favorite_genres: string[];
    display_name: string | null;
    bio: string | null;
  };
}

export function EditProfileModal({ profile }: EditProfileModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [country, setCountry] = useState(profile.country ?? "");
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    profile.favorite_genres ?? []
  );

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length < 5
          ? [...prev, genre]
          : prev
    );
  }, []);

  function resetForm() {
    setCountry(profile.country ?? "");
    setBirthDate(profile.birth_date ?? "");
    setDisplayName(profile.display_name ?? "");
    setBio(profile.bio ?? "");
    setSelectedGenres(profile.favorite_genres ?? []);
  }

  function handleSave() {
    const payload: UpdateDetailsInput = {
      country,
      birth_date: birthDate || null,
      favorite_genres: selectedGenres,
      display_name: displayName,
      bio,
    };

    startTransition(async () => {
      const result = await updateProfileDetails(payload);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Perfil actualizado");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetForm();
      }}
    >
      <Dialog.Trigger asChild>
        <button className="inline-flex h-9 items-center rounded-lg border border-white/10 px-4 text-sm font-medium text-muted transition-all hover:border-muted/50 hover:text-foreground active:scale-95">
          Editar perfil
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/5 bg-slate-950 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="font-mono text-lg font-bold tracking-tight">
              Editar perfil
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-foreground active:scale-95">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <fieldset className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nombre para mostrar
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-white/5 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-orange"
              />
            </fieldset>

            <fieldset className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Cuéntale al mundo quién eres..."
                className="w-full resize-none rounded-xl border border-white/5 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-accent-orange"
              />
            </fieldset>

            <fieldset className="space-y-2">
              <label className="text-sm font-medium text-foreground">País</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent-orange"
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
            </fieldset>

            <fieldset className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-white/5 bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent-orange [color-scheme:dark]"
              />
            </fieldset>

            <fieldset className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Géneros favoritos
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
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
              <p className="text-xs text-muted">{selectedGenres.length}/5 seleccionados</p>
            </fieldset>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                disabled={isPending}
                className="rounded-full border border-white/5 px-5 py-2.5 text-sm font-medium text-muted transition-all hover:border-muted active:scale-95 disabled:opacity-40"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={isPending || !country}
              className="rounded-full bg-accent-orange px-6 py-2.5 text-sm font-semibold text-background transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
