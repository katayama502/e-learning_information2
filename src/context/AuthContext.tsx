"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore, User } from '@/lib/appStore';

type UserRole = 'seeker' | 'company' | 'admin' | 'instructor';

interface AuthContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<UserRole>('seeker');
    const [isLoading, setIsLoading] = useState(true);
    const { loginAs, logout, setAnalysisResults, addUser } = useAppStore();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            if (session?.user) {
                // Fetch Profile Data with Retry logic
                const fetchProfileWithRetry = async (id: string, retries = 3): Promise<any> => {
                    for (let i = 0; i < retries; i++) {
                        try {
                            const profilePromise = supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', id)
                                .maybeSingle();

                            const timeoutPromise = new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('PROFILE_FETCH_TIMEOUT')), 10000)
                            );

                            console.log(`AuthProvider: Fetching profile for ${id} (Attempt ${i + 1}/${retries})`);
                            const result: any = await Promise.race([profilePromise, timeoutPromise]);

                            if (result.error) throw result.error;
                            if (result.data) return result.data;

                            // If data is null but no error, maybe it's not created yet, so retry
                            console.warn(`AuthProvider: Profile not found for ${id}, retrying...`);
                        } catch (err: any) {
                            console.warn(`AuthProvider: Fetch attempt ${i + 1} failed:`, err.message);
                            if (i === retries - 1) throw err; // Re-throw if last attempt
                        }
                        // Wait a bit before retry
                        await new Promise(res => setTimeout(res, 2000));
                    }
                    return null;
                };

                let profile: any = null;
                try {
                    profile = await fetchProfileWithRetry(session.user.id);
                } catch (err: any) {
                    console.warn('AuthProvider: Profile fetch failed after retries:', err.message);
                    // Force complete loading even on error to avoid infinite overlay
                    setIsLoading(false);
                    return;
                }
                if (profile) {
                    console.log('Profile found:', profile.id, profile.user_type);
                    // Sync Role (Properly map all roles)
                    let userRole: UserRole = 'seeker';
                    if (profile.user_type === 'company') userRole = 'company';
                    else if (profile.user_type === 'admin') userRole = 'admin';
                    else if (profile.user_type === 'instructor') userRole = 'instructor';

                    setRoleState(userRole);

                    // Fetch Company ID if user is company
                    let companyId: string | undefined;
                    if (userRole === 'company') {
                        try {
                            const { data: orgMember, error: orgError } = await supabase
                                .from('organization_members')
                                .select('organization_id')
                                .eq('user_id', session.user.id)
                                .maybeSingle(); // Use maybeSingle to avoid error on 0 rows

                            if (orgMember) {
                                companyId = orgMember.organization_id;
                            }
                            if (orgError) {
                                console.error('Error fetching org member:', orgError);
                            }
                        } catch (e) {
                            console.error('Exception fetching org member:', e);
                        }
                    }

                    // Update AppStore
                    // Construct User object from profile
                    // Note: Schema doesn't have all fields yet, using defaults for now.
                    const newUser: User = {
                        id: session.user.id,
                        name: profile.full_name || 'Guest',
                        age: 21, // Default
                        university: profile.university || '愛媛大学', // Default or from profile if exists (schema update needed)
                        faculty: '法文学部', // Default
                        bio: '',
                        tags: [],
                        image: profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + session.user.id,
                        isOnline: true,
                    };
                    addUser(newUser);
                    loginAs(userRole, session.user.id, companyId); // Pass companyId

                    // Critical: Fetch all users and companies to ensure AppStore has latest data
                    // This fixes the "Infinite Loading" (missing profile) and "Dummy Admin Data" issues
                    const { fetchUsers, fetchCompanies } = useAppStore.getState();
                    fetchUsers();
                    fetchCompanies();

                    // Sync Analysis Resuls
                    if (profile.diagnosis_result) {
                        console.log('Syncing diagnosis result:', profile.diagnosis_result);
                        setAnalysisResults(profile.diagnosis_result);
                    }

                    // Fetch detailed analysis from user_analysis table
                    console.log('AuthProvider: Triggering fetchUserAnalysis for', session.user.id);
                    useAppStore.getState().fetchUserAnalysis(session.user.id);
                }
            } else if (event === 'SIGNED_OUT') {
                useAppStore.getState().resetState();
                setRoleState('seeker');
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        localStorage.setItem('ehime-base-debug-role', newRole);
    };

    return (
        <AuthContext.Provider value={{ role, setRole, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
