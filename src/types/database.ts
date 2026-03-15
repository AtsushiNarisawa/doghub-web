export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          phone: string;
          email: string;
          last_name: string;
          first_name: string;
          last_name_kana: string;
          first_name_kana: string;
          postal_code: string | null;
          address: string | null;
          source: "web" | "line" | "phone" | "walk_in";
          line_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          email: string;
          last_name: string;
          first_name: string;
          last_name_kana: string;
          first_name_kana: string;
          postal_code?: string | null;
          address?: string | null;
          source?: "web" | "line" | "phone" | "walk_in";
          line_id?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      dogs: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          breed: string;
          weight: number;
          age: number | null;
          birth_date: string | null;
          sex: "male" | "female";
          neutered: boolean;
          rabies_vaccine_expires_at: string | null;
          mixed_vaccine_expires_at: string | null;
          allergies: string | null;
          meal_notes: string | null;
          medication_notes: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          name: string;
          breed: string;
          weight: number;
          age?: number | null;
          birth_date?: string | null;
          sex: "male" | "female";
          neutered?: boolean;
          rabies_vaccine_expires_at?: string | null;
          mixed_vaccine_expires_at?: string | null;
          allergies?: string | null;
          meal_notes?: string | null;
          medication_notes?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["dogs"]["Insert"]>;
      };
      reservations: {
        Row: {
          id: string;
          customer_id: string;
          plan: "spot" | "4h" | "8h" | "stay";
          date: string;
          checkin_time: string;
          checkout_date: string | null;
          status: "confirmed" | "pending" | "cancelled" | "completed";
          total_price: number | null;
          extra_hours_fee: number;
          walk_option: boolean;
          destination: string | null;
          early_morning: boolean;
          referral_source: string | null;
          notes: string | null;
          admin_notes: string | null;
          source: "web" | "line" | "phone" | "walk_in";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          plan: "spot" | "4h" | "8h" | "stay";
          date: string;
          checkin_time: string;
          checkout_date?: string | null;
          status?: "confirmed" | "pending" | "cancelled" | "completed";
          total_price?: number | null;
          extra_hours_fee?: number;
          walk_option?: boolean;
          destination?: string | null;
          early_morning?: boolean;
          referral_source?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          source?: "web" | "line" | "phone" | "walk_in";
        };
        Update: Partial<Database["public"]["Tables"]["reservations"]["Insert"]>;
      };
      reservation_dogs: {
        Row: {
          id: string;
          reservation_id: string;
          dog_id: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          dog_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["reservation_dogs"]["Insert"]>;
      };
      daily_capacity: {
        Row: {
          date: string;
          stay_limit: number;
          day_limit: number;
          stay_booked: number;
          day_booked: number;
          closed: boolean;
          note: string | null;
          updated_at: string;
        };
        Insert: {
          date: string;
          stay_limit?: number;
          day_limit?: number;
          stay_booked?: number;
          day_booked?: number;
          closed?: boolean;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["daily_capacity"]["Insert"]>;
      };
    };
  };
};
