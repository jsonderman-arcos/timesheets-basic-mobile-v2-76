import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HoursBreakdown {
  breakdown_type: string;
  hours: number;
  description: string;
  start_time: string;
  end_time: string;
}

interface TimeEntryWithDetails {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours_regular: number;
  hours_overtime: number;
  location: string;
  work_description: string;
  status: string;
  crews: {
    crew_name: string;
  };
  crew_members: {
    name: string;
    role: string;
    hourly_rate: number;
  };
  hours_breakdown: HoursBreakdown[];
}

const TimeEntryList = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        id,
        date,
        start_time,
        end_time,
        hours_regular,
        hours_overtime,
        location,
        work_description,
        status,
        crews:crew_id (
          crew_name
        ),
        crew_members:member_id (
          name,
          role,
          hourly_rate
        ),
        hours_breakdown (
          breakdown_type,
          hours,
          description,
          start_time,
          end_time
        )
      `)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
    } else {
      setTimeEntries(data || []);
    }
    
    setLoading(false);
  };

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotal = (entry: TimeEntryWithDetails) => {
    return entry.hours_regular + entry.hours_overtime;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading time entries...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Time Entries</h1>
        </div>
        <Button onClick={fetchTimeEntries} variant="outline">
          Refresh
        </Button>
      </div>

      {timeEntries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No time entries found</h3>
            <p className="text-muted-foreground">Start tracking time to see entries here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {entry.crew_members?.name || 'Unknown Member'}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({entry.crew_members?.role || 'Unknown Role'})
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                      </span>
                      <span>{calculateTotal(entry)}h total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                    <Badge variant="outline">
                      {entry.crews?.crew_name || 'Unknown Crew'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {entry.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{entry.location}</span>
                    </div>
                  )}

                  {entry.work_description && (
                    <div className="text-sm">
                      <span className="font-medium">Work Description:</span>
                      <p className="mt-1 text-muted-foreground">{entry.work_description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Regular Hours:</span> {entry.hours_regular}
                    </div>
                    <div>
                      <span className="font-medium">Overtime Hours:</span> {entry.hours_overtime}
                    </div>
                  </div>

                  {entry.hours_breakdown && entry.hours_breakdown.length > 0 && (
                    <>
                      <Separator />
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between p-0 h-auto"
                            onClick={() => toggleExpanded(entry.id)}
                          >
                            <span className="font-medium">Hours Breakdown ({entry.hours_breakdown.length} activities)</span>
                            {expandedEntries.has(entry.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-3">
                          {entry.hours_breakdown.map((breakdown, index) => (
                            <div key={index} className="bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="capitalize">
                                    {breakdown.breakdown_type}
                                  </Badge>
                                  <span className="font-medium">{breakdown.hours}h</span>
                                </div>
                                {breakdown.start_time && breakdown.end_time && (
                                  <span className="text-sm text-muted-foreground">
                                    {formatTime(breakdown.start_time)} - {formatTime(breakdown.end_time)}
                                  </span>
                                )}
                              </div>
                              {breakdown.description && (
                                <p className="text-sm text-muted-foreground">{breakdown.description}</p>
                              )}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeEntryList;