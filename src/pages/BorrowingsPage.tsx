import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowingService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookCopy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BorrowingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: borrowings, isLoading } = useQuery({
    queryKey: ["borrowings", user?.id],
    queryFn: async () => {
      return await borrowingService.getUserBorrowings();
    },
    enabled: !!user,
  });

  const returnMutation = useMutation({
    mutationFn: async (bookId: number) => {
      return await borrowingService.returnBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowings"] });
      toast({ title: "Livre retourné avec succès !" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.message || "Une erreur est survenue", 
        variant: "destructive" 
      });
    },
  });

  const handleReturn = async (bookId: number) => {
    returnMutation.mutate(bookId);
  };

  const active = borrowings?.filter(b => !b.returned_at) ?? [];
  const returned = borrowings?.filter(b => b.returned_at) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Mes Emprunts</h1>
      <p className="text-muted-foreground mb-6">Gérez vos livres empruntés.</p>

      <h2 className="text-xl font-serif font-bold mb-3">En cours ({active.length})</h2>
      {isLoading ? (
        <Card className="mb-8">
          <CardContent className="p-6 text-center text-muted-foreground">
            Chargement...
          </CardContent>
        </Card>
      ) : active.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="p-6 text-center text-muted-foreground">
            <BookCopy className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Aucun emprunt en cours.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 mb-8">
          {active.map(b => (
            <Card key={b.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif font-bold truncate">{b.books?.title}</p>
                  <p className="text-sm text-muted-foreground">{b.books?.author}</p>
                  <p className="text-xs text-muted-foreground">
                    Emprunté le {format(new Date(b.borrowed_at), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleReturn(b.book_id)} 
                  className="gap-1 flex-shrink-0"
                  disabled={returnMutation.isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {returnMutation.isPending ? "Retour..." : "Retourner"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="text-xl font-serif font-bold mb-3">Historique ({returned.length})</h2>
      {returned.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aucun livre retourné.</p>
      ) : (
        <div className="grid gap-3">
          {returned.map(b => (
            <Card key={b.id} className="opacity-70">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif font-bold truncate">{b.books?.title}</p>
                  <p className="text-sm text-muted-foreground">{b.books?.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(b.borrowed_at), "d MMM yyyy", { locale: fr })} → {format(new Date(b.returned_at!), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <Badge variant="secondary">Retourné</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowingsPage;
