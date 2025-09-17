import { useState, useEffect, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
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
import Popover from '@mui/material/Popover';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  Edit
} from '@mui/icons-material';
import { TimeEntry } from './TimeEntry';
import { Layout } from './Layout';
import { toast } from 'react-toastify';
import { supabase } from '@/integrations/supabase/client';
import { useCrewData } from '@/hooks/useCrewData';
import { DEFAULT_SHIFT_END, DEFAULT_SHIFT_START } from '@/constants/crew';

const formatTime24Hour = (time: string | null | undefined) => {
  if (!time) return '';
  const trimmed = time.trim();

  const meridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (meridiemMatch) {
    const hours = parseInt(meridiemMatch[1], 10);
    const minutes = meridiemMatch[2];
    const period = meridiemMatch[3].toUpperCase();
    const normalizedHours = period === 'PM'
      ? (hours % 12) + 12
      : hours % 12;
    return `${normalizedHours.toString().padStart(2, '0')}:${minutes}`;
  }

  const standardMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (standardMatch) {
    const hours = parseInt(standardMatch[1], 10);
    const minutes = standardMatch[2];
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  return trimmed;
};

export const ScheduleVerification = () => {
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hasTimeEntries, setHasTimeEntries] = useState(false);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [hoursBreakdown, setHoursBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true to prevent flash
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { crewMembers, crewId, loggedInMember, isLoading: crewLoading, error: crewError } = useCrewData();
  const isBusy = loading || crewLoading;

  useEffect(() => {
    if (crewError) {
      console.error('Error loading crew data:', crewError);
      toast.error('Unable to load crew information.');
    }
  }, [crewError]);

  const checkExistingTimeEntries = useCallback(async (crewIdentifier: string) => {
    console.log('Checking existing time entries for date:', selectedDate.toISOString().split('T')[0]);
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
        .eq('crew_id', crewIdentifier);

      if (entriesError) {
        console.error('Error fetching time entries:', entriesError);
        setHasTimeEntries(false);
        setTimeEntries([]);
        setHoursBreakdown([]);
        return;
      }

      console.log('Found time entries:', entries?.length || 0);

      if (entries && entries.length > 0) {
        console.log('Setting hasTimeEntries to true');
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
        console.log('No time entries found, setting hasTimeEntries to false');
        setHasTimeEntries(false);
        setTimeEntries([]);
        setHoursBreakdown([]);
      }
    } catch (error) {
      console.error('Error checking time entries:', error);
      setHasTimeEntries(false);
      setTimeEntries([]);
      setHoursBreakdown([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Handle navigation state (success messages, refresh requests)
  useEffect(() => {
    const st = location.state as any;
    if (!crewId) return;

    if (st?.showSuccess) {
      setIsCompleted(true);
      toast.success('Schedule updated successfully!');
      window.history.replaceState({}, document.title);
      setTimeout(async () => {
        await checkExistingTimeEntries(crewId);
      }, 1000);
    }
    if (st?.refreshData) {
      setTimeout(async () => {
        await checkExistingTimeEntries(crewId);
      }, 500);
    }
  }, [location.state, crewId, checkExistingTimeEntries]);

  // Fetch time entries when date or crew changes
  useEffect(() => {
    if (!crewId) return;
    const fetchEntries = async () => {
      setLoading(true);
      await checkExistingTimeEntries(crewId);
    };
    fetchEntries();
  }, [selectedDate, crewId, checkExistingTimeEntries]);
  
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

  const handleDateButtonClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const getCrewMemberName = useCallback(
    (memberId: string) => crewMembers.find((member) => member.id === memberId)?.name ?? 'Unknown Member',
    [crewMembers]
  );

  const calculateScheduledHours = useCallback((start: string, end: string) => {
    if (!start || !end) return 0;
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    if (
      Number.isNaN(startHours) ||
      Number.isNaN(startMinutes) ||
      Number.isNaN(endHours) ||
      Number.isNaN(endMinutes)
    ) {
      return 0;
    }

    const totalStart = startHours * 60 + startMinutes;
    const totalEnd = endHours * 60 + endMinutes;
    const diff = totalEnd - totalStart;
    return diff > 0 ? diff / 60 : 0;
  }, []);

  const handleConfirmSchedule = () => {
    if (crewMembers.length === 0) {
      toast.error('Crew information is still loading. Please try again momentarily.');
      return;
    }

    const memberHours = crewMembers.map((member) => ({
      memberId: member.id,
      hours: calculateScheduledHours(member.scheduledStart, member.scheduledEnd),
    }));

    navigate('/additional-details', {
      state: { memberHours, editedIndividually: false },
    });
  };

  const handleDenySchedule = () => {
    setShowTimeEntry(true);
  };

  const handleUpdateHours = () => {
    setShowTimeEntry(true);
  };

  const primaryCrewMember = crewMembers[0];

  const handleTimeSubmit = (memberHours: { memberId: string; hours: number }[], editedIndividually: boolean) => {
    navigate('/additional-details', { 
      state: { memberHours, editedIndividually }
    });
  };

  // Add a small delay to ensure database operations complete before checking
  const refreshDataWithDelay = () => {
    if (!crewId) return;
    setTimeout(() => {
      checkExistingTimeEntries(crewId);
    }, 500);
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
              <Typography sx={{ color: 'var(--theme-base-text-secondary)' }}>
                Your work hours have been recorded. Thank you for updating your schedule.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Layout>
    );
  }

  if (showTimeEntry) {
    return (
      <TimeEntry
        onSubmit={handleTimeSubmit}
        onBack={() => setShowTimeEntry(false)}
        selectedDate={selectedDate}
        crewMembers={crewMembers}
        crewId={crewId}
      />
    );
  }

  console.log('Rendering with hasTimeEntries:', hasTimeEntries, 'showTimeEntry:', showTimeEntry);

  // Show completed hours overview if time entries exist
  if (hasTimeEntries && !showTimeEntry) {
    return (
      <Layout title="Time Tracking Overview">
        {/* Date Navigation - Sticky at top */}
        <Box sx={{ 
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          bgcolor: 'var(--theme-base-background-elevations-level-5)',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1,
          py: 2,
          flexShrink: 0
        }}>
          <IconButton 
            onClick={goToPreviousDay}
            size="small"
            sx={{ color: 'var(--theme-base-text-secondary)' }}
          >
            <ChevronLeft />
          </IconButton>
          
          <>
            <Button
              variant="text"
              startIcon={<CalendarToday />}
              onClick={handleDateButtonClick}
              sx={{ 
                color: 'var(--theme-base-text-secondary)',
                fontWeight: 'normal',
                textTransform: 'none'
              }}
            >
              {formatDate(selectedDate)}
            </Button>
            <Popover
              open={Boolean(datePickerAnchor)}
              anchorEl={datePickerAnchor}
              onClose={handleDatePickerClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              slotProps={{
                paper: {
                  sx: {
                    p: 2,
                    mt: 1,
                  },
                },
              }}
            >
              <DateCalendar
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setIsCompleted(false);
                    setShowTimeEntry(false);
                  }
                  handleDatePickerClose();
                }}
              />
            </Popover>
          </>
          
          <IconButton 
            onClick={goToNextDay}
            size="small"
            sx={{ color: 'var(--theme-base-text-secondary)' }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            pt: '24px',
            bgcolor: 'var(--theme-base-background-elevations-level-5)'
          }}
        >
          {loggedInMember && (
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: 'var(--theme-base-text-secondary)' }}
            >
              Logged in as {loggedInMember.name}
            </Typography>
          )}

          {/* Time Tracking Overview */}
         
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <CheckCircle sx={{ color: 'success.main' }} />
              <Typography variant="h5" fontWeight="semibold" color="text.primary">
                Today's Time Tracking Complete
              </Typography>
            </Box>
            
            {/* Summary Stats */}
            <Box sx={{ display: 'flex', gap: 4, mb: 3, justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {timeEntries.reduce((total, entry) => total + parseFloat(entry.hours_regular), 0).toFixed(1)}
                </Typography>
                <Typography variant="body1" fontWeight="medium" sx={{ color: 'var(--theme-base-text-secondary)' }}>
                  Total Hours Logged
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {timeEntries.length}
                </Typography>
                <Typography variant="body1" fontWeight="medium" sx={{ color: 'var(--theme-base-text-secondary)' }}>
                  Crew Members
                </Typography>
              </Box>
              {hoursBreakdown.length > 0 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {['working', 'traveling', 'standby'].filter(type => 
                      hoursBreakdown.some(b => b.breakdown_type === type)
                    ).length}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ color: 'var(--theme-base-text-secondary)' }}>
                    Hour Categories
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Crew Members and Hours */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
                Crew Members
              </Typography>
              {timeEntries.map((entry) => (
                <Paper key={entry.id} sx={{ 
                  bgcolor: 'var(--theme-base-background-elevations-highest)', 
                  p: 2, 
                  mb: 1,
                  borderRadius: 1
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium" color="text.primary">
                        {getCrewMemberName(entry.member_id)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--theme-base-text-secondary)' }}>
                        {formatTime24Hour(entry.start_time)} - {formatTime24Hour(entry.end_time)}
                      </Typography>
                      {entry.comments && (
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: 'italic', mt: 0.5, color: 'var(--theme-base-text-secondary)' }}
                        >
                          Note: {entry.comments}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="h6" color="text.primary" fontWeight="bold">
                      {entry.hours_regular.toFixed(1)}h
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Hours Breakdown */}
            {hoursBreakdown.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
                  Hours Breakdown
                </Typography>
                {['working', 'traveling', 'standby'].map(type => {
                  const typeBreakdowns = hoursBreakdown.filter(b => b.breakdown_type === type);
                  if (typeBreakdowns.length === 0) return null;
                  
                  const totalHours = typeBreakdowns.reduce((sum, b) => sum + parseFloat(b.hours), 0);
                  
                  return (
                    <Box key={type} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="body2"
                          sx={{ textTransform: 'capitalize', color: 'var(--theme-base-text-secondary)' }}
                        >
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
          

          {/* Secondary Update Button */}
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            startIcon={<Edit />}
            onClick={handleUpdateHours}
            sx={{ 
              py: 1.5,
              '& .MuiButton-startIcon': {
                marginRight: 1
              },
            }}
            disabled={isBusy}
          >
            Need to update today's hours?
          </Button>
        </Box>
      </Layout>
    );
  }

  // Show initial time entry interface when no entries exist
  console.log('Showing initial entry interface - no existing entries found');
  return (
    <Layout title="Schedule Verification">
        {/* Date Navigation - Sticky at top */}
        <Box sx={{ 
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          bgcolor: 'var(--theme-component-navigation-sidebar-background-fill)',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1,
          py: 2,
          flexShrink: 0
        }}>
          <IconButton 
            onClick={goToPreviousDay}
            size="small"
            sx={{ color: 'var(--theme-base-text-secondary)' }}
          >
            <ChevronLeft />
          </IconButton>
          
          <>
            <Button
              variant="text"
              startIcon={<CalendarToday />}
              onClick={handleDateButtonClick}
              sx={{ 
                color: 'text.primary',
                fontWeight: 'normal',
                textTransform: 'none'
              }}
            >
              {formatDate(selectedDate)}
            </Button>
            <Popover
              open={Boolean(datePickerAnchor)}
              anchorEl={datePickerAnchor}
              onClose={handleDatePickerClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              slotProps={{
                paper: {
                  sx: {
                    p: 2,
                    mt: 1,
                  },
                },
              }}
            >
              <DateCalendar
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setIsCompleted(false);
                    setShowTimeEntry(false);
                  }
                  handleDatePickerClose();
                }}
              />
            </Popover>
          </>
          
          <IconButton 
            onClick={goToNextDay}
            size="small"
            sx={{ color: 'var(--theme-base-text-secondary)' }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            pt: '24px',
            bgcolor: 'var(--theme-base-background-elevations-level-5)'
          }}
        >
          {loggedInMember && (
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: 'var(--theme-base-text-secondary)' }}
            >
              Logged in as {loggedInMember.name}
            </Typography>
          )}
          <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            textAlign="center" 
            color="text.primary" 
            fontWeight="medium"
            sx={{ mb: 3 }}
          >
            Did everyone work their scheduled hours today?
          </Typography>
          
          <Box sx={{ space: 1.5, mb: 3 }}>
            <Button 
              variant="contained"
              size="large"
              fullWidth
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleConfirmSchedule}
              sx={{ mb: 3, p:2 }}
              disabled={isBusy}
            >
              Correct. Submit the hours.
            </Button>
            
            <Button 
              variant="outlined"
              size="large"
              color="secondary"
              fullWidth
              startIcon={<Edit />}
              onClick={handleDenySchedule}
              disabled={isBusy}
            >
              I need to edit these hours.
            </Button>
          </Box>
        </Box>
{/* Scheduled Hours Overview */ }
        {crewMembers.length > 0 && (
          <Paper
            elevation={10}
            sx={{
              bgcolor: 'var(--theme-base-background-elevations-level-2)',
              p: 3,
              borderRadius: 2,
              boxShadow: 4,
            }}
          >
            <Typography variant="h6" fontWeight="semibold" color="text.primary" gutterBottom>
              Scheduled Hours
            </Typography>

            <Paper
              sx={{
                bgcolor: 'var(--theme-base-background-elevations-highest)',
                p: 2,
                mb: 2,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-base-text-secondary)' }}>Start Time:</Typography>
                  <Typography fontWeight="medium" color="text.primary">
                    {formatTime24Hour(primaryCrewMember?.scheduledStart ?? DEFAULT_SHIFT_START)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-base-text-secondary)' }}>End Time:</Typography>
                  <Typography fontWeight="medium" color="text.primary">
                    {formatTime24Hour(primaryCrewMember?.scheduledEnd ?? DEFAULT_SHIFT_END)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight="bold" sx={{ color: 'var(--theme-base-text-secondary)' }}>Total Hours:</Typography>
                <Typography fontWeight="bold" color="text.primary" variant="h6">
                  {calculateScheduledHours(
                    primaryCrewMember?.scheduledStart ?? DEFAULT_SHIFT_START,
                    primaryCrewMember?.scheduledEnd ?? DEFAULT_SHIFT_END
                  ).toFixed(1)}h
                </Typography>
              </Box>
            </Paper>

            <Box>
              <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
                Crew Members
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1,
                }}
              >
                {crewMembers.map((member) => (
                  <Chip
                    key={member.id}
                    label={member.name}
                    variant="outlined"
                    color={'primary'}
                    sx={{
                      backgroundColor: 'var(--core-lighthouse-colors-blues-slate-blue-100)',
                      justifyContent: 'flex-start',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        )}
        </Box>
      </Layout>
  );
};
