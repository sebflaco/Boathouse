import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { InviteForm } from "@/components/InviteForm";
import type { Role } from "@/lib/domain";
import type { Team } from "@/lib/supabase/types";

const ATHLETE_TABS = ["This week", "Schedule", "Availability"];
const COACH_TABS = ["Program", "Season", "Planner", "Athletes", "Squad", "Events"];

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, team_id")
    .eq("id", user.id)
    .maybeSingle();

  // Authenticated but no profile row yet — invite metadata missing / trigger.
  if (!profile) {
    return (
      <>
        <TopBar name={user.email ?? "Account"} role="athlete" />
        <div className="wrap">
          <div className="card">
            <h3 className="card-title">Account not set up</h3>
            <p className="text-muted">
              Your login works, but your profile hasn&apos;t been linked to a team yet. Ask your
              coach to finish setting up your account.
            </p>
          </div>
        </div>
      </>
    );
  }

  const role = profile.role as Role;
  const tabs = role === "coach" ? COACH_TABS : ATHLETE_TABS;

  let teams: Team[] = [];
  if (role === "coach") {
    const { data } = await supabase.from("teams").select("*").order("name");
    teams = data ?? [];
  }

  return (
    <>
      <TopBar name={profile.name} role={role} />
      <div className="wrap">
        <div className="mb-[18px] mt-4 flex flex-wrap gap-[2px] border-b border-hairline">
          {tabs.map((label, i) => (
            <span
              key={label}
              className={`-mb-px border-b-2 px-[13px] py-[9px] font-display text-[11.5px] font-semibold uppercase tracking-head ${
                i === 0 ? "border-brass text-carmine" : "border-transparent text-muted"
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="card">
          <h3 className="card-title">Welcome aboard, {profile.name.split(" ")[0]}</h3>
          <p className="text-muted">
            You&apos;re signed in as a <b>{role}</b>. The skeleton is deployed and authentication,
            teams and Row Level Security are live.
          </p>
          <p className="mt-3 text-muted">
            {role === "coach"
              ? "The program builder, season view, planner and dashboards arrive in the next milestones."
              : "Your daily check-in, schedule, session logging and availability arrive in the next milestone."}
          </p>
        </div>

        {role === "coach" && <InviteForm teams={teams} />}
      </div>
    </>
  );
}
