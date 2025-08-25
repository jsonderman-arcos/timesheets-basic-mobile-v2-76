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

const AdditionalDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get individual member hours from location state (passed from time entry)
  const memberHours = location.state?.memberHours || [];
  console.log('Member hours received:', memberHours); // Debug log
  
  const [memberBreakdowns, setMemberBreakdowns] = useState<Record<string, {
    workingHours: string;
    travelingHours: string;
    standbyHours: string;
  }>>({});
  const [notes, setNotes] = useState('');
  
  const handleBack = () => navigate("/");
  
  const handleSubmit = () => {
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
    
    toast.success("Details submitted successfully!");
    navigate("/");
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

  const getMemberRemainingHours = (member: any) => {
    return Math.max(0, member.hours - getMemberTotalCategorized(member.memberId));
  };

  const isMemberOverLimit = (member: any) => {
    return getMemberTotalCategorized(member.memberId) > member.hours;
  };

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
            {/* Crew Member Hours Display */}
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