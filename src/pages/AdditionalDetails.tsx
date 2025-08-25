import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  Alert
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { toast } from 'react-toastify';
import { supabase } from '@/integrations/supabase/client';

const AdditionalDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get individual member hours and editing mode from location state
  const memberHours = location.state?.memberHours || [];
  const editedIndividually = location.state?.editedIndividually || false;
  
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
  
  const handleBack = () => navigate("/");
  
  const handleSubmit = async () => {
    if (editedIndividually) {
      // Validate that breakdowns don't exceed individual member hours
      const invalidMembers = memberHours.filter((member: any) => {
        const breakdown = memberBreakdowns[member.memberId] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
        const totalCategorized = parseFloat(breakdown.workingHours || '0') + 
                                parseFloat(breakdown.travelingHours || '0') + 
                                parseFloat(breakdown.standbyHours || '0');
        return totalCategorized > member.hours;
      });

      if (invalidMembers.length > 0) {
        toast.error(`Some crew members have categorized hours exceeding their logged hours`);
        return;
      }
    } else {
      // Validate total crew hours breakdown
      const totalCategorized = parseFloat(totalWorkingHours || '0') + 
                              parseFloat(totalTravelingHours || '0') + 
                              parseFloat(totalStandbyHours || '0');
      
      if (totalCategorized > totalHours) {
        toast.error(`Total categorized hours (${totalCategorized}) cannot exceed total logged hours (${totalHours})`);
        return;
      }
    }

    try {
      // Prepare breakdown data for database insertion
      const breakdownInserts: any[] = [];
      const today = new Date().toISOString().split('T')[0];

      if (editedIndividually) {
        // Individual breakdowns - use each member's specific breakdown
        for (const member of memberHours) {
          const breakdown = memberBreakdowns[member.memberId] || { workingHours: '0', travelingHours: '0', standbyHours: '0' };
          
          // Get the time_entry_id for this member and date
          const { data: timeEntry } = await supabase
            .from('time_entries')
            .select('id')
            .eq('member_id', member.memberId)
            .eq('date', today)
            .eq('crew_id', '8685dabc-746e-4fe8-90a3-c41035c79dc0')
            .single();

          if (timeEntry) {
            // Add breakdown records for this member
            if (parseFloat(breakdown.workingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntry.id,
                member_id: member.memberId,
                breakdown_type: 'working',
                hours: parseFloat(breakdown.workingHours),
                description: notes || null
              });
            }
            if (parseFloat(breakdown.travelingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntry.id,
                member_id: member.memberId,
                breakdown_type: 'traveling',
                hours: parseFloat(breakdown.travelingHours),
                description: notes || null
              });
            }
            if (parseFloat(breakdown.standbyHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntry.id,
                member_id: member.memberId,
                breakdown_type: 'standby',
                hours: parseFloat(breakdown.standbyHours),
                description: notes || null
              });
            }
          }
        }
      } else {
        // Group breakdown - apply the same breakdown to each member
        for (const member of memberHours) {
          // Get the time_entry_id for this member and date
          const { data: timeEntry } = await supabase
            .from('time_entries')
            .select('id')
            .eq('member_id', member.memberId)
            .eq('date', today)
            .eq('crew_id', '8685dabc-746e-4fe8-90a3-c41035c79dc0')
            .single();

          if (timeEntry) {
            // Add the same breakdown for each member
            if (parseFloat(totalWorkingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntry.id,
                member_id: member.memberId,
                breakdown_type: 'working',
                hours: parseFloat(totalWorkingHours),
                description: notes || null
              });
            }
            if (parseFloat(totalTravelingHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntry.id,
                member_id: member.memberId,
                breakdown_type: 'traveling',
                hours: parseFloat(totalTravelingHours),
                description: notes || null
              });
            }
            if (parseFloat(totalStandbyHours || '0') > 0) {
              breakdownInserts.push({
                time_entry_id: timeEntry.id,
                member_id: member.memberId,
                breakdown_type: 'standby',
                hours: parseFloat(totalStandbyHours),
                description: notes || null
              });
            }
          }
        }
      }

      // Save breakdown data to database
      if (breakdownInserts.length > 0) {
        // First, delete any existing breakdowns for these time entries
        const timeEntryIds = breakdownInserts.map(b => b.time_entry_id);
        if (timeEntryIds.length > 0) {
          await supabase
            .from('hours_breakdown')
            .delete()
            .in('time_entry_id', timeEntryIds);
        }

        // Insert new breakdown data
        const { error } = await supabase
          .from('hours_breakdown')
          .insert(breakdownInserts);

        if (error) {
          console.error('Error saving hours breakdown:', error);
          toast.error('Failed to save hours breakdown. Please try again.');
          return;
        }
      }

      // Also update time_entries with notes if provided
      if (notes.trim()) {
        const memberIds = memberHours.map((m: any) => m.memberId);
        await supabase
          .from('time_entries')
          .update({ comments: notes })
          .in('member_id', memberIds)
          .eq('date', today)
          .eq('crew_id', '8685dabc-746e-4fe8-90a3-c41035c79dc0');
      }

      toast.success("Details submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error('Error saving breakdown:', error);
      toast.error('Failed to save breakdown. Please try again.');
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
            {editedIndividually ? (
              // Individual Member View - show each member separately
              <>
                {memberHours.length > 0 ? (
                  memberHours.map((member: any) => (
                    <Box key={member.memberId} sx={{ mb: 4 }}>
                      {/* Member Header */}
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                          {member.memberId === '3751647d-f0ae-4d62-a0a1-9a0bd3dbc2b1' ? 'David Brown' :
                           member.memberId === '47e34e83-b887-4d79-82a9-ffc1f63f5e17' ? 'John Smith' :
                           member.memberId === 'c648a699-cf2a-4ac7-bce8-19883a0db42b' ? 'Mike Johnson' :
                           member.memberId === '54704459-cf20-4137-9f6c-0c58ab8ac8b9' ? 'Sarah Williams' :
                           'Unknown Member'} - {member.hours.toFixed(1)} hours
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Categorized: {getMemberTotalCategorized(member.memberId).toFixed(1)} | Remaining: {getMemberRemainingHours(member).toFixed(1)}
                        </Typography>
                        {isMemberOverLimit(member) && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            Categories exceed logged hours by {(getMemberTotalCategorized(member.memberId) - member.hours).toFixed(1)} hours
                          </Alert>
                        )}
                      </Box>

                      {/* Hours Breakdown for this member */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                          Hours Breakdown
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
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
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No crew member hours data available
                  </Typography>
                )}
              </>
            ) : (
              // Total Crew View - show aggregate hours
              <>
                {/* Total Hours Display */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Total Crew Hours: {totalHours.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
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