import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Library, BarChart3, LogOut, Settings, BookCopy } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const navItems = isAdmin ? [
    { to: "/admin/books", label: "Gérer les Livres", icon: Library },
    { to: "/admin/stats", label: "Statistiques", icon: BarChart3 },
  ] : [
    { to: "/", label: "Catalogue", icon: BookOpen },
    { to: "/borrowings", label: "Mes Emprunts", icon: BookCopy },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="text-xl font-serif font-bold text-foreground">BiblioThèque</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.username}
            </span>
            {isAdmin && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                Admin
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border flex overflow-x-auto">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className="flex-1">
              <Button
                variant={location.pathname === item.to ? "secondary" : "ghost"}
                size="sm"
                className="w-full gap-1 rounded-none text-xs"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </header>

      <main className="container px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
