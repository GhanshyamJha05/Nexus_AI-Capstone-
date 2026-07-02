"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

const registerSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50).regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and - allowed"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterValues) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      toast.success("Account created! Please sign in.");
      router.push("/auth/login");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg" />
            <span className="font-bold text-xl gradient-text">Nexus AI</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-text-primary">Create your account</h1>
          <p className="text-text-secondary text-sm mt-1">Start simulating decisions in minutes</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Full Name</label>
              <Input
                {...register("full_name")}
                placeholder="Jane Smith"
                icon={<User className="w-4 h-4" />}
                error={errors.full_name?.message}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Username</label>
              <Input
                {...register("username")}
                placeholder="janesmith"
                icon={<User className="w-4 h-4" />}
                error={errors.username?.message}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Email</label>
              <Input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Password</label>
              <Input
                {...register("password")}
                type="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                icon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full group mt-2" size="lg" loading={isLoading}>
              Create Account
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
