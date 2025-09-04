import React from 'react';
import { Outlet } from 'react-router-dom';
import AppBar from '@/components/AppBar';

const Layout: React.FC = () => {
    return (
        <div>
            <Outlet />
            <AppBar />
        </div>
    );
};

export default Layout;
