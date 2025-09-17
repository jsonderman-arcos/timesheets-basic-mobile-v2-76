import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_SHIFT_END, DEFAULT_SHIFT_START, LOGGED_IN_CREW_MEMBER_ID } from '@/constants/crew';

interface CrewMemberRecord {
  id: string;
  name: string;
  role: string | null;
  hourly_rate: number | null;
  crew_id: string | null;
  active?: boolean | null;
}

export interface CrewMemberInfo {
  id: string;
  name: string;
  role: string | null;
  hourlyRate: number | null;
  crewId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
}

interface CrewDataResult {
  loggedInMember: CrewMemberInfo | null;
  crewMembers: CrewMemberInfo[];
  crewId: string | null;
  crewName: string | null;
  isLoading: boolean;
  error: unknown;
}

const mapCrewMember = (record: CrewMemberRecord): CrewMemberInfo => ({
  id: record.id,
  name: record.name,
  role: record.role,
  hourlyRate: record.hourly_rate,
  crewId: record.crew_id,
  scheduledStart: DEFAULT_SHIFT_START,
  scheduledEnd: DEFAULT_SHIFT_END,
});

export const useCrewData = (): CrewDataResult => {
  const loggedInMemberQuery = useQuery({
    queryKey: ['crew-member', LOGGED_IN_CREW_MEMBER_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, name, role, hourly_rate, crew_id')
        .eq('id', LOGGED_IN_CREW_MEMBER_ID)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Logged in crew member not found.');
      }

      return mapCrewMember(data as CrewMemberRecord);
    },
  });

  const crewMembersQuery = useQuery({
    enabled: Boolean(loggedInMemberQuery.data?.crewId),
    queryKey: ['crew-members', loggedInMemberQuery.data?.crewId],
    queryFn: async () => {
      const crewId = loggedInMemberQuery.data?.crewId;
      if (!crewId) {
        return [] as CrewMemberInfo[];
      }

      const { data, error } = await supabase
        .from('crew_members')
        .select('id, name, role, hourly_rate, crew_id, active')
        .eq('crew_id', crewId)
        .order('name');

      if (error) {
        throw error;
      }

      const activeRecords = (data ?? []).filter((member) => member.active !== false);
      return activeRecords.map((member) => mapCrewMember(member as CrewMemberRecord));
    },
  });

  const crewInfoQuery = useQuery({
    enabled: Boolean(loggedInMemberQuery.data?.crewId),
    queryKey: ['crew-info', loggedInMemberQuery.data?.crewId],
    queryFn: async () => {
      const crewId = loggedInMemberQuery.data?.crewId;
      if (!crewId) {
        return null;
      }

      const { data, error } = await supabase
        .from('crews')
        .select('id, crew_name')
        .eq('id', crewId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const value = useMemo<CrewDataResult>(() => ({
    loggedInMember: loggedInMemberQuery.data ?? null,
    crewMembers: crewMembersQuery.data ?? [],
    crewId: loggedInMemberQuery.data?.crewId ?? null,
    crewName: crewInfoQuery.data?.crew_name ?? null,
    isLoading:
      loggedInMemberQuery.isLoading ||
      crewMembersQuery.isLoading ||
      crewInfoQuery.isLoading,
    error:
      loggedInMemberQuery.error ||
      crewMembersQuery.error ||
      crewInfoQuery.error ||
      null,
  }), [
    loggedInMemberQuery.data,
    loggedInMemberQuery.error,
    loggedInMemberQuery.isLoading,
    crewMembersQuery.data,
    crewMembersQuery.error,
    crewMembersQuery.isLoading,
    crewInfoQuery.data,
    crewInfoQuery.error,
    crewInfoQuery.isLoading,
  ]);

  return value;
};
