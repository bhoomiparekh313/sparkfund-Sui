
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserRoleSelection } from "./UserRoleSelection";

interface UserAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAuthModal({ open, onOpenChange }: UserAuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Started</DialogTitle>
          <DialogDescription>
            Choose your role and register to access SparkFund features.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <UserRoleSelection />
        </div>
      </DialogContent>
    </Dialog>
  );
}
