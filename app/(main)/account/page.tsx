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
} from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const [name, setName] = useState("Professor");
  const [email, setEmail] = useState("professor@bytetools.com");

  const sessions = [
    { id: 1, device: "MacBook Pro", browser: "Chrome", location: "Dhaka, Bangladesh", status: "Current Session", icon: Monitor },
    { id: 2, device: "iPhone 15", browser: "Safari", location: "Dhaka, Bangladesh", status: "2 days ago", icon: Smartphone },
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password changed successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, security, and active sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar (Local to page) */}
        <div className="space-y-1 md:col-span-1">
            <Button variant="ghost" className="w-full justify-start font-medium text-foreground bg-accent">
                <User className="mr-2 h-4 w-4" /> Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <Lock className="mr-2 h-4 w-4" /> Security
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                <Shield className="mr-2 h-4 w-4" /> Sessions
            </Button>
            <Separator className="my-2" />
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="mr-2 h-4 w-4" /> Danger Zone
            </Button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-8">
          {/* Profile Section */}
          <Card className="bg-card border-border shadow-xl overflow-hidden transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Profile Information</CardTitle>
              <CardDescription className="text-muted-foreground/70">Update your account's profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border text-foreground focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border text-foreground focus-visible:ring-primary/30"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border p-4">
              <Button onClick={handleUpdateProfile} className="transition-all active:scale-95">
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Password Section */}
          <Card className="bg-card border-border shadow-xl overflow-hidden transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Change Password</CardTitle>
              <CardDescription className="text-muted-foreground/70">Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current" className="text-muted-foreground">Current Password</Label>
                <Input id="current" type="password" className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new" className="text-muted-foreground">New Password</Label>
                <Input id="new" type="password" className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-muted-foreground">Confirm Password</Label>
                <Input id="confirm" type="password" className="bg-background border-border text-foreground" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border p-4">
              <Button onClick={handleChangePassword} className="transition-all active:scale-95">
                Update Password
              </Button>
            </CardFooter>
          </Card>

          {/* Sessions Section */}
          <Card className="bg-card border-border shadow-xl transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Active Sessions</CardTitle>
              <CardDescription className="text-muted-foreground/70">Devices that are currently logged into your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shadow-sm">
                      <session.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{session.device} · {session.browser}</p>
                      <p className="text-xs text-muted-foreground/70">{session.location} · {session.status}</p>
                    </div>
                  </div>
                  {session.id !== 1 && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-0">
                <Button variant="link" className="text-muted-foreground/60 hover:text-primary px-0 text-xs font-medium decoration-primary/30">
                    Log out of all other sessions
                </Button>
            </CardFooter>
          </Card>

          {/* Delete Account Section */}
          <Card className="bg-destructive/5 border-destructive/20 shadow-xl overflow-hidden transition-colors">
            <CardHeader>
              <CardTitle className="text-xl text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" /> Delete Account
              </CardTitle>
              <CardDescription className="text-destructive/60">Permanently delete your account and all of your content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.
              </p>
            </CardContent>
            <CardFooter className="bg-destructive/10 border-t border-destructive/20 p-4">
              <Button variant="destructive" className="font-bold shadow-lg shadow-destructive/20 transition-all active:scale-95">
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
