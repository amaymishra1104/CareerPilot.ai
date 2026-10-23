import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ICPConfig, 
  Company, 
  Contact, 
  EnrichmentRecord, 
  ApprovalHistoryItem, 
  EmailSequence, 
  EmailDraftRecord, 
  WorkflowExecution, 
  WorkflowLog, 
  IntegrationSettings, 
  ApprovalStatus 
} from '@/types';
import { LocalStore } from './local-store';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export class SupabaseStore {
  static async getIcp(): Promise<ICPConfig> {
    const supabase = getSupabase();
    if (!supabase) return LocalStore.getIcp();
    try {
      const { data, error } = await supabase.from('icp_configurations').select('*').limit(1).single();
      if (error || !data) return LocalStore.getIcp();
      return {
        id: data.id,
        name: data.name,
        geography: data.geography,
        industries: data.industries,
        companySizeMinLocations: data.company_size_min_locations,
        companySizeMaxLocations: data.company_size_max_locations,
        restaurantCategories: data.restaurant_categories,
        targetRoles: data.target_roles,
        buyingSignals: data.buying_signals,
        notes: data.notes,
        updated_at: data.updated_at
      };
    } catch {
      return LocalStore.getIcp();
    }
  }

  static async updateIcp(icp: Partial<ICPConfig>): Promise<ICPConfig> {
    const supabase = getSupabase();
    if (!supabase) return LocalStore.updateIcp(icp);
    try {
      const { data } = await supabase.from('icp_configurations').upsert(icp).select().single();
      if (data) return data;
      return LocalStore.updateIcp(icp);
    } catch {
      return LocalStore.updateIcp(icp);
    }
  }

  static async getCompanies(): Promise<Company[]> {
    const supabase = getSupabase();
    if (!supabase) return LocalStore.getCompanies();
    try {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      if (error || !data) return LocalStore.getCompanies();
      return data;
    } catch {
      return LocalStore.getCompanies();
    }
  }

  static async getContacts(filter?: { company_id?: string; approval_status?: ApprovalStatus }): Promise<Contact[]> {
    const supabase = getSupabase();
    if (!supabase) return LocalStore.getContacts(filter);
    try {
      let query = supabase.from('contacts').select('*');
      if (filter?.company_id) query = query.eq('company_id', filter.company_id);
      if (filter?.approval_status) query = query.eq('approval_status', filter.approval_status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error || !data) return LocalStore.getContacts(filter);
      return data;
    } catch {
      return LocalStore.getContacts(filter);
    }
  }

  static async updateContactApproval(
    lead_id: string, 
    status: ApprovalStatus, 
    reviewer_notes?: string, 
    rejection_reason?: string
  ): Promise<Contact> {
    const supabase = getSupabase();
    if (!supabase) return LocalStore.updateContactApproval(lead_id, status, reviewer_notes, rejection_reason);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          approval_status: status,
          reviewer_notes,
          rejection_reason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', lead_id)
        .select()
        .single();
      
      if (error || !data) return LocalStore.updateContactApproval(lead_id, status, reviewer_notes, rejection_reason);

      await supabase.from('approval_history').insert({
        lead_id,
        previous_status: 'PENDING',
        new_status: status,
        reviewer_notes,
        rejection_reason,
        changed_at: new Date().toISOString(),
        changed_by: 'gtm_reviewer'
      });

      return data;
    } catch {
      return LocalStore.updateContactApproval(lead_id, status, reviewer_notes, rejection_reason);
    }
  }
}
