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
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { toast } from 'react-toastify';
import { supabase } from '@/integrations/supabase/client';
import { useCrewData } from '@/hooks/useCrewData';

const AdditionalDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { crewMembers, crewId } = useCrewData();
  
  // Get individual member hours from location state
  const memberHours = location.state?.memberHours || [];
  
  // State for controlling individual vs crew editing mode
  const [editedIndividually, setEditedIndividually] = useState(false);
  
  // Calculate total hours based on editing mode
  const totalHours = editedIndividually 
    ? memberHours.reduce((total: number, member: any) => total + member.hours, 0) // Sum all individual hours
    : (memberHours.length > 0 ? memberHours[0].hours : 8); // Use single crew hours per person
  
  console.log('Member hours received:', memberHours, 'Edited individually:', editedIndividually, 'Total hours:', totalHours);
  
  // State for individual member breakdowns (when edited individually)
  const [memberBreakdowns, setMemberBreakdowns] = useState<Record<string, {
    workingHours: string;
    travelingHours: string;
    standbyHours: string;
  }>>({});
  
  // State for total crew breakdown (when edited as group)
  const [totalWorkingHours, setTotalWorkingHours] = useState('');
  const [totalTravelingHours, setTotalTravelingHours] = useState('');
  const [totalStandbyHours, setTotalStandbyHours] = useState('');
  
  const [notes, setNotes] = useState('');

  const getCrewMemberName = (memberId: string) =>
    crewMembers.find((member) => member.id === memberId)?.name ?? 'Unknown Member';
  
  const handleBack = () => navigate("/");
  
  const handleSubmit = async () => {
    if (!crewId || !crewMembers.length) {
      toast.error('Crew information is unavailable. Please try again later.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const timeEntriesToInsert: any[] = [];
      const breakdownInserts: any[] = [];

      // Create new time entries for each crew member
      for (const member of crewMembers) {
        let memberHours = 8; // Default 8 hours
        
        // If edited individually, use specific member breakdown, otherwise use totals
        if (editedIndividually) {
          const breakdown = memberBreakdowns[member.id] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
          memberHours = parseFloat(breakdown.workingHours || '0') + 
                       parseFloat(breakdown.travelingHours || '0') + 
                       parseFloat(breakdown.standbyHours || '0');
        } else {
          memberHours = getTotalCategorized() || 8;
        }

        // Create time entry
        const timeEntry = {
          crew_id: crewId,
          member_id: member.id,
          date: today,
          start_time: '08:00:00',
          end_time: memberHours === 8 ? '16:00:00' : `${8 + Math.floor(memberHours)}:${Math.round((memberHours % 1) * 60).toString().padStart(2, '0')}:00`,
          working_hours: memberHours,
          traveling_hours: 0,
          standby_hours: 0,
          status: 'submitted',
          comments: notes || null,
          submitted_by: null, // Will be set when auth is implemented
          submitted_at: new Date().toISOString()
        };
        
        timeEntriesToInsert.push(timeEntry);
      }

      // Insert time entries
      const { data: insertedEntries, error: timeEntryError } = await supabase
        .from('time_entries')
        .insert(timeEntriesToInsert)
        .select('id, member_id');

      if (timeEntryError) {
        console.error('Error creating time entries:', timeEntryError);
        toast.error('Failed to create time entries. Please try again.');
        return;
      }

      // Now create breakdown entries if hours are categorized
      if (insertedEntries) {
        for (const entry of insertedEntries) {
          if (editedIndividually) {
            // Individual breakdowns
            const breakdown = memberBreakdowns[entry.member_id] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
            
            if (parseFloat(breakdown.workingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: entry.id,
                member_id: entry.member_id,
                breakdown_type: 'working',
                hours: parseFloat(breakdown.workingHours),
                description: notes || null
              });
            }
            if (parseFloat(breakdown.travelingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: entry.id,
                member_id: entry.member_id,
                breakdown_type: 'traveling',
                hours: parseFloat(breakdown.travelingHours),
                description: notes || null
              });
            }
            if (parseFloat(breakdown.standbyHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: entry.id,
                member_id: entry.member_id,
                breakdown_type: 'standby',
                hours: parseFloat(breakdown.standbyHours),
                description: notes || null
              });
            }
          } else {
            // Group breakdown - same for all members
            if (parseFloat(totalWorkingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: entry.id,
                member_id: entry.member_id,
                breakdown_type: 'working',
                hours: parseFloat(totalWorkingHours),
                description: notes || null
              });
            }
            if (parseFloat(totalTravelingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: entry.id,
                member_id: entry.member_id,
                breakdown_type: 'traveling',
                hours: parseFloat(totalTravelingHours),
                description: notes || null
              });
            }
            if (parseFloat(totalStandbyHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: entry.id,
                member_id: entry.member_id,
                breakdown_type: 'standby',
                hours: parseFloat(totalStandbyHours),
                description: notes || null
              });
            }
          }
        }

        // Insert breakdown data if any exists
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
      }

      toast.success("Time entries created successfully!");
      navigate("/", { 
        state: { showSuccess: true, refreshData: true }
      });
    } catch (error) {
      console.error('Error creating time entries:', error);
      toast.error('Failed to create time entries. Please try again.');
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

  // Functions for individual member breakdown validation
  const getMemberTotalCategorized = (memberId: string) => {
    const breakdown = memberBreakdowns[memberId] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
    return parseFloat(breakdown.workingHours || '0') + 
           parseFloat(breakdown.travelingHours || '0') + 
           parseFloat(breakdown.standbyHours || '0');
  };

  const getMemberRemainingHours = (member: any) => {
    return Math.max(0, member.hours - getMemberTotalCategorized(member.memberId));
  };

  const isMemberOverLimit = (member: any) => {
    return getMemberTotalCategorized(member.memberId) > member.hours;
  };

  // Functions for total crew breakdown validation
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
              // Individual Member View - show each member separately
              <Box sx={{ space: 1 }}>
                {memberHours.length > 0 ? (
                  memberHours.map((member: any) => (
                    <Card key={member.memberId} sx={{ mb: 1, bgcolor: 'white' }}>
                      <CardContent sx={{ py: 2 }}>
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
                                  bgcolor: 'background.default',
                                }
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
                                  bgcolor: 'background.default',
                                }
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
                                  bgcolor: 'background.default',
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
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
                {/* Total Hours Display */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Total Crew Hours: {totalHours.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--theme-base-text-secondary)' }}>
                    Categorized: {getTotalCategorized().toFixed(1)} | Remaining: {getRemainingHours().toFixed(1)}
                  </Typography>
                  {isOverLimit && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Categories exceed total hours by {(getTotalCategorized() - totalHours).toFixed(1)} hours
                    </Alert>
                  )}
                </Box>

                {/* Hours Breakdown */}
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
                            bgcolor: 'background.default',
                          }
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
                            bgcolor: 'background.default',
                          }
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
                            bgcolor: 'background.default',
                          }
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
                    bgcolor: 'background.default',
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
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default AdditionalDetails;
