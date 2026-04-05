import { useState, useEffect } from 'react';
import { useGetCallerProfile, useSaveCallerProfile } from '../hooks/queries/useProfiles';
import QueryState from '../components/common/QueryState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Loader2, Edit, Save, X, Phone, Camera } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useGetCallerProfile();
  const saveProfile = useSaveCallerProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setArea(profile.area);
      setBio(profile.bio || '');
      setProfilePhoto(profile.profilePhoto || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile || !name.trim() || !area.trim()) return;

    try {
      await saveProfile.mutateAsync({
        ...profile,
        name: name.trim(),
        email: email.trim(),
        area: area.trim(),
        bio: bio.trim(),
        profilePhoto: profilePhoto.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setArea(profile.area);
      setBio(profile.bio || '');
      setProfilePhoto(profile.profilePhoto || '');
    }
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Banner */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute top-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3" />
        <div className="container py-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2 animate-fade-in-up">
              <h1 className="text-4xl font-extrabold tracking-tight">
                My <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
            <div className="hidden md:block animate-fade-in-up stagger-1">
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 blur-lg opacity-60" />
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=240&h=160&fit=crop&q=80"
                  alt="Professional profile"
                  className="relative w-48 h-32 rounded-2xl object-cover shadow-lg border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
      <div className="mx-auto max-w-2xl">

        <QueryState isLoading={isLoading} isError={isError} error={error} isEmpty={!profile}>
          {profile && (
            <Card className="overflow-hidden shadow-sm">
              {/* Profile banner */}
              <div className={`h-24 bg-gradient-to-r ${profile.profileType === 'provider' ? 'from-primary/20 via-primary/10 to-accent/10' : 'from-accent/20 via-accent/10 to-primary/10'}`} />
              <CardHeader className="-mt-8">
                <div className="flex items-end justify-between">
                  <div className="flex items-end gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border-4 border-card shadow-lg overflow-hidden">
                      {profile.profilePhoto ? (
                        <img src={profile.profilePhoto} alt={profile.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center rounded-xl ${profile.profileType === 'provider' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                          <span className="text-2xl">{profile.profileType === 'provider' ? '🏢' : '👷'}</span>
                        </div>
                      )}
                    </div>
                    <div className="pb-1">
                      <CardTitle className="text-xl">{profile.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={profile.profileType === 'provider' ? 'default' : 'secondary'}
                          className={profile.profileType === 'provider' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}
                        >
                          {profile.profileType === 'provider' ? 'Provider' : 'Worker'}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 shadow-sm">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  {isEditing ? (
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="transition-all focus:shadow-md" />
                  ) : (
                    <p className="text-sm font-medium">{profile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                  {isEditing ? (
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="transition-all focus:shadow-md" />
                  ) : (
                    <p className="text-sm font-medium">{profile.email || 'Not provided'}</p>
                  )}
                </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Area / Location</Label>
                  {isEditing ? (
                    <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} className="transition-all focus:shadow-md" />
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-1.5"><span>📍</span> {profile.area}</p>
                  )}
                </div>

                {/* Phone Number */}
                {profile.phone && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</Label>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      +91 {profile.phone}
                    </p>
                  </div>
                )}

                {/* Profile Photo URL */}
                <div className="space-y-2">
                  <Label htmlFor="profilePhoto" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" /> Profile Photo URL
                  </Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input id="profilePhoto" value={profilePhoto} onChange={(e) => setProfilePhoto(e.target.value)} placeholder="https://example.com/photo.jpg" className="transition-all focus:shadow-md" />
                      {profilePhoto && (
                        <img src={profilePhoto} alt="Preview" className="h-20 w-20 rounded-lg object-cover border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                    </div>
                  ) : (
                    profile.profilePhoto ? (
                      <img src={profile.profilePhoto} alt={profile.name} className="h-20 w-20 rounded-lg object-cover border shadow-sm" />
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No photo added</p>
                    )
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio / About</Label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself, your skills, experience..."
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none transition-all focus:shadow-md"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profile.bio || 'No bio added yet'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={handleSave} disabled={saveProfile.isPending || !name.trim() || !area.trim()} className="gap-2 shadow-md">
                      {saveProfile.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </QueryState>
      </div>
      </div>
    </div>
  );
}

