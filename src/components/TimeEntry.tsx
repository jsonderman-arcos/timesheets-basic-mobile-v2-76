import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format, isValid } from 'date-fns';
import { Layout } from './Layout';
import { toast } from 'react-toastify';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_SHIFT_END, DEFAULT_SHIFT_START } from '@/constants/crew';

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
  crewId: string | null;
}

export const TimeEntry = ({ onSubmit, onBack, selectedDate, crewMembers, crewId }: TimeEntryProps) => {
  const convertTo24Hour = (time12h: string) => {
    if (!time12h) return '';
    const match = time12h
      .trim()
      .toUpperCase()
      .match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/);

    if (!match) {
      return time12h;
    }

    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3];

    const normalizedHours = period === 'PM'
      ? (hours % 12) + 12
      : period === 'AM'
        ? hours % 12
        : hours;

    return `${normalizedHours.toString().padStart(2, '0')}:${minutes}`;
  };

  const normalizeTo24Hour = (time: string) => {
    if (!time) return '';
    const trimmed = time.trim();
    if (/\b(AM|PM)\b/i.test(trimmed)) {
      return convertTo24Hour(trimmed.toUpperCase());
    }
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2];
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    return trimmed;
  };

  const [timeEntries, setTimeEntries] = useState<Record<string, { startTime: string; endTime: string }>>({});
  const [loading, setLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [notes, setNotes] = useState('');

  const [editIndividually, setEditIndividually] = useState(false);
  const [groupTimes, setGroupTimes] = useState<{ startTime: string; endTime: string }>({
    startTime: DEFAULT_SHIFT_START,
    endTime: DEFAULT_SHIFT_END,
  });

  const buildDefaultEntries = () => crewMembers.reduce((acc, member) => {
    acc[member.id] = {
      startTime: normalizeTo24Hour(member.scheduledStart),
      endTime: normalizeTo24Hour(member.scheduledEnd),
    };
    return acc;
  }, {} as Record<string, { startTime: string; endTime: string }>);

  // Load existing time entries or initialize with scheduled times
  useEffect(() => {
    const loadTimeEntries = async () => {
      setLoading(true);

      if (crewMembers.length === 0) {
        setTimeEntries({});
        setLoading(false);
        return;
      }

      if (!crewId) {
        const fallbackEntries = buildDefaultEntries();
        setTimeEntries(fallbackEntries);
        const firstMemberEntry = fallbackEntries[crewMembers[0]?.id ?? ''];
        if (firstMemberEntry) {
          setGroupTimes({
            startTime: firstMemberEntry.startTime,
            endTime: firstMemberEntry.endTime,
          });
        }
        setLoading(false);
        return;
      }

      try {
        const { data: existingEntries, error } = await supabase
          .from('time_entries')
          .select('member_id, start_time, end_time, comments')
          .eq('date', selectedDate.toISOString().split('T')[0])
          .eq('crew_id', crewId);

        if (error) {
          console.error('Error loading existing time entries:', error);
        }

        const entriesMap = buildDefaultEntries();
        const hasData = existingEntries && existingEntries.length > 0;
        setHasExistingData(hasData);

        crewMembers.forEach((member) => {
          const existingEntry = existingEntries?.find((entry) => entry.member_id === member.id);

          if (existingEntry) {
            entriesMap[member.id] = {
              startTime: normalizeTo24Hour(existingEntry.start_time),
              endTime: normalizeTo24Hour(existingEntry.end_time),
            };
            if (existingEntry.comments) {
              setNotes(existingEntry.comments);
            }
          }
        });

        setTimeEntries(entriesMap);

        const firstMemberEntry = entriesMap[crewMembers[0]?.id ?? ''];
        if (firstMemberEntry) {
          setGroupTimes({
            startTime: firstMemberEntry.startTime,
            endTime: firstMemberEntry.endTime,
          });
        }
      } catch (error) {
        console.error('Error in loadTimeEntries:', error);
        const fallbackEntries = buildDefaultEntries();
        setTimeEntries(fallbackEntries);
      } finally {
        setLoading(false);
      }
    };

    loadTimeEntries();
  }, [selectedDate, crewMembers, crewId]);

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

  const parseTimeStringToDate = (time: string) => {
    if (!time) return null;
    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }
    const baseDate = new Date(selectedDate);
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  };

  const formatPickerValue = (value: Date | null) => {
    if (!value || !value.getTime || isNaN(value.getTime())) {
      return '';
    }
    return format(value, 'HH:mm');
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

    if (!crewId) {
      toast.error('Crew information is unavailable. Please try again later.');
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

      const selectedDateStr = selectedDate.toISOString().split('T')[0];

      // Check if entries already exist for the crew on this date
      const { data: existingEntries } = await supabase
        .from('time_entries')
        .select('id, member_id')
        .eq('date', selectedDateStr)
        .eq('crew_id', crewId);

      const existingMemberIds = existingEntries?.map(entry => entry.member_id) || [];
      
      // Separate new and existing entries
      const newEntries = memberHours
        .filter(({ memberId }) => !existingMemberIds.includes(memberId))
        .map(memberData => ({
          date: selectedDateStr,
          start_time: memberData.startTime,
          end_time: memberData.endTime,
          hours_regular: memberData.hours,
          crew_id: crewId,
          member_id: memberData.memberId,
          status: 'submitted',
          comments: notes,
          submitted_at: new Date().toISOString(),
          submitted_by: crewId
        }));

      const updateMemberIds = memberHours
        .filter(({ memberId }) => existingMemberIds.includes(memberId))
        .map(({ memberId }) => memberId);

      // Insert new entries if any
      if (newEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('time_entries')
          .insert(newEntries);
        
        if (insertError) {
          console.error('Error inserting time entries:', insertError);
          toast.error('Failed to save new time entries. Please try again.');
          return;
        }
      }

      // Update existing entries if any
      if (updateMemberIds.length > 0) {
        for (const memberId of updateMemberIds) {
          const memberData = memberHours.find(m => m.memberId === memberId);
          if (memberData) {
            const { error: updateError } = await supabase
              .from('time_entries')
              .update({ 
                comments: notes,
                start_time: memberData.startTime,
                end_time: memberData.endTime,
                hours_regular: memberData.hours,
                submitted_at: new Date().toISOString(),
                submitted_by: crewId
              })
              .eq('member_id', memberId)
              .eq('date', selectedDateStr)
              .eq('crew_id', crewId);
              
            if (updateError) {
              console.error('Error updating time entry:', updateError);
              toast.error('Failed to update existing time entries. Please try again.');
              return;
            }
          }
        }
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
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            bgcolor: 'var(--theme-base-background-elevations-level-highest)',
            borderRadius: 2,
          }}
        >
          <Typography>Loading existing time entries...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Work Hours" onBack={onBack}>
      <Box
        sx={{
          p: 2,
          bgcolor: 'var(--theme-base-background-elevations-level-highest)',
          borderRadius: 2,
        }}
      >

            <Typography variant="h6" gutterBottom>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {hasExistingData && (
                <Typography variant="subtitle2" sx={{ color: 'var(--theme-base-text-secondary)', fontWeight: 'normal' }}>
                  Submitted Hours
                </Typography>
              )}
              {!hasExistingData && (
                <Typography variant="subtitle2" sx={{ color: 'var(--theme-base-text-secondary)', fontWeight: 'normal' }}>
                  Scheduled Hours
                </Typography>
              )}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={editIndividually}
                  onChange={(e) => setEditIndividually(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-thumb': {
                      backgroundColor: 'var(--core-lighthouse-colors-neutrals-gray-300)'
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'var(--theme-base-text-default)',
                      opacity: 0.4
                    },
                    '&.Mui-checked .MuiSwitch-thumb': {
                      backgroundColor: 'var(--core-lighthouse-colors-neutrals-gray-300)'
                    },
                    '&.Mui-checked .MuiSwitch-track': {
                      backgroundColor: 'var(--theme-base-text-default)',
                      opacity: 0.6
                    }
                  }}
                />
              }
              label="Edit individual times"
              sx={{ mb: 2 }}
            />


        {!editIndividually ? (
          <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Group Time Entry
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TimePicker
                  label="Start Time"
                  ampm={false}
                  minutesStep={5}
                  value={parseTimeStringToDate(groupTimes.startTime)}
                  onChange={(date) => updateAllEntries('startTime', formatPickerValue(date))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputLabelProps: { shrink: true }
                    }
                  }}
                />
                <TimePicker
                  label="End Time"
                  ampm={false}
                  minutesStep={5}
                  value={parseTimeStringToDate(groupTimes.endTime)}
                  onChange={(date) => updateAllEntries('endTime', formatPickerValue(date))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputLabelProps: { shrink: true }
                    }
                  }}
                />
              </Box>
          <Typography variant="body2" sx={{ color: 'var(--theme-base-text-secondary)' }}>
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
                    <TimePicker
                      label="Start Time"
                      ampm={false}
                      minutesStep={5}
                      value={parseTimeStringToDate(timeEntries[member.id]?.startTime || '')}
                      onChange={(date) => updateTimeEntry(member.id, 'startTime', formatPickerValue(date))}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          InputLabelProps: { shrink: true }
                        }
                      }}
                    />
                    <TimePicker
                      label="End Time"
                      ampm={false}
                      minutesStep={5}
                      value={parseTimeStringToDate(timeEntries[member.id]?.endTime || '')}
                      onChange={(date) => updateTimeEntry(member.id, 'endTime', formatPickerValue(date))}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          InputLabelProps: { shrink: true }
                        }
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--theme-base-text-secondary)' }}
                  >
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

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Notes
          </Typography>
          <Box 
            component="textarea"
            value={notes}
            onChange={(e: any) => setNotes(e.target.value)}
            placeholder="Add any notes about this timesheet..."
            sx={{
              width: '100%',
              minHeight: '80px',
              p: 1.5,
              border: '1px solid',
              borderColor: 'var(--theme-base-border-default)',
              borderRadius: 1,
              bgcolor: 'background.paper',
              color: 'var(--theme-base-text-default)',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'vertical',
              '&:focus': {
                outline: 'none',
                borderColor: 'var(--theme-base-border-focused)'
              }
            }}
          />
        </Box>

        {!hasExistingData && (
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
        )}
      </Box>
    </Layout>
  );
};
