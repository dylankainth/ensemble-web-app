import React from 'react';
import { Outlet } from 'react-router-dom';
import AppBar from '@/components/AppBar';

const Layout: React.FC = () => {
    return (
        <div>
            <div className="pb-16">
            <Outlet />
            </div>
            
            <AppBar />
        </div>
    );
};

export default Layout;
