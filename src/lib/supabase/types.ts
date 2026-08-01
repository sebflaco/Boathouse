/**
 * Hand-written Database types mirroring supabase/migrations.
 * Regenerate with `supabase gen types typescript` once the CLI is set up.
 */
export type Role = "athlete" | "coach";
export type Sport =
  | "rowing"
  | "erging"
  | "strength"
  | "core"
  | "cycling"
  | "indoor_bike"
  | "alternative"
  | "other";
export type BoatClass = "1x" | "2x" | "2-" | "4x" | "4-" | "4+" | "8+";
export type EventType = "race" | "social" | "other";
export type AvailSlot = "M" | "A" | "E";
export type AvailStatus = "available" | "busy";

type Timestamps = { created_at: string };
type Rel = [];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: { id: string; name: string } & Timestamps;
        Insert: { id?: string; name: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
        Relationships: Rel;
      };
      profiles: {
        Row: { id: string; name: string; role: Role; team_id: string | null } & Timestamps;
        Insert: { id: string; name: string; role?: Role; team_id?: string | null; created_at?: string };
        Update: { id?: string; name?: string; role?: Role; team_id?: string | null };
        Relationships: Rel;
      };
      sessions: {
        Row: {
          id: string;
          date: string;
          team_id: string;
          sport: Sport;
          title: string;
          duration_min: number;
          planned_rpe: number;
          notes: string | null;
          planned_load: number;
        } & Timestamps;
        Insert: {
          id?: string;
          date: string;
          team_id: string;
          sport?: Sport;
          title?: string;
          duration_min?: number;
          planned_rpe?: number;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: Rel;
      };
      strength_exercises: {
        Row: {
          id: string;
          session_id: string;
          position: number;
          name: string;
          sets: number | null;
          reps: number | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          position?: number;
          name?: string;
          sets?: number | null;
          reps?: number | null;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["strength_exercises"]["Insert"]>;
        Relationships: Rel;
      };
      erg_targets: {
        Row: { session_id: string; athlete_id: string; target_text: string };
        Insert: { session_id: string; athlete_id: string; target_text?: string };
        Update: Partial<{ session_id: string; athlete_id: string; target_text: string }>;
        Relationships: Rel;
      };
      boat_setups: {
        Row: { id: string; session_id: string; boat_class: BoatClass; boat_name: string | null; oars: string | null };
        Insert: { id?: string; session_id: string; boat_class: BoatClass; boat_name?: string | null; oars?: string | null };
        Update: Partial<Database["public"]["Tables"]["boat_setups"]["Insert"]>;
        Relationships: Rel;
      };
      boat_seats: {
        Row: { boat_setup_id: string; seat_label: string; athlete_id: string | null };
        Insert: { boat_setup_id: string; seat_label: string; athlete_id?: string | null };
        Update: Partial<{ boat_setup_id: string; seat_label: string; athlete_id: string | null }>;
        Relationships: Rel;
      };
      wellness: {
        Row: {
          id: string;
          athlete_id: string;
          date: string;
          physical: number | null;
          mental: number | null;
          stress: number | null;
          soreness: number | null;
          sleep_hours: number | null;
          comment: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          athlete_id: string;
          date: string;
          physical?: number | null;
          mental?: number | null;
          stress?: number | null;
          soreness?: number | null;
          sleep_hours?: number | null;
          comment?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["wellness"]["Insert"]>;
        Relationships: Rel;
      };
      feedback: {
        Row: {
          id: string;
          session_id: string;
          athlete_id: string;
          actual_duration_min: number | null;
          actual_rpe: number | null;
          comment: string | null;
          actual_load: number;
        } & Timestamps;
        Insert: {
          id?: string;
          session_id: string;
          athlete_id: string;
          actual_duration_min?: number | null;
          actual_rpe?: number | null;
          comment?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["feedback"]["Insert"]>;
        Relationships: Rel;
      };
      strength_actuals: {
        Row: { feedback_id: string; exercise_id: string; weight_kg: number | null; note: string | null };
        Insert: { feedback_id: string; exercise_id: string; weight_kg?: number | null; note?: string | null };
        Update: Partial<{ feedback_id: string; exercise_id: string; weight_kg: number | null; note: string | null }>;
        Relationships: Rel;
      };
      events: {
        Row: { id: string; date: string; title: string; type: EventType; team_id: string | null; notes: string | null } & Timestamps;
        Insert: { id?: string; date: string; title: string; type?: EventType; team_id?: string | null; notes?: string | null };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: Rel;
      };
      availability: {
        Row: { user_id: string; date: string; slot: AvailSlot; status: AvailStatus };
        Insert: { user_id: string; date: string; slot: AvailSlot; status: AvailStatus };
        Update: Partial<{ user_id: string; date: string; slot: AvailSlot; status: AvailStatus }>;
        Relationships: Rel;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_coach: { Args: Record<string, never>; Returns: boolean };
      my_team_id: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: {
      user_role: Role;
      sport: Sport;
      boat_class: BoatClass;
      event_type: EventType;
      avail_slot: AvailSlot;
      avail_status: AvailStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
