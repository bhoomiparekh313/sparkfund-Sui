
import { Link } from 'react-router-dom';
import { Campaign } from '@/types/Campaign';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
}

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  const progress = Math.min(
    (campaign.amountCollected / campaign.target) * 100,
    100
  );
  
  const remainingDays = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="h-48 overflow-hidden">
        <img 
          src={campaign.image} 
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
        <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{campaign.amountCollected} SUI</span>
              <span className="text-muted-foreground">of {campaign.target} SUI</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">{remainingDays}</span> Days Left
            </div>
            <div>
              <span className="font-medium">{campaign.donators.length}</span> Backers
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/campaign/${campaign.id}`} className="w-full">
          <Button variant="default" className="w-full">View Campaign</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
