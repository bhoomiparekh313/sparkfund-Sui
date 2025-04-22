
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function ContributorProfile({ userProfile, onUpdate }: { userProfile: any; onUpdate: (data: any) => Promise<void> }) {
  const [name, setName] = useState(userProfile?.name || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [interests, setInterests] = useState(userProfile?.interests || "");
  const [investment, setInvestment] = useState(userProfile?.investment || "");
  const [notifyNew, setNotifyNew] = useState(userProfile?.notifyNew || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate({ name, bio, interests, investment, notifyNew });
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
        <CardTitle>Contributor Profile</CardTitle>
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
            <Label htmlFor="interests">Interests</Label>
            <Input
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="What kind of projects interest you?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment">Investment Focus</Label>
            <Input
              id="investment"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              placeholder="What types of investments are you looking for?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notifyNew}
              onCheckedChange={setNotifyNew}
            />
            <Label htmlFor="notifications">Notify me about new campaigns</Label>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/contributor")}>
              Go to Contributor Dashboard
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}