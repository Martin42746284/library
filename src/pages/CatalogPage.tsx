import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookService, borrowingService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const CatalogPage = () => {
  const [search, setSearch] = useState("");
  const [borrowingLoading, setBorrowingLoading] = useState<Record<number, boolean>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: books, isLoading, refetch } = useQuery({
    queryKey: ["books", search],
    queryFn: async () => {
      const allBooks = await bookService.getBooks();
      if (!search.trim()) {
        return allBooks;
      }
      const searchLower = search.toLowerCase();
      return allBooks.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.isbn.includes(search)
      );
    },
  });

  const handleBorrow = async (bookId: number) => {
    if (!user) return;
    setBorrowingLoading(prev => ({ ...prev, [bookId]: true }));
    try {
      await borrowingService.borrowBook(bookId);
      toast({ title: "Livre emprunté avec succès !" });
      refetch();
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.response?.data?.message || "Une erreur est survenue", 
        variant: "destructive" 
      });
    } finally {
      setBorrowingLoading(prev => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Catalogue des Livres</h1>
        <p className="text-muted-foreground">Parcourez notre collection et empruntez vos livres préférés.</p>
      </div>

      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, auteur ou ISBN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-40" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books?.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-lg text-foreground truncate">{book.title}</h3>
                      <p className="text-muted-foreground text-sm">{book.author}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{book.isbn}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary/30 flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant={book.stock > 0 ? "default" : "destructive"}>
                      {book.stock > 0 ? `${book.stock} disponible${book.stock > 1 ? "s" : ""}` : "Indisponible"}
                    </Badge>
                    <Button
                      size="sm"
                      disabled={book.stock <= 0 || borrowingLoading[book.id]}
                      onClick={() => handleBorrow(book.id)}
                    >
                      {borrowingLoading[book.id] ? "Emprunt..." : "Emprunter"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {books?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Aucun livre trouvé.</p>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
