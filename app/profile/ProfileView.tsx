"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { SankalpaBlock } from "@/components/SankalpaBlock";
import { saveProfile, useProfile } from "@/lib/profile";

export function ProfileView() {
  const [profile, loaded] = useProfile();
  const [saved, setSaved] = useState(false);
  return (
    <main>
      <div className="container">
        <h1>My details</h1>
        <p className="lede">
          A pandit begins every rite with your sankalpa — your name, gotra and father&apos;s name, the place and the exact time.
          Enter them once and Brahman writes your Sanskrit sankalpa into every puja, hawan and path, and names your ancestors in tarpan.
        </p>
        {loaded && (
          <div className="card">
            <ProfileForm key={profile ? "edit" : "new"} initial={profile} onSaved={() => setSaved(true)} />
          </div>
        )}
        {saved && <p className="good">✓ Saved. Here is today&apos;s sankalpa for your daily puja:</p>}
        {profile && (
          <section className="section">
            <h2>Today&apos;s sankalpa</h2>
            <SankalpaBlock ritualId="daily-puja" />
            <p style={{ marginTop: 16 }}>
              <button type="button" className="chip" onClick={() => saveProfile(null)}>Delete my details from this device</button>
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
