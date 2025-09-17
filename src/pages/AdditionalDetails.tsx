import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
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
      const timeEntryIdByMember: Record<string, string> = {};
      const memberHoursMap = new Map(memberHours.map((member) => [member.memberId, member.hours]));
      const memberIds = memberHours.map((member) => member.memberId);

      const { data: existingEntries, error: existingEntriesError } = await supabase
        .from('time_entries')
        .select('id, member_id')
        .eq('date', dateForEntries)
        .eq('crew_id', crewId)
        .in('member_id', memberIds);

      if (existingEntriesError) {
        console.error('Error fetching existing time entries:', existingEntriesError);
        toast.error('Failed to load existing time entries. Please try again.');
        return;
      }

      const existingEntryMap = new Map<string, string>(
        (existingEntries ?? []).map((entry) => [entry.member_id, entry.id])
      );

      const groupWorking = parseFloat(totalWorkingHours || '0');
      const groupTraveling = parseFloat(totalTravelingHours || '0');
      const groupStandby = parseFloat(totalStandbyHours || '0');
      const groupHasInput = !editedIndividually && (groupWorking > 0 || groupTraveling > 0 || groupStandby > 0);

      for (const member of memberHours) {
        const memberId = member.memberId;
        const scheduledHours = memberHoursMap.get(memberId) ?? 0;

        let workingInput = 0;
        let travelingInput = 0;
        let standbyInput = 0;

        if (editedIndividually) {
          const breakdown = memberBreakdowns[memberId] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
          workingInput = parseFloat(breakdown.workingHours || '0');
          travelingInput = parseFloat(breakdown.travelingHours || '0');
          standbyInput = parseFloat(breakdown.standbyHours || '0');
        }

        const hasIndividualInput = editedIndividually && (workingInput > 0 || travelingInput > 0 || standbyInput > 0);

        let working = editedIndividually ? workingInput : groupWorking;
        let traveling = editedIndividually ? travelingInput : groupTraveling;
        let standby = editedIndividually ? standbyInput : groupStandby;

        const hasInput = editedIndividually ? hasIndividualInput : groupHasInput;

        if (!hasInput) {
          working = scheduledHours;
          traveling = 0;
          standby = 0;
        }

        const totalMemberHours = working + traveling + standby;
        const endTime = computeEndTimeFromHours(DEFAULT_START_TIME, totalMemberHours);

        const entryId = existingEntryMap.get(memberId);

        const timeEntryUpdate = {
          start_time: DEFAULT_START_TIME,
          end_time: endTime,
          working_hours: working,
          traveling_hours: traveling,
          standby_hours: standby,
          hours_regular: totalMemberHours,
          status: 'submitted',
          comments: trimmedNotes || null,
          submitted_by: crewId,
          submitted_at: new Date().toISOString(),
        };

        if (entryId) {
          const { error: updateError } = await supabase
            .from('time_entries')
            .update(timeEntryUpdate)
            .eq('id', entryId);

          if (updateError) {
            console.error('Error updating time entry:', updateError);
            toast.error('Failed to update time entries. Please try again.');
            return;
          }

          timeEntryIdByMember[memberId] = entryId;
        } else {
          const { data: insertedEntry, error: insertError } = await supabase
            .from('time_entries')
            .insert({
              crew_id: crewId,
              member_id: memberId,
              date: dateForEntries,
              ...timeEntryUpdate,
            })
            .select('id')
            .single();

          if (insertError || !insertedEntry) {
            console.error('Error creating time entry:', insertError);
            toast.error('Failed to create time entries. Please try again.');
            return;
          }

          timeEntryIdByMember[memberId] = insertedEntry.id;
        }

        if (editedIndividually) {
          if (hasIndividualInput) {
            if (workingInput > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntryIdByMember[memberId],
                member_id: memberId,
                breakdown_type: 'working',
                hours: workingInput,
                description: trimmedNotes || null,
              });
            }
            if (travelingInput > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntryIdByMember[memberId],
                member_id: memberId,
                breakdown_type: 'traveling',
                hours: travelingInput,
                description: trimmedNotes || null,
              });
            }
            if (standbyInput > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntryIdByMember[memberId],
                member_id: memberId,
                breakdown_type: 'standby',
                hours: standbyInput,
                description: trimmedNotes || null,
              });
            }
          }
        } else if (groupHasInput) {
          if (groupWorking > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryIdByMember[memberId],
              member_id: memberId,
              breakdown_type: 'working',
              hours: groupWorking,
              description: trimmedNotes || null,
            });
          }
          if (groupTraveling > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryIdByMember[memberId],
              member_id: memberId,
              breakdown_type: 'traveling',
              hours: groupTraveling,
              description: trimmedNotes || null,
            });
          }
          if (groupStandby > 0) {
            breakdownInserts.push({
              time_entry_id: timeEntryIdByMember[memberId],
              member_id: memberId,
              breakdown_type: 'standby',
              hours: groupStandby,
              description: trimmedNotes || null,
            });
          }
        }
      }

      const timeEntryIds = Object.values(timeEntryIdByMember);

      if (timeEntryIds.length > 0) {
        const { error: deleteBreakdownError } = await supabase
          .from('hours_breakdown')
          .delete()
          .in('time_entry_id', timeEntryIds);

        if (deleteBreakdownError) {
          console.error('Error clearing previous hours breakdown:', deleteBreakdownError);
          toast.error('Failed to replace hours breakdown. Please try again.');
          return;
        }
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

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Box sx={{ maxWidth: 720, mx: 'auto', pb: 4 }}>
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
            // Individual Member View - show each member separately
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {memberHours.length > 0 ? (
                memberHours.map((member) => (
                  <Box
                    key={member.memberId}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'var(--theme-base-background-elevations-level-3)',
                    }}
                  >
                    {/* Member Header */}
                    <Typography variant="subtitle1" gutterBottom>
                      {getCrewMemberName(member.memberId)} - {member.hours.toFixed(1)} hours
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: 'var(--theme-base-text-secondary)' }}
                    >
                      Categorized: {getMemberTotalCategorized(member.memberId).toFixed(1)} | Remaining: {getMemberRemainingHours(member).toFixed(1)}
                    </Typography>
                    {isMemberOverLimit(member) && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Categories exceed logged hours by {(getMemberTotalCategorized(member.memberId) - member.hours).toFixed(1)} hours
                      </Alert>
                    )}

                    {/* Hours Breakdown for this member */}
                    <Typography variant="body2" color="text.primary" gutterBottom>
                      Hours Breakdown
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', mb: 2, color: 'var(--theme-base-text-secondary)' }}
                    >
                      Optional - Cannot exceed {member.hours.toFixed(1)} logged hours
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          Working
                        </Typography>
                        <TextField
                          fullWidth
                          type="text"
                          placeholder="0"
                          variant="outlined"
                          size="small"
                          value={memberBreakdowns[member.memberId]?.workingHours || ''}
                          onChange={(e) => updateMemberBreakdown(member.memberId, 'workingHours', e.target.value)}
                          error={isMemberOverLimit(member)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)',
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          Traveling
                        </Typography>
                        <TextField
                          fullWidth
                          type="text"
                          placeholder="0"
                          variant="outlined"
                          size="small"
                          value={memberBreakdowns[member.memberId]?.travelingHours || ''}
                          onChange={(e) => updateMemberBreakdown(member.memberId, 'travelingHours', e.target.value)}
                          error={isMemberOverLimit(member)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)',
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.primary" gutterBottom>
                          Standby
                        </Typography>
                        <TextField
                          fullWidth
                          type="text"
                          placeholder="0"
                          variant="outlined"
                          size="small"
                          value={memberBreakdowns[member.memberId]?.standbyHours || ''}
                          onChange={(e) => updateMemberBreakdown(member.memberId, 'standbyHours', e.target.value)}
                          error={isMemberOverLimit(member)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography sx={{ textAlign: 'center', py: 4, color: 'var(--theme-base-text-secondary)' }}>
                  No crew member hours data available
                </Typography>
              )}
            </Box>
          ) : (
            // Total Crew View - show aggregate hours
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)', borderRadius: 1 }}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Total Crew Hours: {totalHours.toFixed(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--theme-base-text-secondary)' }}>
                  Categorized: {getTotalCategorized().toFixed(1)} | Remaining: {getRemainingHours().toFixed(1)}
                </Typography>
              </Box>

              <Alert severity={isOverLimit ? 'error' : 'info'} sx={{ mb: 3 }}>
                {isOverLimit
                  ? `Categories exceed total hours by ${(getTotalCategorized() - totalHours).toFixed(1)} hours`
                  : `Remaining hours to categorize: ${getRemainingHours().toFixed(1)}`}
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Hours Breakdown
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mb: 2, color: 'var(--theme-base-text-secondary)' }}
                >
                  Optional - Cannot exceed {totalHours.toFixed(1)} total hours
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.primary" gutterBottom>
                      Working
                    </Typography>
                    <TextField
                      fullWidth
                      type="text"
                      placeholder="0"
                      variant="outlined"
                      size="small"
                      value={totalWorkingHours}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setTotalWorkingHours(value);
                      }}
                      error={isOverLimit}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.primary" gutterBottom>
                      Traveling
                    </Typography>
                    <TextField
                      fullWidth
                      type="text"
                      placeholder="0"
                      variant="outlined"
                      size="small"
                      value={totalTravelingHours}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setTotalTravelingHours(value);
                      }}
                      error={isOverLimit}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.primary" gutterBottom>
                      Standby
                    </Typography>
                    <TextField
                      fullWidth
                      type="text"
                      placeholder="0"
                      variant="outlined"
                      size="small"
                      value={totalStandbyHours}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setTotalStandbyHours(value);
                      }}
                      error={isOverLimit}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {/* Notes Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.primary" gutterBottom>
              Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter any notes or additional details here..."
              variant="outlined"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--theme-base-components-input-filled-enabled-fill)',
                }
              }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            size="large"
            sx={{ 
              mt: 2,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default AdditionalDetails;
