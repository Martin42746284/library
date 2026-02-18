import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(loginUsername, loginPassword);
      setUser(response.user);
      toast({ title: "Connexion réussie", description: "Vous êtes maintenant connecté." });
      // Redirect based on user role
      const redirectPath = response.user.role === 'ADMIN' ? '/admin/books' : '/';
      window.location.href = redirectPath;
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.message || "Veuillez vérifier vos identifiants et réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.register(regUsername, regEmail, regPassword);
      setUser(response.user);
      toast({ title: "Inscription réussie", description: "Votre compte a été créé avec succès." });
      // Redirect based on user role (new users are always USER role)
      const redirectPath = response.user.role === 'ADMIN' ? '/admin/books' : '/';
      window.location.href = redirectPath;
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.response?.data?.message || "Veuillez vérifier vos informations et réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BookOpen className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">BiblioThèque</h1>
        </div>

        <Card>
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login">
                <CardTitle className="mb-1">Connexion</CardTitle>
                <CardDescription className="mb-4">Entrez vos identifiants pour accéder à votre compte.</CardDescription>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Nom d'utilisateur</Label>
                    <Input
                      id="login-username"
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <CardTitle className="mb-1">Inscription</CardTitle>
                <CardDescription className="mb-4">Créez un compte pour emprunter des livres.</CardDescription>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="reg-username">Nom d'utilisateur</Label>
                    <Input
                      id="reg-username"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showRegPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Création..." : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
