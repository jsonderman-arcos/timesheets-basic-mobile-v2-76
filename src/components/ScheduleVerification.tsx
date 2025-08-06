import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { TimeEntry } from './TimeEntry';

export const ScheduleVerification = () => {
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mock schedule data
  const scheduledStart = "9:00 AM";
  const scheduledEnd = "5:00 PM";
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleConfirmSchedule = () => {
    setIsCompleted(true);
  };

  const handleDenySchedule = () => {
    setShowTimeEntry(true);
  };

  const handleTimeSubmit = () => {
    setIsCompleted(true);
    setShowTimeEntry(false);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-0 bg-[var(--gradient-card)]">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">All Set!</h2>
            <p className="text-muted-foreground">
              Your work hours have been recorded. Thank you for updating your schedule.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showTimeEntry) {
    return <TimeEntry onSubmit={handleTimeSubmit} onBack={() => setShowTimeEntry(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-0 bg-[var(--gradient-card)]">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Schedule Verification
          </CardTitle>
          <CardDescription className="text-muted-foreground flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-foreground mb-3">Your Scheduled Hours</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-medium text-foreground">{scheduledStart}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">End Time:</span>
              <span className="font-medium text-foreground">{scheduledEnd}</span>
            </div>
            <div className="border-t border-border pt-2 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Hours:</span>
                <span className="font-semibold text-foreground">8 hours</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-center text-foreground font-medium">
              Did you work your scheduled hours today?
            </p>
            
            <div className="space-y-3">
              <Button 
                variant="success" 
                size="lg" 
                className="w-full"
                onClick={handleConfirmSchedule}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Yes, I worked my scheduled hours
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={handleDenySchedule}
              >
                <XCircle className="w-5 h-5 mr-2" />
                No, I worked different hours
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};