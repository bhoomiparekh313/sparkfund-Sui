
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { getUserNotifications } from "@/lib/sui";
import { CampaignNotification } from "@/types/Campaign";
import { Link } from "react-router-dom";
import { Bell, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const { walletConnected, walletAddress } = useWallet();
  const [notifications, setNotifications] = useState<CampaignNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!walletConnected || !walletAddress) {
        return;
      }
      
      setIsLoading(true);
      try {
        const userNotifications = await getUserNotifications(walletAddress);
        setNotifications(userNotifications);
        
        // Check for read notifications in local storage
        const storedReadNotifs = localStorage.getItem(`readNotifications-${walletAddress}`);
        if (storedReadNotifs) {
          setReadNotifications(new Set(JSON.parse(storedReadNotifs)));
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [walletConnected, walletAddress]);
  
  // Format relative time
  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  const markAsRead = (notificationId: string) => {
    const newReadNotifications = new Set(readNotifications);
    newReadNotifications.add(notificationId);
    setReadNotifications(newReadNotifications);
    
    // Store in localStorage
    if (walletAddress) {
      localStorage.setItem(
        `readNotifications-${walletAddress}`, 
        JSON.stringify([...newReadNotifications])
      );
    }
  };
  
  const isRead = (notificationId: string) => {
    return readNotifications.has(notificationId);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
              Mark all as read
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-shadow ${!isRead(notification.id) ? 'border-l-4 border-l-purple-500' : ''}`}
              >
                <CardContent className="p-4 flex items-start">
                  <div className={`rounded-full p-2 mr-4 mt-1 ${
                    !isRead(notification.id) ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {!isRead(notification.id) ? (
                      <Mail className="h-5 w-5 text-purple-500" />
                    ) : (
                      <Bell className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold text-lg ${!isRead(notification.id) ? 'text-purple-900' : ''}`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Link 
                        to={`/campaign/${notification.campaignId}`} 
                        className="text-sm text-purple-500 hover:underline inline-block"
                      >
                        View campaign
                      </Link>
                      
                      {!isRead(notification.id) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs flex items-center gap-1 text-gray-500"
                        >
                          <Check className="h-3 w-3" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">No Notifications</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>You don't have any notifications yet.</p>
              <p className="mt-4">
                <Link to="/campaigns" className="text-purple-500 hover:underline">
                  Browse campaigns
                </Link>{" "}
                or{" "}
                <Link to="/create-campaign" className="text-purple-500 hover:underline">
                  create your own
                </Link>{" "}
                to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
