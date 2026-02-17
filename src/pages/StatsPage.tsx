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

  const totalBooks = allBooks?.length ?? 0;
  const totalUsers = allUsers?.length ?? 0;

  const statCards = [
    { label: "Livres", value: totalBooks, icon: BookOpen },
    { label: "Utilisateurs", value: totalUsers, icon: Users },
    { label: "Emprunts totaux", value: topBooks?.reduce((sum: number, b: any) => sum + (b.count || 0), 0) ?? 0, icon: BookCopy },
    { label: "Livres populaires", value: topBooks?.length ?? 0, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Statistiques</h1>
      <p className="text-muted-foreground mb-6">Vue d'ensemble de l'activité de la bibliothèque.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Top Livres Empruntés</CardTitle>
          </CardHeader>
          <CardContent>
            {topBooks && topBooks.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topBooks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="title" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Emprunts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucune donnée disponible.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Top Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            {topUsers && topUsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="username" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Emprunts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucune donnée disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;
