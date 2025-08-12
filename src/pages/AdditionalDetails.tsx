import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AdditionalDetails = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Additional Details | Notes</title>
        <meta name="description" content="Add notes and additional details for the crew's schedule verification." />
        <link rel="canonical" href="/additional-details" />
      </Helmet>

      <Card className="w-full max-w-md shadow-[var(--shadow-soft)] border-0 bg-[var(--gradient-card)]">
        <CardHeader>
          <h1 className="text-2xl font-bold text-foreground">Additional Details</h1>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdditionalDetails;
