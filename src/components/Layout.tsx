import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, LayoutDashboard, Truck, Wrench, ClipboardCheck, Clock, DollarSign, ChevronLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  onBack?: () => void;
}

export const Layout = ({ children, title, onBack }: LayoutProps) => {
  const [showFabMenu, setShowFabMenu] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: false },
    { name: 'Convoys', icon: Truck, active: false },
    { name: 'Repair', icon: Wrench, active: false },
    { name: 'Assess', icon: ClipboardCheck, active: false },
    { name: 'Time Tracking', icon: Clock, active: true },
    { name: 'Expenses', icon: DollarSign, active: false },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-red-900 text-white">
        <div className="text-center pt-8 pb-4 relative">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              onClick={onBack}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {title}
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {children}
      </div>

      {/* FAB Menu */}
      <Button
        size="icon"
        className="absolute bottom-4 left-4 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        onClick={() => setShowFabMenu(!showFabMenu)}
      >
        <Grid3X3 className="h-6 w-6" />
      </Button>

      {/* Custom Menu Modal - stays within iPhone wrapper */}
      {showFabMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => setShowFabMenu(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl border-0 z-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  variant={item.active ? "default" : "outline"}
                  className="h-16 flex flex-col gap-2"
                  onClick={() => setShowFabMenu(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              ))}
            </div>
            
            {/* Collapse Button Row - 48px high */}
            <div className="h-12 flex items-center justify-start">
              <Button
                variant="ghost"
                className="h-12 w-12 rounded-full"
                onClick={() => setShowFabMenu(false)}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};