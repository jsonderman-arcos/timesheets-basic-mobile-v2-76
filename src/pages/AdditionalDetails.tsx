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
  const handleBack = () => navigate("/");
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

      <div className="flex items-start justify-center min-h-full p-4">
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
              <div className="flex items-center gap-2">
                <h2 id="activity-hours-heading" className="text-base font-semibold text-foreground">
                  Hours Breakdown
                </h2>
                <span className="text-xs text-muted-foreground/70">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="working-hours" className="text-foreground">Working</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        const input = document.getElementById('working-hours') as HTMLInputElement;
                        const currentValue = parseFloat(input.value) || 0;
                        const newValue = Math.max(0, currentValue - 0.5);
                        input.value = newValue.toString();
                      }}
                    >
                      -
                    </Button>
                    <Input
                      id="working-hours"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      min={0}
                      step={0.5}
                      aria-label="Working hours"
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        const input = document.getElementById('working-hours') as HTMLInputElement;
                        const currentValue = parseFloat(input.value) || 0;
                        const newValue = currentValue + 0.5;
                        input.value = newValue.toString();
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="traveling-hours" className="text-foreground">Traveling</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        const input = document.getElementById('traveling-hours') as HTMLInputElement;
                        const currentValue = parseFloat(input.value) || 0;
                        const newValue = Math.max(0, currentValue - 0.5);
                        input.value = newValue.toString();
                      }}
                    >
                      -
                    </Button>
                    <Input
                      id="traveling-hours"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      min={0}
                      step={0.5}
                      aria-label="Traveling hours"
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        const input = document.getElementById('traveling-hours') as HTMLInputElement;
                        const currentValue = parseFloat(input.value) || 0;
                        const newValue = currentValue + 0.5;
                        input.value = newValue.toString();
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standby-hours" className="text-foreground">Standby</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        const input = document.getElementById('standby-hours') as HTMLInputElement;
                        const currentValue = parseFloat(input.value) || 0;
                        const newValue = Math.max(0, currentValue - 0.5);
                        input.value = newValue.toString();
                      }}
                    >
                      -
                    </Button>
                    <Input
                      id="standby-hours"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      min={0}
                      step={0.5}
                      aria-label="Standby hours"
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => {
                        const input = document.getElementById('standby-hours') as HTMLInputElement;
                        const currentValue = parseFloat(input.value) || 0;
                        const newValue = currentValue + 0.5;
                        input.value = newValue.toString();
                      }}
                    >
                      +
                    </Button>
                  </div>
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
