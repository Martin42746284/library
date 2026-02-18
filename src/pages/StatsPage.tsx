import { useQuery } from "@tanstack/react-query";
import { statsService, bookService, userService } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen, Users, BookCopy, TrendingUp } from "lucide-react";

const StatsPage = () => {
  const { data: topBooks } = useQuery({
    queryKey: ["stats-top-books"],
    queryFn: async () => {
      const result = await statsService.getTopBooks();
      return result.data || result;
    },
  });

  const { data: topUsers } = useQuery({
    queryKey: ["stats-top-users"],
    queryFn: async () => {
      const result = await statsService.getTopUsers();
      return result.data || result;
    },
  });

  const { data: allBooks } = useQuery({
    queryKey: ["all-books-count"],
    queryFn: async () => {
      return await bookService.getBooks();
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ["all-users-count"],
    queryFn: async () => {
      return await userService.getAllUsers();
    },
  });

  const { data: totalBorrowings } = useQuery({
    queryKey: ["stats-total-borrowings"],
    queryFn: async () => {
      return await statsService.getTotalBorrowings();
    },
  });

  const { data: popularBooksCount } = useQuery({
    queryKey: ["stats-popular-books-count"],
    queryFn: async () => {
      return await statsService.getPopularBooksCount();
    },
  });

  const totalBooks = allBooks?.length ?? 0;
  const totalUsers = allUsers?.length ?? 0;
  const totalBorrows = totalBorrowings ?? 0;
  const popularBooks = popularBooksCount ?? 0;

  const statCards = [
    { label: "Total Livres", value: totalBooks, icon: BookOpen, description: "Nombre de livres disponibles" },
    { label: "Total Utilisateurs", value: totalUsers, icon: Users, description: "Nombre d'utilisateurs inscrits" },
    { label: "Emprunts Totaux", value: totalBorrows, icon: BookCopy, description: "Nombre total d'emprunts" },
    { label: "Livres Populaires", value: popularBooks, icon: TrendingUp, description: "Livres avec au moins 1 emprunt" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Statistiques</h1>
      <p className="text-muted-foreground mb-6">Vue d'ensemble de l'activité de la bibliothèque.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-foreground mb-1">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">📚 Top Livres Les Plus Empruntés</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Les 10 livres les plus populaires par nombre d'emprunts</p>
          </CardHeader>
          <CardContent>
            {topBooks && topBooks.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={topBooks}
                    margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--primary)/0.1)" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground">
                    📊 Le livre le plus emprunté : <span className="text-primary">{topBooks[0]?.title}</span> ({topBooks[0]?.count} emprunts)
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-12">Aucune donnée disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">👥 Top Utilisateurs Actifs</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Les 10 utilisateurs avec le plus d'emprunts</p>
          </CardHeader>
          <CardContent>
            {topUsers && topUsers.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={topUsers}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="username"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--accent)/0.1)" }} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold text-foreground">
                    ⭐ Utilisateur le plus actif : <span className="text-accent">{topUsers[0]?.username}</span> ({topUsers[0]?.count} emprunts)
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-12">Aucune donnée disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
