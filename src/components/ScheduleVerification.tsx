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
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  Schedule
} from '@mui/icons-material';
import { format } from 'date-fns';
import { TimeEntry } from './TimeEntry';
import { Layout } from './Layout';
import { toast } from 'react-toastify';

export const ScheduleVerification = () => {
  const [showTimeEntry, setShowTimeEntry] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const st = location.state as any;
    if (st?.showSuccess) {
      setIsCompleted(true);
      toast.success('Schedule updated successfully!');
    }
  }, [location.state]);

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
      state: { memberHours }
    });
  };

  const handleDenySchedule = () => {
    setShowTimeEntry(true);
  };

  const handleTimeSubmit = (memberHours: { memberId: string; hours: number }[]) => {
    navigate('/additional-details', { 
      state: { memberHours }
    });
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