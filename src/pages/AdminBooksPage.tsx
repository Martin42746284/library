import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookForm {
  title: string;
  author: string;
  isbn: string;
  stock: number;
}

const AdminBooksPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BookForm>({ title: "", author: "", isbn: "", stock: 1 });

  const { data: books, isLoading } = useQuery({
    queryKey: ["admin-books"],
    queryFn: async () => {
      return await bookService.getBooks();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: BookForm & { id?: number }) => {
      if (data.id) {
        return await bookService.updateBook(data.id, {
          title: data.title,
          author: data.author,
          isbn: data.isbn,
          stock: data.stock,
        });
      } else {
        return await bookService.createBook(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: editingId ? "Livre modifié" : "Livre ajouté" });
      resetForm();
    },
    onError: (err: any) => {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.message || "Une erreur est survenue", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await bookService.deleteBook(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({ title: "Livre supprimé" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Erreur", 
        description: err.response?.data?.message || "Une erreur est survenue", 
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setForm({ title: "", author: "", isbn: "", stock: 1 });
    setEditingId(null);
    setOpen(false);
  };

  const openEdit = (book: any) => {
    setForm({ title: book.title, author: book.author, isbn: book.isbn, stock: book.stock });
    setEditingId(book.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(editingId ? { ...form, id: editingId } : form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Gestion des Livres</h1>
          <p className="text-muted-foreground">Ajouter, modifier et supprimer des livres.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">{editingId ? "Modifier le livre" : "Ajouter un livre"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Titre</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <Label>Auteur</Label>
                <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} required />
              </div>
              <div>
                <Label>ISBN</Label>
                <Input value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} required />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} required />
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell>
                </TableRow>
              ) : books?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun livre trouvé</TableCell>
                </TableRow>
              ) : (
                books?.map(book => (
                  <TableRow key={book.id}>
                    <TableCell className="font-serif font-bold">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell className="font-mono text-xs">{book.isbn}</TableCell>
                    <TableCell className="text-center">{book.stock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(book)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(book.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBooksPage;
