import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Clock, Save } from 'lucide-react';
import { Layout } from './Layout';

interface CrewMember {
  id: string;
  name: string;
  scheduledStart: string;
  scheduledEnd: string;
}

interface TimeEntryProps {
  onSubmit: () => void;
  onBack: () => void;
  selectedDate: Date;
  crewMembers: CrewMember[];
}

export const TimeEntry = ({ onSubmit, onBack, selectedDate, crewMembers }: TimeEntryProps) => {
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const [timeEntries, setTimeEntries] = useState(() => 
    crewMembers.reduce((acc, member) => {
      acc[member.id] = {
        startTime: convertTo24Hour(member.scheduledStart),
        endTime: convertTo24Hour(member.scheduledEnd),
      };
      return acc;
    }, {} as Record<string, { startTime: string; endTime: string }>)
  );

  const [editIndividually, setEditIndividually] = useState(false);

  const [groupTimes, setGroupTimes] = useState<{ startTime: string; endTime: string }>(() => {
    const first = crewMembers[0];
    return first
      ? {
          startTime: convertTo24Hour(first.scheduledStart),
          endTime: convertTo24Hour(first.scheduledEnd),
        }
      : { startTime: '', endTime: '' };
  });

  useEffect(() => {
    if (!editIndividually && crewMembers.length > 0) {
      const first = crewMembers[0];
      const firstEntry = timeEntries[first.id] || { startTime: '', endTime: '' };
      setGroupTimes({ startTime: firstEntry.startTime, endTime: firstEntry.endTime });
    }
  }, [editIndividually, crewMembers, timeEntries]);


  const updateTimeEntry = (memberId: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeEntries(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      }
    }));
  };

  const updateAllEntries = (field: 'startTime' | 'endTime', value: string) => {
    setGroupTimes(prev => ({ ...prev, [field]: value }));
    setTimeEntries(prev => {
      const updated = { ...prev };
      crewMembers.forEach(member => {
        updated[member.id] = { ...updated[member.id], [field]: value };
      });
      return updated;
    });
  };

  const calculateHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(`2024-01-01 ${startTime}`);
    const end = new Date(`2024-01-01 ${endTime}`);
    
    if (end <= start) return '';
    
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    
    return `${hours.toFixed(1)} hours`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allValid = crewMembers.every(member => {
      const entry = timeEntries[member.id];
      return entry.startTime && entry.endTime && calculateHours(entry.startTime, entry.endTime);
    });
    
    if (allValid) {
      onSubmit();
    }
  };

  const isValid = crewMembers.every(member => {
    const entry = timeEntries[member.id];
    return entry.startTime && entry.endTime && calculateHours(entry.startTime, entry.endTime);
  });

  return (
    <Layout title="Edit Crew Hours" onBack={onBack}>
      <div className="space-y-6">
        <Card className="w-full shadow-[var(--shadow-soft)] border-0 bg-[var(--gradient-card)]">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Update the actual times worked on {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <Label htmlFor="edit-individually" className="text-foreground font-medium">Edit Individually</Label>
                  <Switch
                    id="edit-individually"
                    checked={editIndividually}
                    onCheckedChange={setEditIndividually}
                  />
                </div>

                {!editIndividually && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-foreground">All Crew Members</h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="group-start" className="text-foreground font-medium text-sm">
                          Start Time
                        </Label>
                        <Input
                          id="group-start"
                          type="time"
                          value={groupTimes.startTime}
                          onChange={(e) => updateAllEntries('startTime', e.target.value)}
                          className="text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="group-end" className="text-foreground font-medium text-sm">
                          End Time
                        </Label>
                        <Input
                          id="group-end"
                          type="time"
                          value={groupTimes.endTime}
                          onChange={(e) => updateAllEntries('endTime', e.target.value)}
                          className="text-sm"
                          required
                        />
                      </div>
                    </div>

                    {calculateHours(groupTimes.startTime, groupTimes.endTime) && (
                      <div className="bg-background/50 rounded-md p-2 text-center">
                        <span className="text-muted-foreground text-sm">Total Hours: </span>
                        <span className="font-semibold text-foreground text-sm">{calculateHours(groupTimes.startTime, groupTimes.endTime)}</span>
                      </div>
                    )}
                  </div>
                )}

                {editIndividually && crewMembers.map((member) => {
                  const entry = timeEntries[member.id];
                  const hours = calculateHours(entry.startTime, entry.endTime);
                  
                  return (
                    <div key={member.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-foreground">{member.name}</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`start-${member.id}`} className="text-foreground font-medium text-sm">
                            Start Time
                          </Label>
                          <Input
                            id={`start-${member.id}`}
                            type="time"
                            value={entry.startTime}
                            onChange={(e) => updateTimeEntry(member.id, 'startTime', e.target.value)}
                            className="text-sm"
                            required
                            disabled={!editIndividually}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`end-${member.id}`} className="text-foreground font-medium text-sm">
                            End Time
                          </Label>
                          <Input
                            id={`end-${member.id}`}
                            type="time"
                            value={entry.endTime}
                            onChange={(e) => updateTimeEntry(member.id, 'endTime', e.target.value)}
                            className="text-sm"
                            required
                            disabled={!editIndividually}
                          />
                        </div>
                      </div>
                      
                      {hours && (
                        <div className="bg-background/50 rounded-md p-2 text-center">
                          <span className="text-muted-foreground text-sm">Total Hours: </span>
                          <span className="font-semibold text-foreground text-sm">{hours}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!editIndividually && (
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
              )}

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
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};