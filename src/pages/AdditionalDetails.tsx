import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";

const AdditionalDetails = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);
  const handleSubmit = () => {
    navigate("/", { state: { showSuccess: true } });
  };
  return (
    <Layout title="Additional Details">
      <Helmet>
        <title>Additional Details | Notes</title>
        <meta name="description" content="Add notes and additional details for the crew's schedule verification." />
        <link rel="canonical" href="/additional-details" />
      </Helmet>

      <div className="flex items-center justify-center min-h-full p-4">
        <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-0 bg-[var(--gradient-card)]">
          <CardHeader>
            <h1 className="text-2xl font-bold text-foreground">Additional Details</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter any notes or additional details here..."
                aria-label="Notes"
                className="bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <section aria-labelledby="activity-hours-heading" className="space-y-3">
              <h2 id="activity-hours-heading" className="text-base font-semibold text-foreground">
                Hours Breakdown
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="working-hours" className="text-foreground">Working</Label>
                  <Input
                    id="working-hours"
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    min={0}
                    step={0.5}
                    aria-label="Working hours"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="traveling-hours" className="text-foreground">Traveling</Label>
                  <Input
                    id="traveling-hours"
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    min={0}
                    step={0.5}
                    aria-label="Traveling hours"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="standby-hours" className="text-foreground">Standby</Label>
                  <Input
                    id="standby-hours"
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    min={0}
                    step={0.5}
                    aria-label="Standby hours"
                  />
                </div>
              </div>
            </section>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 w-full">
            <Button onClick={handleSubmit} aria-label="Submit notes" className="w-full">
              Submit
            </Button>
            <Button variant="outline" onClick={handleBack} aria-label="Go back to previous screen" className="w-full">
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default AdditionalDetails;
