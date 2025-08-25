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
  
  // Get total hours from query params (passed from time entry)
  const searchParams = new URLSearchParams(location.search);
  const totalHours = parseFloat(searchParams.get('totalHours') || '8.0');
  
  const [workingHours, setWorkingHours] = useState('');
  const [travelingHours, setTravelingHours] = useState('');
  const [standbyHours, setStandbyHours] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleBack = () => navigate("/");
  
  const handleSubmit = () => {
    const totalCategorized = parseFloat(workingHours || '0') + 
                            parseFloat(travelingHours || '0') + 
                            parseFloat(standbyHours || '0');
    
    if (totalCategorized > totalHours) {
      toast.error(`Total categorized hours (${totalCategorized}) cannot exceed total logged hours (${totalHours})`);
      return;
    }
    
    toast.success("Details submitted successfully!");
    navigate("/");
  };

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setter(value);
  };

  const getTotalCategorized = () => {
    return parseFloat(workingHours || '0') + 
           parseFloat(travelingHours || '0') + 
           parseFloat(standbyHours || '0');
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
            {/* Total Hours Display */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Total Logged Hours: {totalHours}
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

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  Hours Breakdown
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Optional - Cannot exceed {totalHours} total hours
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.primary" gutterBottom>
                    Working
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="0"
                    variant="outlined"
                    size="small"
                    value={workingHours}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setWorkingHours(value);
                    }}
                    error={isOverLimit}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                      }
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.primary" gutterBottom>
                    Traveling
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="0"
                    variant="outlined"
                    size="small"
                    value={travelingHours}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setTravelingHours(value);
                    }}
                    error={isOverLimit}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default',
                      }
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.primary" gutterBottom>
                    Standby
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="0"
                    variant="outlined"
                    size="small"
                    value={standbyHours}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setStandbyHours(value);
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