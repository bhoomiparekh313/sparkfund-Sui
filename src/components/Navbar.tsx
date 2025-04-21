
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import {
  Home,
  Search,
  Plus,
  Heart,
  Bell,
  User,
  LayoutDashboard,
  LogIn,
  UserPlus
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuthModal } from "@/components/UserAuthModal";
import { getUserProfile } from "@/lib/sui";
import { UserProfile } from "@/types/Campaign";

export function Navbar() {
  const { walletConnected, walletAddress } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  // Demo unread notifications: in production, fetch this state from user/context
  const [hasUnread, setHasUnread] = useState(false);

  // User registration modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // Has user registered a profile?
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // You'd replace this with the actual unread count from notifications in your app
    // For now, let's simulate unread notifications
    const notifs = localStorage.getItem("dummyNotifications");
    setHasUnread(notifs === "unread");
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (walletConnected && walletAddress) {
        const profile = await getUserProfile(walletAddress);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    }
    fetchProfile();
  }, [walletConnected, walletAddress]);

  return (
    <header className="border-b sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text drop-shadow">
            SparkFund
          </span>
        </Link>

        {/* Main nav desktop */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <Link
            to="/"
            className={`flex items-center p-2 transition-colors rounded hover:bg-purple-50 ${location.pathname === "/" ? "font-bold text-purple-600" : "text-sm font-medium text-gray-600"}`}
          >
            <Home className="h-5 w-5 mr-1" />
            Home
          </Link>
          <Link
            to="/campaigns"
            className={`flex items-center p-2 transition-colors rounded hover:bg-purple-50 ${location.pathname === "/campaigns" ? "font-bold text-purple-600" : "text-sm font-medium text-gray-600"}`}
          >
            <Search className="h-5 w-5 mr-1" />
            Explore
          </Link>
          {walletConnected && userProfile?.role === "creator" && (
            <Link
              to="/create-campaign"
              className={`flex items-center p-2 transition-colors rounded hover:bg-purple-100 font-bold text-purple-600`}
            >
              <Plus className="h-5 w-5 mr-1" />
              Start Campaign
            </Link>
          )}
          {walletConnected && (
            <>
              <Link
                to="/my-campaigns"
                className="flex items-center p-2 transition-colors rounded hover:bg-purple-50 text-sm font-medium text-gray-600"
              >
                <Heart className="h-5 w-5 mr-1" />
                My Campaigns
              </Link>
              <Link
                to="/profile"
                className="flex items-center p-2 rounded transition-colors hover:bg-purple-50 text-sm font-medium text-gray-600"
              >
                <User className="h-5 w-5 mr-1" />
                Profile
              </Link>
              <Link
                to="/my-campaigns"
                className="flex items-center p-2 rounded font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 mr-1" />
                Dashboard
              </Link>
            </>
          )}

          <Link
            to="/notifications"
            className={`flex items-center p-2 transition-colors rounded relative font-semibold ${
              location.pathname === "/notifications"
                ? "bg-purple-200 text-purple-800"
                : "text-gray-600 hover:bg-purple-100"
            }`}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 mr-1" />
            Notifications
            {hasUnread && (
              <span className="absolute -right-1 -top-1 bg-red-500 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center border border-white" />
            )}
          </Link>
        </nav>

        {/* Right action zone */}
        <div className="flex items-center gap-2">
          {/* Login/Register button */}
          {!userProfile && (
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 border-purple-500 text-purple-700 font-semibold hover:bg-purple-100"
              onClick={() => setAuthModalOpen(true)}
            >
              <LogIn className="h-5 w-5 mr-1" />
              Login / Register
            </Button>
          )}

          {/* Mobile menu */}
          <div className="flex md:hidden space-x-1">
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <Link to="/campaigns">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full relative" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                {hasUnread && (
                  <span className="absolute -right-1 -top-1 bg-red-500 text-xs text-white rounded-full h-4 w-4 flex items-center justify-center border border-white" />
                )}
              </Link>
            </Button>
          </div>

          {/* Connect Wallet or Dashboard Button */}
          {!walletConnected ? (
            <ConnectWallet />
          ) : (
            <Link to="/my-campaigns" className="hidden md:block">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-700 font-bold hover:bg-blue-100 hover:text-blue-800 transition-all duration-150"
              >
                Dashboard
              </Button>
            </Link>
          )}

          {/* Auth Modal */}
          <UserAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </div>
    </header>
  );
}
