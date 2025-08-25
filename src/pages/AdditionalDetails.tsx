import { Helmet } from "react-helmet-async";
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { toast } from 'react-toastify';

const AdditionalDetails = () => {
  // Force cache refresh
  const navigate = useNavigate();
  
  const handleBack = () => navigate("/");
  
  const handleSubmit = () => {
    toast.success("Details submitted successfully!");
    navigate("/");
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    e.target.value = value;
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
                  Optional
                </Typography>
              </Box>
              
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
                    onChange={handleNumberInput}
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
                    onChange={handleNumberInput}
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
                    onChange={handleNumberInput}
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