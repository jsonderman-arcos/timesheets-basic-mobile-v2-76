import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { Layout } from './Layout';
import { toast } from 'react-toastify';
import { supabase } from '@/integrations/supabase/client';

interface CrewMember {
  id: string;
  name: string;
  scheduledStart: string;
  scheduledEnd: string;
}

interface TimeEntryProps {
  onSubmit: (memberHours: { memberId: string; hours: number }[], editedIndividually: boolean) => void;
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

  const [timeEntries, setTimeEntries] = useState<Record<string, { startTime: string; endTime: string }>>({});
  const [loading, setLoading] = useState(true);

  const [editIndividually, setEditIndividually] = useState(false);
  const [groupTimes, setGroupTimes] = useState<{ startTime: string; endTime: string }>({
    startTime: '09:00',
    endTime: '17:00'
  });

  // Load existing time entries or initialize with scheduled times
  useEffect(() => {
    const loadTimeEntries = async () => {
      try {
        // Check if there are existing time entries for this date
        const { data: existingEntries, error } = await supabase
          .from('time_entries')
          .select('member_id, start_time, end_time')
          .eq('date', selectedDate.toISOString().split('T')[0])
          .eq('crew_id', '8685dabc-746e-4fe8-90a3-c41035c79dc0');

        if (error) {
          console.error('Error loading existing time entries:', error);
        }

        const entriesMap: Record<string, { startTime: string; endTime: string }> = {};
        
        // Initialize with existing entries or scheduled times
        crewMembers.forEach(member => {
          const existingEntry = existingEntries?.find(entry => entry.member_id === member.id);
          
          if (existingEntry) {
            // Use existing time entry
            entriesMap[member.id] = {
              startTime: existingEntry.start_time,
              endTime: existingEntry.end_time,
            };
          } else {
            // Use scheduled times as default
            entriesMap[member.id] = {
              startTime: convertTo24Hour(member.scheduledStart),
              endTime: convertTo24Hour(member.scheduledEnd),
            };
          }
        });

        setTimeEntries(entriesMap);
        
        // Set group times based on first member's times
        const firstMemberEntry = entriesMap[crewMembers[0]?.id];
        if (firstMemberEntry) {
          setGroupTimes({
            startTime: firstMemberEntry.startTime,
            endTime: firstMemberEntry.endTime,
          });
        }
      } catch (error) {
        console.error('Error in loadTimeEntries:', error);
        // Fallback to scheduled times
        const fallbackEntries = crewMembers.reduce((acc, member) => {
          acc[member.id] = {
            startTime: convertTo24Hour(member.scheduledStart),
            endTime: convertTo24Hour(member.scheduledEnd),
          };
          return acc;
        }, {} as Record<string, { startTime: string; endTime: string }>);
        setTimeEntries(fallbackEntries);
      } finally {
        setLoading(false);
      }
    };

    loadTimeEntries();
  }, [selectedDate, crewMembers]);

  const updateTimeEntry = (crewId: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeEntries(prev => ({
      ...prev,
      [crewId]: {
        ...prev[crewId],
        [field]: value
      }
    }));
  };

  const updateAllEntries = (field: 'startTime' | 'endTime', value: string) => {
    setGroupTimes(prev => ({ ...prev, [field]: value }));
    
    const updatedEntries: Record<string, { startTime: string; endTime: string }> = {};
    crewMembers.forEach(member => {
      updatedEntries[member.id] = {
        ...timeEntries[member.id],
        [field]: value
      };
    });
    setTimeEntries(updatedEntries);
  };

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
    return Math.max(0, (endMinutes - startMinutes) / 60);
  };

  const handleSubmit = async () => {
    // Validate all entries
    const allValid = crewMembers.every(member => {
      const entry = timeEntries[member.id];
      return entry && entry.startTime && entry.endTime && entry.startTime < entry.endTime;
    });

    if (!allValid) {
      toast.error('Please ensure all times are valid and end time is after start time.');
      return;
    }

    try {
      // Prepare member hours data with real crew member IDs
      const memberHours = crewMembers.map(member => {
        const entry = timeEntries[member.id];
        if (!entry) {
          throw new Error(`No time entry found for member ${member.name}`);
        }
        const hours = calculateHours(entry.startTime, entry.endTime);
        return {
          memberId: member.id,
          hours,
          startTime: entry.startTime,
          endTime: entry.endTime
        };
      });

      // Save to database using the real crew_id
      const timeEntryInserts = memberHours.map(memberData => ({
        date: selectedDate.toISOString().split('T')[0],
        start_time: memberData.startTime,
        end_time: memberData.endTime,
        hours_regular: memberData.hours,
        crew_id: '8685dabc-746e-4fe8-90a3-c41035c79dc0', // Use the real crew_id from database
        member_id: memberData.memberId, // Use the real member_id
        status: 'submitted'
      }));

      const { error } = await supabase
        .from('time_entries')
        .insert(timeEntryInserts);

      if (error) {
        console.error('Error saving time entries:', error);
        toast.error('Failed to save time entries. Please try again.');
        return;
      }

      toast.success('Time entries saved successfully!');
      onSubmit(memberHours.map(m => ({ memberId: m.memberId, hours: m.hours })), editIndividually);
    } catch (error) {
      console.error('Error saving time entries:', error);
      toast.error('Failed to save time entries. Please try again.');
    }
  };

  const isValid = crewMembers.every(member => {
    const entry = timeEntries[member.id];
    return entry && entry.startTime && entry.endTime && entry.startTime < entry.endTime;
  });

  if (loading) {
    return (
      <Layout title="Edit Work Hours" onBack={onBack}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography>Loading existing time entries...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Work Hours" onBack={onBack}>
      <Box sx={{ p: 2 }}>
        <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={editIndividually}
                  onChange={(e) => setEditIndividually(e.target.checked)}
                />
              }
              label="Edit individual times"
              sx={{ mb: 2 }}
            />
          </CardContent>
        </Card>

        {!editIndividually ? (
          <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Group Time Entry
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={groupTimes.startTime}
                  onChange={(e) => updateAllEntries('startTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="End Time"
                  type="time"
                  value={groupTimes.endTime}
                  onChange={(e) => updateAllEntries('endTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Hours: {calculateHours(groupTimes.startTime, groupTimes.endTime).toFixed(1)} per person
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ space: 1 }}>
            {crewMembers.map((member) => (
              <Card key={member.id} sx={{ mb: 1, bgcolor: 'background.paper' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {member.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <TextField
                      label="Start Time"
                      type="time"
                      size="small"
                      value={timeEntries[member.id]?.startTime || ''}
                      onChange={(e) => updateTimeEntry(member.id, 'startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="End Time"
                      type="time"
                      size="small"
                      value={timeEntries[member.id]?.endTime || ''}
                      onChange={(e) => updateTimeEntry(member.id, 'endTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Hours: {calculateHours(
                      timeEntries[member.id]?.startTime || '',
                      timeEntries[member.id]?.endTime || ''
                    ).toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          startIcon={<Save />}
          onClick={handleSubmit}
          disabled={!isValid}
          size="large"
          sx={{ 
            mt: 2,
            py: 1.5,
            textTransform: 'none'
          }}
        >
          Save Time Entries
        </Button>
      </Box>
    </Layout>
  );
};