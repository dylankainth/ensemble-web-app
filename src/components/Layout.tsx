import React from 'react';
import { Outlet } from 'react-router-dom';
import AppBar from '@/components/AppBar';

const Layout: React.FC = () => {
    return (
        <div>
            {/* put in a top bar with our logo in teh middle*/}
            <div className="flex justify-center py-4 border-gray-200 border-b dark:border-gray-600">
                <span className='text-5xl font-bold tracking-[-0.4rem] text-ensemble-orange'>Ensemble</span>
            </div>

            <div className="pb-16">
                <Outlet />
            </div>

            <AppBar />
        </div>
    );
};

export default Layout;
