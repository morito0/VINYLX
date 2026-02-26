"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import {
  updateProfile,
  type ProfileFormState,
} from "@/lib/actions/profiles";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/lib/supabase/helpers";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfile, { error: null, success: false });

  useEffect(() => {
    if (state.success) toast.success("Perfil actualizado correctamente");
    if (state.error) toast.error(state.error);
  }, [state]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  const avatarSrc = preview ?? profile.avatar_url;

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative shrink-0"
        >
          <Avatar className="h-20 w-20">
            {avatarSrc && (
              <AvatarImage src={avatarSrc} alt={profile.username} />
            )}
            <AvatarFallback className="text-2xl">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5 text-white" />
          </div>
        </button>
        <div className="text-sm text-muted">
          <p>JPG, PNG o WebP. Máximo 2MB.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={profile.username}
          required
          minLength={3}
          maxLength={30}
          pattern="^[a-zA-Z0-9_]+$"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="display_name" className="text-sm font-medium">
          Nombre para mostrar
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name ?? ""}
          maxLength={50}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ""}
          maxLength={500}
          placeholder="Cuéntale al mundo quién eres..."
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-accent-orange px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
