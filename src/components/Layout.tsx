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
                    <div className="flex justify-center p-4">
                        <button
                            onClick={handleSignIn}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Sign In Anonymously
                        </button>
                    </div>
                ) : (<Outlet />)}

            </div>

            {session && <AppBar />}
        </div>
    );
};

export default Layout;
