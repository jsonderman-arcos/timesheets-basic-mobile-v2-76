import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Clock, MapPin, Users } from 'lucide-react';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  hourly_rate: number;
}

interface Crew {
  id: string;
  crew_name: string;
  crew_members: CrewMember[];
}

interface HoursBreakdownEntry {
  breakdown_type: string;
  hours: number;
  description: string;
  start_time: string;
  end_time: string;
}

const TimeTracker = () => {
  const { toast } = useToast();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Time entry form data
  const [timeEntry, setTimeEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '16:00',
    location: '',
    work_description: '',
    hours_regular: 8,
    hours_overtime: 0
  });

  // Hours breakdown
  const [hoursBreakdown, setHoursBreakdown] = useState<HoursBreakdownEntry[]>([
    { breakdown_type: 'travel', hours: 0.5, description: '', start_time: '08:00', end_time: '08:30' }
  ]);

  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    fetchCrews();
  }, []);

  const fetchCrews = async () => {
    const { data, error } = await supabase
      .from('crews')
      .select(`
        id,
        crew_name,
        crew_members (
          id,
          name,
          role,
          hourly_rate
        )
      `)
      .eq('active', true);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch crews",
        variant: "destructive"
      });
    } else {
      setCrews(data || []);
    }
  };

  const addBreakdownEntry = () => {
    setHoursBreakdown([...hoursBreakdown, {
      breakdown_type: 'work',
      hours: 1,
      description: '',
      start_time: '',
      end_time: ''
    }]);
  };

  const updateBreakdownEntry = (index: number, field: keyof HoursBreakdownEntry, value: string | number) => {
    const updated = [...hoursBreakdown];
    updated[index] = { ...updated[index], [field]: value };
    setHoursBreakdown(updated);
  };

  const removeBreakdownEntry = (index: number) => {
    setHoursBreakdown(hoursBreakdown.filter((_, i) => i !== index));
  };

  const calculateTotalHours = () => {
    const start = new Date(`1970-01-01T${timeEntry.start_time}:00`);
    const end = new Date(`1970-01-01T${timeEntry.end_time}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours);
  };

  const submitTimeEntry = async () => {
    if (!selectedCrew || !selectedMember) {
      toast({
        title: "Error",
        description: "Please select crew and crew member",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Insert time entry
      const { data: timeEntryData, error: timeEntryError } = await supabase
        .from('time_entries')
        .insert({
          crew_id: selectedCrew,
          member_id: selectedMember,
          date: timeEntry.date,
          start_time: timeEntry.start_time,
          end_time: timeEntry.end_time,
          hours_regular: timeEntry.hours_regular,
          hours_overtime: timeEntry.hours_overtime,
          location: timeEntry.location,
          work_description: timeEntry.work_description,
          status: 'draft'
        })
        .select()
        .single();

      if (timeEntryError) throw timeEntryError;

      // Insert hours breakdown if provided
      if (showBreakdown && hoursBreakdown.length > 0) {
        const breakdownEntries = hoursBreakdown.map(entry => ({
          time_entry_id: timeEntryData.id,
          member_id: selectedMember,
          breakdown_type: entry.breakdown_type,
          hours: entry.hours,
          description: entry.description,
          start_time: entry.start_time || null,
          end_time: entry.end_time || null
        }));

        const { error: breakdownError } = await supabase
          .from('hours_breakdown')
          .insert(breakdownEntries);

        if (breakdownError) throw breakdownError;
      }

      toast({
        title: "Success",
        description: "Time entry created successfully",
      });

      // Reset form
      setTimeEntry({
        date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '16:00',
        location: '',
        work_description: '',
        hours_regular: 8,
        hours_overtime: 0
      });
      setHoursBreakdown([{ breakdown_type: 'travel', hours: 0.5, description: '', start_time: '08:00', end_time: '08:30' }]);
      setShowBreakdown(false);

    } catch (error) {
      console.error('Error submitting time entry:', error);
      toast({
        title: "Error",
        description: "Failed to submit time entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCrewData = crews.find(crew => crew.id === selectedCrew);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Time Tracking</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crew Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="crew">Crew</Label>
              <Select value={selectedCrew} onValueChange={setSelectedCrew}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crew" />
                </SelectTrigger>
                <SelectContent>
                  {crews.map(crew => (
                    <SelectItem key={crew.id} value={crew.id}>
                      {crew.crew_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="member">Crew Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember} disabled={!selectedCrew}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crew member" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCrewData?.crew_members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Entry Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                value={timeEntry.date}
                onChange={(e) => setTimeEntry({...timeEntry, date: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                type="time"
                value={timeEntry.start_time}
                onChange={(e) => setTimeEntry({...timeEntry, start_time: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                type="time"
                value={timeEntry.end_time}
                onChange={(e) => setTimeEntry({...timeEntry, end_time: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="regular_hours">Regular Hours</Label>
              <Input
                type="number"
                step="0.5"
                value={timeEntry.hours_regular}
                onChange={(e) => setTimeEntry({...timeEntry, hours_regular: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div>
              <Label htmlFor="overtime_hours">Overtime Hours</Label>
              <Input
                type="number"
                step="0.5"
                value={timeEntry.hours_overtime}
                onChange={(e) => setTimeEntry({...timeEntry, hours_overtime: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              placeholder="e.g., Main Street Power Lines"
              value={timeEntry.location}
              onChange={(e) => setTimeEntry({...timeEntry, location: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="work_description">Work Description</Label>
            <Textarea
              placeholder="Describe the work performed..."
              value={timeEntry.work_description}
              onChange={(e) => setTimeEntry({...timeEntry, work_description: e.target.value})}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hours Breakdown (Optional)</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              {showBreakdown ? 'Hide Breakdown' : 'Add Breakdown'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showBreakdown && (
          <CardContent className="space-y-4">
            {hoursBreakdown.map((entry, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Activity Type</Label>
                    <Select 
                      value={entry.breakdown_type} 
                      onValueChange={(value) => updateBreakdownEntry(index, 'breakdown_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="setup">Setup</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="cleanup">Cleanup</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Hours</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={entry.hours}
                      onChange={(e) => updateBreakdownEntry(index, 'hours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={entry.start_time}
                      onChange={(e) => updateBreakdownEntry(index, 'start_time', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={entry.end_time}
                      onChange={(e) => updateBreakdownEntry(index, 'end_time', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Description of activity..."
                    value={entry.description}
                    onChange={(e) => updateBreakdownEntry(index, 'description', e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBreakdownEntry(index)}
                    disabled={hoursBreakdown.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addBreakdownEntry}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Activity
            </Button>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          Total calculated hours: {calculateTotalHours().toFixed(1)}
        </div>
        
        <Button 
          onClick={submitTimeEntry}
          disabled={loading || !selectedCrew || !selectedMember}
          size="lg"
        >
          {loading ? 'Submitting...' : 'Submit Time Entry'}
        </Button>
      </div>
    </div>
  );
};

export default TimeTracker;