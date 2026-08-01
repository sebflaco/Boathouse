import { signOut } from "@/app/actions";
import type { Role } from "@/lib/domain";

export function TopBar({ name, role }: { name: string; role: Role }) {
  return (
    <div className="sticky top-0 z-20 border-b-2 border-brass bg-carmine text-ivory">
      <div className="mx-auto flex max-w-wrap items-center gap-[14px] px-4 py-3">
        <span className="font-display text-[17px] font-bold uppercase tracking-wordmark">
          Boat<span className="text-brass">house</span>
        </span>
        <span className="flex-1" />
        <span className="text-[13.5px]">{name}</span>
        <span className="roletag">{role}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="btn btn-sm border-white/35 bg-transparent text-ivory hover:border-white"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
