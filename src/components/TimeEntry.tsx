import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, Save } from 'lucide-react';

interface TimeEntryProps {
  onSubmit: () => void;
  onBack: () => void;
}

export const TimeEntry = ({ onSubmit, onBack }: TimeEntryProps) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime && endTime) {
      onSubmit();
    }
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(`2024-01-01 ${startTime}`);
    const end = new Date(`2024-01-01 ${endTime}`);
    
    if (end <= start) return '';
    
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    
    return `${hours.toFixed(1)} hours`;
  };

  const isValid = startTime && endTime && calculateHours();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-0 bg-[var(--gradient-card)]">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Enter Your Hours
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Please enter the actual times you worked today
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-foreground font-medium">
                  Start Time
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-lg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-foreground font-medium">
                  End Time
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-lg"
                  required
                />
              </div>

              {calculateHours() && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <span className="text-muted-foreground">Total Hours: </span>
                  <span className="font-semibold text-foreground">{calculateHours()}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                variant="default" 
                size="lg" 
                className="w-full"
                disabled={!isValid}
              >
                <Save className="w-5 h-5 mr-2" />
                Save Hours
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Verification
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};