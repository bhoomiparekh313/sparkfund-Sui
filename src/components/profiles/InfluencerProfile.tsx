
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function InfluencerProfile({ userProfile, onUpdate }: { userProfile: any; onUpdate: (data: any) => Promise<void> }) {
  const [name, setName] = useState(userProfile?.name || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [socialLinks, setSocialLinks] = useState(userProfile?.socialLinks || "");
  const [specialties, setSpecialties] = useState(userProfile?.specialties || "");
  const [rate, setRate] = useState(userProfile?.rate || "");
  const [forDonations, setForDonations] = useState(userProfile?.forDonations || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate({ name, bio, socialLinks, specialties, rate, forDonations });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Influencer Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialLinks">Social Media Links</Label>
            <Textarea
              id="socialLinks"
              value={socialLinks}
              onChange={(e) => setSocialLinks(e.target.value)}
              placeholder="Enter your social media links (one per line)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties</Label>
            <Input
              id="specialties"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="Your areas of expertise (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Rate (SUI per promotion)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Your rate in SUI"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="donations"
              checked={forDonations}
              onCheckedChange={setForDonations}
            />
            <Label htmlFor="donations">Available for donation campaigns</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and your influence"
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}