import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, CheckCircle, XCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TimeEntry } from './TimeEntry';

export const ScheduleVerification = () => {
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Mock schedule data
  const scheduledStart = "9:00 AM";
  const scheduledEnd = "5:00 PM";
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
    setIsCompleted(false);
    setShowTimeEntry(false);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
    setIsCompleted(false);
    setShowTimeEntry(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCompleted(false);
      setShowTimeEntry(false);
    }
  };

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
    return <TimeEntry onSubmit={handleTimeSubmit} onBack={() => setShowTimeEntry(false)} selectedDate={selectedDate} />;
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
          
          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToPreviousDay}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 text-muted-foreground hover:text-foreground font-normal",
                    "min-w-0 px-2"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">{formatDate(selectedDate)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToNextDay}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
              Did you work your scheduled hours on this day?
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