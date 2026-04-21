"use client";

import Auth from "@/components/Auth";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      const mockSession = localStorage.getItem('mock-session');
      
      if (supabaseSession || mockSession) {
        setLoading(false);
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    };

    checkExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    // Handle mock login event
    const handleMockLogin = () => {
      router.push("/dashboard");
    };
    window.addEventListener('mock-login', handleMockLogin);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('mock-login', handleMockLogin);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  return <Auth />;
}
