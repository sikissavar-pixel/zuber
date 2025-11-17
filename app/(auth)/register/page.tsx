"use client";
import React, { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import Navbar from "../../../components/Navbar";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";
import { getErrorMessage } from "../../../lib/utils";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("driver");
  const { register } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!email || !email.includes("@")) { toast.error("Invalid email"); return; }
      if (!password || password.length < 6) { toast.error("Password too short"); return; }
      await register(name, email, password, role as any);
      toast.success("Registered. Please login.");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--gold)] mb-6">Register</h1>
        <form onSubmit={onSubmit} className="card space-y-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div>
            <label className="text-sm text-[var(--gold)]">Role</label>
            <select
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="driver">Driver</option>
              <option value="partner">Partner</option>
            </select>
          </div>
          <Button type="submit">Create Account</Button>
        </form>
      </main>
    </div>
  );
}