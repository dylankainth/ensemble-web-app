import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppBar from '@/components/AppBar';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const Layout: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
            console.error('Error signing in anonymously:', error);
        }


    };

    return (
        <div>
            {/* put in a top bar with our logo in teh middle*/}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 flex justify-center py-4 border-gray-200 border-b dark:border-gray-600">
                <img src="/wordmark.svg" className="h-10" />
            </div>

            <div className="pb-16">
                {!session ? (
                    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] bg-gray-50 dark:bg-gray-900 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                                Welcome to Ensemble
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                Saddle up.
                            </p>
                            <button
                                onClick={handleSignIn}
                                className="w-full px-6 py-3 bg-gradient-to-r from-ensemble-orange to-orange-500 hover:from-orange-500 hover:to-ensemble-orange text-white font-semibold rounded-md shadow transition-all duration-300"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                ) : (<Outlet />)}

            </div>

            {session && <AppBar />}
        </div>
    );
};

export default Layout;
