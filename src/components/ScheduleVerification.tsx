import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  Schedule,
  Edit
} from '@mui/icons-material';
import { format } from 'date-fns';
import { TimeEntry } from './TimeEntry';
import { Layout } from './Layout';
import { toast } from 'react-toastify';
import { supabase } from '@/integrations/supabase/client';

export const ScheduleVerification = () => {
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hasTimeEntries, setHasTimeEntries] = useState(false);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [hoursBreakdown, setHoursBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const st = location.state as any;
    if (st?.showSuccess) {
      setIsCompleted(true);
      toast.success('Schedule updated successfully!');
    }
  }, [location.state]);

  // Check for existing time entries when date changes
  useEffect(() => {
    checkExistingTimeEntries();
  }, [selectedDate]);

  const checkExistingTimeEntries = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Check for time entries for this date
      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select(`
          *,
          crew_members!inner(name)
        `)
        .eq('date', dateStr)
        .eq('crew_id', '8685dabc-746e-4fe8-90a3-c41035c79dc0');

      if (entriesError) {
        console.error('Error fetching time entries:', entriesError);
        setHasTimeEntries(false);
        setTimeEntries([]);
        setHoursBreakdown([]);
        setLoading(false);
        return;
      }

      if (entries && entries.length > 0) {
        setHasTimeEntries(true);
        setTimeEntries(entries);

        // Fetch hours breakdown for these time entries
        const { data: breakdown, error: breakdownError } = await supabase
          .from('hours_breakdown')
          .select('*')
          .in('time_entry_id', entries.map(e => e.id));

        if (!breakdownError && breakdown) {
          setHoursBreakdown(breakdown);
        }
      } else {
        setHasTimeEntries(false);
        setTimeEntries([]);
        setHoursBreakdown([]);
      }
    } catch (error) {
      console.error('Error checking time entries:', error);
      setHasTimeEntries(false);
    } finally {
      setLoading(false);
    }
  };

  // Use real crew member IDs from the database
  const crewMembers = [
    { id: '3751647d-f0ae-4d62-a0a1-9a0bd3dbc2b1', name: 'David Brown', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: '47e34e83-b887-4d79-82a9-ffc1f63f5e17', name: 'John Smith', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: 'c648a699-cf2a-4ac7-bce8-19883a0db42b', name: 'Mike Johnson', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
    { id: '54704459-cf20-4137-9f6c-0c58ab8ac8b9', name: 'Sarah Williams', scheduledStart: '9:00 AM', scheduledEnd: '5:00 PM' },
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

  const handleConfirmSchedule = () => {
    // Calculate individual member hours (all scheduled for 8 hours)
    const memberHours = crewMembers.map(member => ({
      memberId: member.id,
      hours: 8
    }));
    navigate('/additional-details', { 
      state: { memberHours, editedIndividually: false }
    });
  };

  const handleDenySchedule = () => {
    setShowTimeEntry(true);
  };

  const handleUpdateHours = () => {
    setShowTimeEntry(true);
  };

  const getCrewMemberName = (memberId: string) => {
    switch (memberId) {
      case '3751647d-f0ae-4d62-a0a1-9a0bd3dbc2b1': return 'David Brown';
      case '47e34e83-b887-4d79-82a9-ffc1f63f5e17': return 'John Smith';
      case 'c648a699-cf2a-4ac7-bce8-19883a0db42b': return 'Mike Johnson';
      case '54704459-cf20-4137-9f6c-0c58ab8ac8b9': return 'Sarah Williams';
      default: return 'Unknown Member';
    }
  };

  const handleTimeSubmit = (memberHours: { memberId: string; hours: number }[], editedIndividually: boolean) => {
    // Refresh the data after time entry submission
    checkExistingTimeEntries();
    setShowTimeEntry(false);
  };

  if (isCompleted) {
    return (
      <Layout title="Schedule Verification">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100%', 
          p: 2 
        }}>
          <Card sx={{ 
            width: '100%', 
            maxWidth: 400,
            textAlign: 'center',
            bgcolor: 'background.paper',
            boxShadow: 3
          }}>
            <CardContent sx={{ p: 4 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                All Set!
              </Typography>
              <Typography color="text.secondary">
                Your work hours have been recorded. Thank you for updating your schedule.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Layout>
    );
  }

  if (showTimeEntry) {
    return <TimeEntry onSubmit={handleTimeSubmit} onBack={() => setShowTimeEntry(false)} selectedDate={selectedDate} crewMembers={crewMembers} />;
  }

  // Show completed hours view if time entries exist
  if (hasTimeEntries) {
    return (
      <Layout title="Schedule Verification">
        <Box sx={{ p: 2 }}>
          {/* Date Navigation */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1, 
            mb: 3 
          }}>
            <IconButton 
              onClick={goToPreviousDay}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <ChevronLeft />
            </IconButton>
            
            <Button
              variant="text"
              startIcon={<CalendarToday />}
              sx={{ 
                color: 'text.primary',
                fontWeight: 'normal',
                textTransform: 'none'
              }}
            >
              {formatDate(selectedDate)}
            </Button>
            
            <IconButton 
              onClick={goToNextDay}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Completed Hours Display */}
          <Paper sx={{ 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircle sx={{ color: 'success.main' }} />
              <Typography variant="h6" fontWeight="semibold" color="text.primary">
                Hours Logged
              </Typography>
            </Box>
            
            {/* Crew Members and Hours */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
                Crew Members ({timeEntries.length})
              </Typography>
              {timeEntries.map((entry) => (
                <Paper key={entry.id} sx={{ 
                  bgcolor: 'background.default', 
                  p: 2, 
                  mb: 1,
                  borderRadius: 1
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium" color="text.primary">
                        {getCrewMemberName(entry.member_id)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.start_time} - {entry.end_time}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="text.primary">
                      {entry.hours_regular.toFixed(1)}h
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Hours Breakdown */}
            {hoursBreakdown.length > 0 && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
                  Hours Breakdown
                </Typography>
                {['working', 'traveling', 'standby'].map(type => {
                  const typeBreakdowns = hoursBreakdown.filter(b => b.breakdown_type === type);
                  if (typeBreakdowns.length === 0) return null;
                  
                  const totalHours = typeBreakdowns.reduce((sum, b) => sum + parseFloat(b.hours), 0);
                  
                  return (
                    <Box key={type} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {type}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                          {totalHours.toFixed(1)}h
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* Update Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Edit />}
            onClick={handleUpdateHours}
            sx={{ 
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            I need to update today's hours
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Schedule Verification">
      <Box sx={{ p: 2, space: 3 }}>
        {/* Date Navigation */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1, 
          mb: 3 
        }}>
          <IconButton 
            onClick={goToPreviousDay}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ChevronLeft />
          </IconButton>
          
          <Button
            variant="text"
            startIcon={<CalendarToday />}
            sx={{ 
              color: 'text.primary',
              fontWeight: 'normal',
              textTransform: 'none'
            }}
          >
            {formatDate(selectedDate)}
          </Button>
          
          <IconButton 
            onClick={goToNextDay}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        <Box sx={{ space: 2 }}>
          <Typography 
            variant="body1" 
            textAlign="center" 
            color="text.primary" 
            fontWeight="medium"
            sx={{ mb: 3 }}
          >
            Did everyone work their scheduled hours on this day?
          </Typography>
          
          <Box sx={{ space: 1.5, mb: 3 }}>
            <Button 
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={<CheckCircle />}
              onClick={handleConfirmSchedule}
              sx={{ 
                mb: 1.5,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Yes, everyone worked scheduled hours
            </Button>
            
            <Button 
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<Cancel />}
              onClick={handleDenySchedule}
              sx={{ 
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              No, need to edit hours
            </Button>
          </Box>
        </Box>

        <Paper sx={{ 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: 2,
          border: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6" fontWeight="semibold" color="text.primary" gutterBottom>
            Scheduled Hours
          </Typography>
          
          <Paper sx={{ 
            bgcolor: 'background.default', 
            p: 2, 
            mb: 2,
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Start Time:</Typography>
                  <Typography fontWeight="medium" color="text.primary">
                    {crewMembers[0].scheduledStart}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">End Time:</Typography>
                  <Typography fontWeight="medium" color="text.primary">
                    {crewMembers[0].scheduledEnd}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ 
              borderTop: 1, 
              borderColor: 'divider', 
              pt: 1, 
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography color="text.secondary">Total Hours:</Typography>
              <Typography fontWeight="bold" color="text.primary">8 hours</Typography>
            </Box>
          </Paper>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
              Crew Members
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 1 
            }}>
              {crewMembers.map((member) => (
                <Chip
                  key={member.id}
                  label={member.name}
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'background.default',
                    justifyContent: 'flex-start'
                  }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};