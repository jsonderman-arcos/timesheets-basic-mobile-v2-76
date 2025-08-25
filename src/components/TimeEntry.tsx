import { useState } from 'react';
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
    return {
      startTime: convertTo24Hour(first.scheduledStart),
      endTime: convertTo24Hour(first.scheduledEnd),
    };
  });

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

  const handleSubmit = () => {
    // Validate all entries
    const allValid = crewMembers.every(member => {
      const entry = timeEntries[member.id];
      return entry.startTime && entry.endTime && entry.startTime < entry.endTime;
    });

    if (allValid) {
      toast.success('Time entries saved successfully!');
      onSubmit();
    } else {
      toast.error('Please ensure all times are valid and end time is after start time.');
    }
  };

  const isValid = crewMembers.every(member => {
    const entry = timeEntries[member.id];
    return entry.startTime && entry.endTime && entry.startTime < entry.endTime;
  });

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
                Total: {calculateHours(groupTimes.startTime, groupTimes.endTime).toFixed(1)} hours
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
                    Total: {calculateHours(
                      timeEntries[member.id]?.startTime || '',
                      timeEntries[member.id]?.endTime || ''
                    ).toFixed(1)} hours
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