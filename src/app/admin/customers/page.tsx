"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface CustomerRow {
  id: string;
  last_name: string;
  first_name: string;
  phone: string;
  email: string;
  created_at: string;
  dogs: { name: string; breed: string }[];
  reservations: { id: string }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("customers")
      .select(`
        id, last_name, first_name, phone, email, created_at,
        dogs(name, breed),
        reservations(id)
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    setCustomers((data as unknown as CustomerRow[]) || []);
    setLoading(false);
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      `${c.last_name}${c.first_name}`.includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.dogs.some((d) => d.name.includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* 検索 */}
      <div className="relative">
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          inputMode="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="名前・電話番号・犬の名前で検索"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-[#B87942] focus:outline-none"
        />
      </div>

      {/* 件数 */}
      <p className="text-xs text-gray-400">
        {filtered.length}件の顧客
      </p>

      {/* 顧客リスト */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-400">
          {search ? "該当する顧客が見つかりません" : "顧客データがまだありません"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-sm">
                  {c.last_name} {c.first_name}
                </p>
                <span className="text-xs text-gray-400 font-dm">
                  {c.reservations.length}回利用
                </span>
              </div>
              <p className="text-xs text-gray-500">
                <a href={`tel:${c.phone}`} className="text-[#B87942]">
                  {c.phone}
                </a>
              </p>
              {c.dogs.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.dogs.map((dog, i) => (
                    <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                      {dog.name}（{dog.breed}）
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
