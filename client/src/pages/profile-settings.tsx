import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/translation-context";
import { useAuth } from "@/contexts/auth-context";
import { useTenant } from "@/contexts/tenant-context";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Save, 
  Edit,
  Camera,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Copy,
  Plus,
  Trash2,
  RefreshCw,
  Calendar,
  MapPin,
  Globe
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  prescriptionAlerts: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
  theme: string;
  autoLogout: number;
  dataRetention: boolean;
}

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { setLanguage: setTranslationLanguage, currentLanguage, isTranslating, isSyncing } = useTranslation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [showNewApiKeyDialog, setShowNewApiKeyDialog] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    prescriptionAlerts: true,
    marketingEmails: false,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    autoLogout: 30,
    dataRetention: true
  });
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    profileImage: user?.profileImage || ""
  });

  // Fetch user's 2FA status
  const { data: securitySettings } = useQuery({
    queryKey: ['/api/users/security'],
    enabled: !!user
  });

  // Fetch active login sessions
  const { data: loginSessions = [] } = useQuery<LoginSession[]>({
    queryKey: ['/api/users/sessions'],
    enabled: !!user
  });

  // Fetch API keys
  const { data: apiKeys = [] } = useQuery<ApiKey[]>({
    queryKey: ['/api/users/api-keys'],
    enabled: !!user
  });

  // Fetch user preferences
  const { data: userPreferences } = useQuery<UserPreferences>({
    queryKey: ['/api/users/preferences'],
    enabled: !!user
  });

  useEffect(() => {
    if (securitySettings) {
      setTwoFactorEnabled((securitySettings as any)?.twoFactorEnabled || false);
    }
  }, [securitySettings]);

  // Flag to track if we've done initial sync
  const [hasInitialSync, setHasInitialSync] = useState(false);

  useEffect(() => {
    if (userPreferences && !hasInitialSync) {
      // Only sync preferences on initial load
      const savedLanguage = localStorage.getItem('selectedLanguage');
      const preferencesToSet = {
        ...userPreferences,
        // Use saved language preference over server default
        language: savedLanguage || userPreferences.language
      };
      
      setPreferences(preferencesToSet);
      setHasInitialSync(true);
      
      // Update translation context if different
      if (savedLanguage && savedLanguage !== currentLanguage) {
        setTranslationLanguage(savedLanguage);
      }
    }
  }, [userPreferences, hasInitialSync, currentLanguage, setTranslationLanguage]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      // Filter out undefined values and ensure we only send allowed fields
      const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'bio', 'profileImage'];
      const cleanData = Object.keys(data)
        .filter(key => allowedFields.includes(key) && data[key as keyof UserProfile] !== undefined)
        .reduce((obj, key) => {
          obj[key] = data[key as keyof UserProfile];
          return obj;
        }, {} as any);

      const response = await fetch(`/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(cleanData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      setIsEditing(false);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChange) => {
      const response = await fetch(`/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully."
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
    }
  });

  // 2FA Setup Mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/users/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setTwoFactorSecret(data.secret);
      setShow2FASetup(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to setup 2FA",
        variant: "destructive"
      });
    }
  });

  // Verify 2FA Mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/users/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, secret: twoFactorSecret })
      });
      
      if (!response.ok) {
        throw new Error('Invalid verification code');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/security'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    }
  });

  // Disable 2FA Mutation
  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/users/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setTwoFactorEnabled(false);
      toast({
        title: "Success",
        description: "Two-factor authentication disabled"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/security'] });
    }
  });

  // Revoke Session Mutation
  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/users/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Session revoked successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/sessions'] });
    }
  });

  // Create API Key Mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/users/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create API key');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "API Key Created",
        description: "Make sure to copy your API key now. You won't be able to see it again!"
      });
      setShowNewApiKeyDialog(false);
      setNewApiKeyName("");
      queryClient.invalidateQueries({ queryKey: ['/api/users/api-keys'] });
    }
  });

  // Delete API Key Mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/users/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API key deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/api-keys'] });
    }
  });

  // Update Preferences Mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: UserPreferences) => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPreferences)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your account preferences have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/preferences'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
        variant: "destructive"
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };
    setPreferences(newPreferences);
    
    // If language preference changes, update the translation context immediately
    if (key === 'language' && value !== currentLanguage) {
      setTranslationLanguage(value);
    }
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const userInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;
  const isPlatformOwner = tenant?.name === 'ARGILETTE' || tenant?.type === 'platform';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-slate-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>
          {isPlatformOwner && (
            <Badge className="bg-purple-100 text-purple-800">
              <Shield className="w-3 h-3 mr-1" />
              Platform Owner
            </Badge>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-2xl">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    {profileData.profileImage ? (
                      <AvatarImage src={profileData.profileImage} />
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-medium">
                        {userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                      {profileData.profileImage && (
                        <Button variant="outline" size="sm" onClick={() => setProfileData(prev => ({ ...prev, profileImage: "" }))}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => {
                        if (!isEditing) return;
                        // Only allow digits and limit to 10 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setProfileData(prev => ({ ...prev, phone: value }));
                      }}
                      disabled={!isEditing}
                      placeholder="1234567890"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                {/* Role and Status */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {user?.role?.replace('_', ' ')}
                      </Badge>
                      {user?.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <div className="text-sm text-gray-600">
                      {tenant?.name}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            firstName: user?.firstName || "",
                            lastName: user?.lastName || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                            bio: user?.bio || "",
                            profileImage: user?.profileImage || ""
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword}
                  >
                    {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Authenticator App</h4>
                      <p className="text-sm text-gray-500">
                        {twoFactorEnabled 
                          ? "Two-factor authentication is enabled" 
                          : "Add an extra layer of security to your account"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {twoFactorEnabled ? (
                        <>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => disable2FAMutation.mutate()}
                            disabled={disable2FAMutation.isPending}
                          >
                            {disable2FAMutation.isPending ? 'Disabling...' : 'Disable'}
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setup2FAMutation.mutate()}
                          disabled={setup2FAMutation.isPending}
                        >
                          {setup2FAMutation.isPending ? 'Setting up...' : 'Enable 2FA'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 2FA Setup Dialog */}
                  {show2FASetup && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-medium mb-2">Setup Two-Factor Authentication</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            1. Scan this QR code with your authenticator app:
                          </p>
                          <div className="flex justify-center p-4 bg-white border rounded">
                            {qrCode ? (
                              <img src={qrCode} alt="2FA QR Code" className="w-32 h-32" />
                            ) : (
                              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                                QR Code
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            2. Enter the verification code from your app:
                          </p>
                          <div className="flex gap-2">
                            <Input
                              placeholder="000000"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              maxLength={6}
                              className="font-mono text-center"
                            />
                            <Button 
                              onClick={() => verify2FAMutation.mutate(verificationCode)}
                              disabled={verify2FAMutation.isPending || verificationCode.length !== 6}
                            >
                              {verify2FAMutation.isPending ? 'Verifying...' : 'Verify'}
                            </Button>
                          </div>
                        </div>

                        {backupCodes.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              3. Save these backup codes in a safe place:
                            </p>
                            <div className="p-3 bg-gray-100 rounded font-mono text-sm">
                              {backupCodes.map((code, index) => (
                                <div key={index}>{code}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Login Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Active Login Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loginSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{session.device}</h4>
                              {session.isCurrent && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {session.browser}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {session.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {session.lastActive}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => revokeSessionMutation.mutate(session.id)}
                            disabled={revokeSessionMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {loginSessions.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No active sessions found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        API keys allow external applications to access your account
                      </p>
                      <Button 
                        size="sm"
                        onClick={() => setShowNewApiKeyDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Key
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{key.name}</h4>
                            <div className="text-sm text-gray-500 flex items-center gap-4">
                              <span className="font-mono">{key.keyPreview}</span>
                              <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                              {key.lastUsed && (
                                <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(key.keyPreview);
                                toast({ title: "Copied to clipboard" });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteApiKeyMutation.mutate(key.id)}
                              disabled={deleteApiKeyMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {apiKeys.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <Key className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No API keys created yet</p>
                        </div>
                      )}
                    </div>

                    {/* New API Key Dialog */}
                    {showNewApiKeyDialog && (
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-medium mb-2">Create New API Key</h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="apiKeyName">Key Name</Label>
                            <Input
                              id="apiKeyName"
                              placeholder="My API Key"
                              value={newApiKeyName}
                              onChange={(e) => setNewApiKeyName(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => createApiKeyMutation.mutate(newApiKeyName)}
                              disabled={createApiKeyMutation.isPending || !newApiKeyName.trim()}
                            >
                              {createApiKeyMutation.isPending ? 'Creating...' : 'Create Key'}
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setShowNewApiKeyDialog(false);
                                setNewApiKeyName("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Account Preferences</h3>
                <p className="text-sm text-gray-500">
                  Configure your account settings and preferences.
                </p>
              </div>
              
              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive urgent alerts via text message</p>
                    </div>
                    <Switch
                      checked={preferences.smsNotifications}
                      onCheckedChange={(value) => handlePreferenceChange('smsNotifications', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Appointment Reminders</h4>
                      <p className="text-sm text-gray-500">Get reminders for upcoming appointments</p>
                    </div>
                    <Switch
                      checked={preferences.appointmentReminders}
                      onCheckedChange={(value) => handlePreferenceChange('appointmentReminders', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Prescription Alerts</h4>
                      <p className="text-sm text-gray-500">Notifications for prescription updates and refills</p>
                    </div>
                    <Switch
                      checked={preferences.prescriptionAlerts}
                      onCheckedChange={(value) => handlePreferenceChange('prescriptionAlerts', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-gray-500">Receive promotional content and updates</p>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(value) => handlePreferenceChange('marketingEmails', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Display & Language Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Display & Language
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="language" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Language Preference
                        </Label>
                        {isTranslating && (
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Syncing...
                          </div>
                        )}
                        {isSyncing && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Synced
                          </div>
                        )}
                      </div>
                      <Select
                        value={preferences.language}
                        onValueChange={(value) => handlePreferenceChange('language', value)}
                        disabled={isTranslating || isSyncing}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">
                            <div className="flex items-center gap-2">
                              <span>🇺🇸</span>
                              <span>English</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="es">
                            <div className="flex items-center gap-2">
                              <span>🇪🇸</span>
                              <span>Español</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="fr">
                            <div className="flex items-center gap-2">
                              <span>🇫🇷</span>
                              <span>Français</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="de">
                            <div className="flex items-center gap-2">
                              <span>🇩🇪</span>
                              <span>Deutsch</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="pt">
                            <div className="flex items-center gap-2">
                              <span>🇵🇹</span>
                              <span>Português</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium">One-Click Language Sync</p>
                            <p className="text-blue-600 mt-1">
                              Your language preference automatically syncs across all your devices and sessions. 
                              Changes take effect immediately and persist everywhere you're logged in.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={preferences.timezone}
                        onValueChange={(value) => handlePreferenceChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={preferences.dateFormat}
                        onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(value) => handlePreferenceChange('theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security & Privacy Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                    <Select
                      value={preferences.autoLogout.toString()}
                      onValueChange={(value) => handlePreferenceChange('autoLogout', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Retention</h4>
                      <p className="text-sm text-gray-500">Keep historical data for analytics and compliance</p>
                    </div>
                    <Switch
                      checked={preferences.dataRetention}
                      onCheckedChange={(value) => handlePreferenceChange('dataRetention', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Preferences */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSavePreferences}
                  disabled={updatePreferencesMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}