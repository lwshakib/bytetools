"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Lock, 
  Shield, 
  Trash2, 
  Smartphone, 
  Monitor,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Account Settings page providing management for profile details, 
 * security credentials, and active sessions.
 */
export default function AccountPage() {
  const [name, setName] = useState("Professor");
  const [email, setEmail] = useState("professor@bytetools.com");

  const sessions = [
    { id: 1, device: "MacBook Pro", browser: "Chrome", location: "Dhaka, Bangladesh", status: "Active now", icon: Monitor },
    { id: 2, device: "iPhone 15", browser: "Safari", location: "Dhaka, Bangladesh", status: "2 days ago", icon: Smartphone },
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile information updated successfully.");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password updated successfully.");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background/50">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and set your email preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 space-y-1">
            <Button variant="ghost" className="w-full justify-start font-medium text-primary bg-primary/5">
              <User className="w-4 h-4 mr-2" /> Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">
              <Lock className="w-4 h-4 mr-2" /> Security
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-muted-foreground hover:text-foreground">
              <Shield className="w-4 h-4 mr-2" /> Sessions
            </Button>
            <div className="pt-4 mt-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-start font-medium text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </Button>
            </div>
          </aside>

          {/* Main Content Sections */}
          <div className="flex-1 space-y-8">
            {/* Profile Information */}
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email" 
                      value={email} 
                      readOnly
                      className="bg-muted/30"
                    />
                    <p className="text-[11px] text-muted-foreground">Email changes require re-verification.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t flex justify-end py-3">
                <Button onClick={handleUpdateProfile} size="sm">Save Changes</Button>
              </CardFooter>
            </Card>

            {/* Security Section */}
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Two-factor authentication</p>
                      <p className="text-xs text-muted-foreground">Your account is secured with two-factor authentication.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t flex justify-end py-3">
                <Button variant="outline" size="sm" onClick={handleChangePassword}>Update Password</Button>
              </CardFooter>
            </Card>

            {/* Active Sessions */}
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>View and manage your active login sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-muted rounded-md text-muted-foreground">
                        <session.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.device} • {session.browser}</p>
                        <p className="text-xs text-muted-foreground">{session.location} • {session.status}</p>
                      </div>
                    </div>
                    {session.id !== 1 && (
                      <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                        Revoke session
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
