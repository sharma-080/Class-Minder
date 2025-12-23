import { Link, useLocation } from "wouter";
import { CalendarClock, LayoutDashboard, BookOpen, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/timetable", label: "Timetable", icon: CalendarClock },
    { href: "/subjects", label: "Subjects", icon: BookOpen },
    { href: "/history", label: "History", icon: CalendarClock },
  ];

  if (!user) return null;

  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CalendarClock className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">Attendify</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-2
                    ${location === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {user.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt={user.firstName || "User"} 
                  className="w-8 h-8 rounded-full border border-border"
                />
              )}
              <span className="hidden sm:inline">{user.firstName}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout()}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-border/40 px-4 py-2 flex justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`
                p-2 rounded-lg cursor-pointer transition-all
                ${location === item.href ? "text-primary bg-primary/10" : "text-muted-foreground"}
              `}
            >
              <item.icon className="h-6 w-6" />
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
