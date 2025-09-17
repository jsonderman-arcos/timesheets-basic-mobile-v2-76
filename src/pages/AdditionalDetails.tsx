import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  FormControlLabel,
  Switch
} from "@mui/material";
import { format } from 'date-fns';
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { toast } from 'react-toastify';
import { supabase } from '@/integrations/supabase/client';
import { useCrewData } from '@/hooks/useCrewData';

type MemberHour = {
  memberId: string;
  hours: number;
};

const DEFAULT_START_TIME = '08:00:00';

const computeEndTimeFromHours = (startTime: string, hours: number) => {
  const [startHourStr, startMinuteStr] = startTime.split(':');
  const startHour = parseInt(startHourStr, 10);
  const startMinute = parseInt(startMinuteStr, 10);
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = startTotalMinutes + totalMinutes;
  const endHour = Math.floor(endTotalMinutes / 60) % 24;
  const endMinute = endTotalMinutes % 60;
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
};

const AdditionalDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { crewMembers, crewId } = useCrewData();

  const selectedDateParam = location.state?.selectedDate as string | Date | undefined;
  const selectedDate = selectedDateParam ? new Date(selectedDateParam) : new Date();
  const resolvedDate = Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate;
  const selectedDateKey = format(resolvedDate, 'yyyy-MM-dd');
  
  const memberHours = (location.state?.memberHours as MemberHour[] | undefined) ?? [];
  const initialNotes = typeof location.state?.notes === 'string' ? location.state.notes : '';
  
  const [editedIndividually, setEditedIndividually] = useState(false);
  
  const totalHours = editedIndividually 
    ? memberHours.reduce((total, member) => total + member.hours, 0)
    : (memberHours.length > 0 ? memberHours[0].hours : 8);
  
  console.log('Member hours received:', memberHours, 'Edited individually:', editedIndividually, 'Total hours:', totalHours);
  
  const [memberBreakdowns, setMemberBreakdowns] = useState<Record<string, {
    workingHours: string;
    travelingHours: string;
    standbyHours: string;
  }>>({});
  
  const [totalWorkingHours, setTotalWorkingHours] = useState('');
  const [totalTravelingHours, setTotalTravelingHours] = useState('');
  const [totalStandbyHours, setTotalStandbyHours] = useState('');
  
  const [notes, setNotes] = useState(initialNotes);

  const getCrewMemberName = (memberId: string) =>
    crewMembers.find((member) => member.id === memberId)?.name ?? 'Unknown Member';
  
  const handleBack = () => navigate("/");
  
  const handleSubmit = async () => {
    if (editedIndividually) {
      const invalidMembers = memberHours.filter((member) => {
        const breakdown = memberBreakdowns[member.memberId] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
        const totalCategorized = parseFloat(breakdown.workingHours || '0') +
          parseFloat(breakdown.travelingHours || '0') +
          parseFloat(breakdown.standbyHours || '0');
        return totalCategorized > member.hours;
      });

      if (invalidMembers.length > 0) {
        toast.error('Some crew members have categorized hours exceeding their logged hours');
        return;
      }
    } else {
      const totalCategorized = parseFloat(totalWorkingHours || '0') +
        parseFloat(totalTravelingHours || '0') +
        parseFloat(totalStandbyHours || '0');

      if (totalCategorized > totalHours) {
        toast.error(`Total categorized hours (${totalCategorized}) cannot exceed total logged hours (${totalHours})`);
        return;
      }
    }

    if (!crewId || !crewMembers.length) {
      toast.error('Crew information is unavailable. Please try again later.');
      return;
    }

    if (memberHours.length === 0) {
      toast.error('No time entries were provided. Please log hours before adding details.');
      return;
    }

    try {
      const dateForEntries = selectedDateKey;
      const trimmedNotes = notes.trim();
      const breakdownInserts: any[] = [];
      const timeEntryMap: Record<string, string> = {};

      for (const member of memberHours) {
        const { data: existingEntries, error: existingError } = await supabase
          .from('time_entries')
          .select('id')
          .eq('member_id', member.memberId)
          .eq('date', dateForEntries)
          .eq('crew_id', crewId)
          .limit(1);

        if (existingError) {
          console.error('Error locating time entry:', existingError);
          toast.error('Failed to locate time entries. Please try again.');
          return;
        }

        const existingEntry = existingEntries?.[0];

        if (existingEntry) {
          timeEntryMap[member.memberId] = existingEntry.id;
        } else {
          const endTime = computeEndTimeFromHours(DEFAULT_START_TIME, member.hours);
          const { data: createdEntry, error: createError } = await supabase
            .from('time_entries')
            .insert({
              crew_id: crewId,
              member_id: member.memberId,
              date: dateForEntries,
              start_time: DEFAULT_START_TIME,
              end_time: endTime,
              hours_regular: member.hours,
              status: 'submitted',
              comments: trimmedNotes || null,
              submitted_by: crewId,
              submitted_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (createError || !createdEntry) {
            console.error('Error creating time entry:', createError);
            toast.error('Failed to create time entries. Please try again.');
            return;
          }

          timeEntryMap[member.memberId] = createdEntry.id;
        }
      }

      if (editedIndividually) {
        for (const member of memberHours) {
          const breakdown = memberBreakdowns[member.memberId] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
          const timeEntryId = timeEntryMap[member.memberId];
          const working = parseFloat(breakdown.workingHours || '0');
          const traveling = parseFloat(breakdown.travelingHours || '0');
          const standby = parseFloat(breakdown.standbyHours || '0');

          if (working > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryId,
              member_id: member.memberId,
              breakdown_type: 'working',
              hours: working,
              description: trimmedNotes || null
            });
          }
          if (traveling > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryId,
              member_id: member.memberId,
              breakdown_type: 'traveling',
              hours: traveling,
              description: trimmedNotes || null
            });
          }
          if (standby > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryId,
              member_id: member.memberId,
              breakdown_type: 'standby',
              hours: standby,
              description: trimmedNotes || null
            });
          }
        }
      } else {
        const working = parseFloat(totalWorkingHours || '0');
        const traveling = parseFloat(totalTravelingHours || '0');
        const standby = parseFloat(totalStandbyHours || '0');

        memberHours.forEach((member) => {
          const timeEntryId = timeEntryMap[member.memberId];

          if (working > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryId,
              member_id: member.memberId,
              breakdown_type: 'working',
              hours: working,
              description: trimmedNotes || null
            });
          }
          if (traveling > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryId,
              member_id: member.memberId,
              breakdown_type: 'traveling',
              hours: traveling,
              description: trimmedNotes || null
            });
          }
          if (standby > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryId,
              member_id: member.memberId,
              breakdown_type: 'standby',
              hours: standby,
              description: trimmedNotes || null
            });
          }
        });
      }

      if (breakdownInserts.length > 0) {
        const { error: breakdownError } = await supabase
          .from('hours_breakdown')
          .insert(breakdownInserts);

        if (breakdownError) {
          console.error('Error saving hours breakdown:', breakdownError);
          toast.error('Failed to save hours breakdown. Please try again.');
          return;
        }
      }

      const memberIds = memberHours.map((member) => member.memberId);
      const { error: notesError } = await supabase
        .from('time_entries')
        .update({ comments: trimmedNotes || null })
        .eq('date', dateForEntries)
        .eq('crew_id', crewId)
        .in('member_id', memberIds);

      if (notesError) {
        console.error('Error updating time entry notes:', notesError);
        toast.error('Failed to update time entry notes. Please try again.');
        return;
      }

      toast.success("Details submitted successfully!");
      navigate("/", { 
        state: { showSuccess: true, refreshData: true }
      });
    } catch (error) {
      console.error('Error saving additional details:', error);
      toast.error('Failed to save additional details. Please try again.');
    }
  };

  const updateMemberBreakdown = (memberId: string, field: 'workingHours' | 'travelingHours' | 'standbyHours', value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setMemberBreakdowns(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId] || { workingHours: '', travelingHours: '', standbyHours: '' },
        [field]: cleanValue
      }
    }));
  };

  const getMemberTotalCategorized = (memberId: string) => {
    const breakdown = memberBreakdowns[memberId] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
    return parseFloat(breakdown.workingHours || '0') + 
           parseFloat(breakdown.travelingHours || '0') + 
           parseFloat(breakdown.standbyHours || '0');
  };

  const getMemberRemainingHours = (member: MemberHour) => {
    return Math.max(0, member.hours - getMemberTotalCategorized(member.memberId));
  };

  const isMemberOverLimit = (member: MemberHour) => {
    return getMemberTotalCategorized(member.memberId) > member.hours;
  };

  const getTotalCategorized = () => {
    return parseFloat(totalWorkingHours || '0') + 
           parseFloat(totalTravelingHours || '0') + 
           parseFloat(totalStandbyHours || '0');
  };

  const getRemainingHours = () => {
    return Math.max(0, totalHours - getTotalCategorized());
  };

  const isOverLimit = getTotalCategorized() > totalHours;

  return (
    <Layout title="Additional Details" onBack={handleBack}>
      <Helmet>
        <title>Additional Details | Notes</title>
        <meta name="description" content="Add notes and additional details for the crew's schedule verification." />
        <link rel="canonical" href="/additional-details" />
      </Helmet>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
        <Card sx={{ 
          width: '100%', 
          maxWidth: 400,
          bgcolor: 'background.paper',
          boxShadow: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedIndividually}
                  onChange={(e) => setEditedIndividually(e.target.checked)}
                />
              }
              label="Edit individual times"
              sx={{ mb: 2 }}
            />

            {editedIndividually ? (
              <Box sx={{ space: 1 }}>
                {memberHours.length > 0 ? (
                  memberHours.map((member) => (
                    <Card key={member.memberId} sx={{ mb: 1, bgcolor: 'white' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {getCrewMemberName(member.memberId)} - {member.hours.toFixed(1)} hours
                        </Typography>
                        <Typography
