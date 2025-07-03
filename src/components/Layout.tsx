
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Plus, ListChecks, LogOut, User, UsersRound, Shield } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <NavLink to={to} className="w-full">
      <Button 
        variant={isActive ? "default" : "ghost"} 
        className="w-full justify-start gap-2"
      >
        {icon}
        {label}
      </Button>
    </NavLink>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UsersRound className="h-6 w-6" />
            <h1 className="text-xl font-bold">GiveGood Harvest</h1>
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Logged in as <span className="font-semibold">{user?.name}</span> 
                {user?.role && <span className="ml-1 text-xs opacity-80 bg-primary-foreground/20 px-2 py-0.5 rounded-full">{user.role}</span>}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <NavLink to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </NavLink>
              <NavLink to="/register">
                <Button size="sm">Register</Button>
              </NavLink>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {isAuthenticated && (
          <aside className="w-64 bg-muted border-r border-border p-4 hidden md:block">
            <nav className="space-y-2">
              <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Dashboard" />
              
              {/* Admin specific navigation */}
              {user?.role === 'admin' && (
                <NavItem 
                  to="/admin" 
                  icon={<Shield className="h-5 w-5" />} 
                  label="Admin Panel" 
                />
              )}
              
              {/* Donor specific navigation */}
              {user?.role === 'donor' && (
                <>
                  <NavItem 
                    to="/donate" 
                    icon={<Plus className="h-5 w-5" />} 
                    label="Add Donation" 
                  />
                  <NavItem 
                    to="/my-donations" 
                    icon={<ListChecks className="h-5 w-5" />} 
                    label="My Donations" 
                  />
                </>
              )}
              
              {/* NGO specific navigation */}
              {user?.role === 'ngo' && (
                <>
                  <NavItem 
                    to="/browse" 
                    icon={<ListChecks className="h-5 w-5" />} 
                    label="Browse Donations" 
                  />
                  <NavItem 
                    to="/accepted" 
                    icon={<ListChecks className="h-5 w-5" />} 
                    label="Accepted Donations" 
                  />
                </>
              )}
              
              <NavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
            </nav>
          </aside>
        )}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-muted py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© 2025 GiveGood Harvest - Connecting donors with those in need</p>
      </footer>
    </div>
  );
};

export default Layout;
