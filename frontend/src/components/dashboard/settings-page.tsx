"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Key, User, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { userAtom } from "@/lib/atoms";
import { usersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const profileSchema = z.object({
  full_name: z.string().min(1).max(255),
});

const apiKeySchema = z.object({
  gemini_api_key: z.string().min(10, "API key seems too short"),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password required"),
  new_password: z.string().min(8).regex(/[A-Z]/, "Must include uppercase").regex(/[0-9]/, "Must include number"),
});

type ProfileValues = z.infer<typeof profileSchema>;
type ApiKeyValues = z.infer<typeof apiKeySchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const [user, setUser] = useAtom(userAtom);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name || "" },
  });

  const apiKeyForm = useForm<ApiKeyValues>({ resolver: zodResolver(apiKeySchema) });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const handleUpdateProfile = async (data: ProfileValues) => {
    setLoadingProfile(true);
    try {
      const resp = await usersApi.updateProfile(data);
      setUser(resp.data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateApiKey = async (data: ApiKeyValues) => {
    setLoadingApiKey(true);
    try {
      await usersApi.updateApiKeys(data);
      toast.success("API key saved");
      apiKeyForm.reset();
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setLoadingApiKey(false);
    }
  };

  const handleChangePassword = async (data: PasswordValues) => {
    setLoadingPassword(true);
    try {
      await usersApi.changePassword(data);
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Failed to change password");
    } finally {
      setLoadingPassword(false);
    }
  };

  const sections = [
    {
      id: "profile",
      title: "Profile",
      icon: User,
      content: (
        <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Email</label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Username</label>
            <Input value={user?.username || ""} disabled className="opacity-60" />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Full Name</label>
            <Input
              {...profileForm.register("full_name")}
              error={profileForm.formState.errors.full_name?.message}
            />
          </div>
          <Button type="submit" size="sm" loading={loadingProfile}>
            <Save className="w-4 h-4" /> Save Profile
          </Button>
        </form>
      ),
    },
    {
      id: "api-keys",
      title: "API Keys",
      icon: Key,
      content: (
        <form onSubmit={apiKeyForm.handleSubmit(handleUpdateApiKey)} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">
              Gemini API Key
              <span className="text-text-muted ml-2 text-xs">(optional — uses system key if not set)</span>
            </label>
            <Input
              {...apiKeyForm.register("gemini_api_key")}
              type="password"
              placeholder="AIza..."
              icon={<Key className="w-4 h-4" />}
              error={apiKeyForm.formState.errors.gemini_api_key?.message}
            />
          </div>
          <p className="text-xs text-text-muted">
            Your API key is stored encrypted. Using your own key increases rate limits and privacy.
          </p>
          <Button type="submit" size="sm" loading={loadingApiKey}>
            <Save className="w-4 h-4" /> Save API Key
          </Button>
        </form>
      ),
    },
    {
      id: "security",
      title: "Security",
      icon: Lock,
      content: (
        <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Current Password</label>
            <Input
              {...passwordForm.register("current_password")}
              type="password"
              error={passwordForm.formState.errors.current_password?.message}
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">New Password</label>
            <Input
              {...passwordForm.register("new_password")}
              type="password"
              error={passwordForm.formState.errors.new_password?.message}
            />
          </div>
          <Button type="submit" size="sm" loading={loadingPassword}>
            <Lock className="w-4 h-4" /> Change Password
          </Button>
        </form>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Settings</h2>
        <p className="text-text-secondary text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {sections.map((section, i) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <section.icon className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-text-primary">{section.title}</h3>
          </div>
          {section.content}
        </motion.div>
      ))}
    </div>
  );
}
