import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListenlistButton } from "@/components/album/listenlist-button";

interface AlbumActionsProps {
  albumId: string;
  mbid: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
}

export function AlbumActions({
  albumId,
  mbid,
  initialSaved,
  isAuthenticated,
}: AlbumActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="accent" asChild>
        <Link href={`/log/new?album=${albumId}&mbid=${mbid}`}>
          Registrar escucha
        </Link>
      </Button>
      {isAuthenticated && (
        <ListenlistButton albumId={albumId} initialSaved={initialSaved} />
      )}
    </div>
  );
}
