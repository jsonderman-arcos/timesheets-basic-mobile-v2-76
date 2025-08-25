import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, CheckCircle, XCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Grid3X3, LayoutDashboard, Truck, Wrench, ClipboardCheck, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TimeEntry } from './TimeEntry';

export const ScheduleVerification = () => {
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const st = location.state as any;
    if (st?.showSuccess) {
      setIsCompleted(true);
    }
  }, [location.state]);

  // Mock crew data - all with same schedule
  const crewMembers = [
    { id: '1', name: 'You', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: '2', name: 'Alex Johnson', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: '3', name: 'Sarah Davis', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: '4', name: 'Mike Rodriguez', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: '5', name: 'Emma Wilson', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: '6', name: 'David Brown', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
  ];
  
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
  navigate('/additional-details');
};

  const handleDenySchedule = () => {
    setShowTimeEntry(true);
  };

  const handleTimeSubmit = () => {
    navigate('/additional-details');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: false },
    { name: 'Convoys', icon: Truck, active: false },
    { name: 'Repair', icon: Wrench, active: false },
    { name: 'Assess', icon: ClipboardCheck, active: false },
    { name: 'Time Tracking', icon: Clock, active: true },
    { name: 'Expenses', icon: DollarSign, active: false },
  ];

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
    return <TimeEntry onSubmit={handleTimeSubmit} onBack={() => setShowTimeEntry(false)} selectedDate={selectedDate} crewMembers={crewMembers} />;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-red-900 text-white">
        <div className="text-center pt-8 pb-4">
          <h1 className="text-2xl font-bold">
            Schedule Verification
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-6">
          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-2 mb-6">
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
          <div className="space-y-4">
            <p className="text-center text-foreground font-medium">
              Did everyone work their scheduled hours on this day?
            </p>
            
            <div className="space-y-3">
              <Button 
                variant="success" 
                size="lg" 
                className="w-full"
                onClick={handleConfirmSchedule}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Yes, everyone worked scheduled hours
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={handleDenySchedule}
              >
                <XCircle className="w-5 h-5 mr-2" />
                No, need to edit hours
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-foreground mb-3">Scheduled Hours</h3>
            <div className="bg-background/50 rounded-md p-3 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Time:</span>
                  <span className="font-medium text-foreground">{crewMembers[0].scheduledStart}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Time:</span>
                  <span className="font-medium text-foreground">{crewMembers[0].scheduledEnd}</span>
                </div>
              </div>
              <div className="border-t border-border pt-2 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Hours:</span>
                  <span className="font-semibold text-foreground">8 hours</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Crew Members</h4>
              <div className="grid grid-cols-2 gap-2">
                {crewMembers.map((member) => (
                  <div key={member.id} className="bg-background/50 rounded-md px-3 py-2">
                    <span className="text-foreground text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Menu */}
      <Button
        size="icon"
        className="absolute bottom-4 left-4 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        onClick={() => setShowFabMenu(!showFabMenu)}
      >
        <Grid3X3 className="h-6 w-6" />
      </Button>

      {/* Custom Menu Modal - stays within iPhone wrapper */}
      {showFabMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setShowFabMenu(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl border-0 z-50 p-4 relative">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  variant={item.active ? "default" : "outline"}
                  className="h-16 flex flex-col gap-2"
                  onClick={() => setShowFabMenu(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              ))}
            </div>
            
            {/* Collapse Button - positioned 10px from bottom and left */}
            <Button
              variant="ghost"
              className="h-12 w-12 rounded-full absolute bottom-2.5 left-2.5"
              onClick={() => setShowFabMenu(false)}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};