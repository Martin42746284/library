
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Borrowings table
CREATE TABLE public.borrowings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  borrowed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  returned_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_books_title ON public.books USING GIN (to_tsvector('french', title));
CREATE INDEX idx_books_author ON public.books USING GIN (to_tsvector('french', author));
CREATE INDEX idx_books_isbn ON public.books (isbn);
CREATE INDEX idx_borrowings_user_id ON public.borrowings (user_id);
CREATE INDEX idx_borrowings_book_id ON public.borrowings (book_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- PL/pgSQL function: borrow a book (with transaction)
CREATE OR REPLACE FUNCTION public.borrow_book(_user_id UUID, _book_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _borrowing_id UUID;
  _stock INTEGER;
BEGIN
  -- Check stock
  SELECT stock INTO _stock FROM public.books WHERE id = _book_id FOR UPDATE;
  IF _stock IS NULL THEN
    RAISE EXCEPTION 'Book not found';
  END IF;
  IF _stock <= 0 THEN
    RAISE EXCEPTION 'No copies available';
  END IF;
  
  -- Check if user already has this book borrowed
  IF EXISTS (SELECT 1 FROM public.borrowings WHERE user_id = _user_id AND book_id = _book_id AND returned_at IS NULL) THEN
    RAISE EXCEPTION 'Book already borrowed';
  END IF;
  
  -- Decrement stock
  UPDATE public.books SET stock = stock - 1 WHERE id = _book_id;
  
  -- Create borrowing
  INSERT INTO public.borrowings (user_id, book_id) VALUES (_user_id, _book_id) RETURNING id INTO _borrowing_id;
  
  RETURN _borrowing_id;
END;
$$;

-- PL/pgSQL function: return a book
CREATE OR REPLACE FUNCTION public.return_book(_borrowing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _book_id UUID;
BEGIN
  SELECT book_id INTO _book_id FROM public.borrowings WHERE id = _borrowing_id AND returned_at IS NULL;
  IF _book_id IS NULL THEN
    RAISE EXCEPTION 'Borrowing not found or already returned';
  END IF;
  
  UPDATE public.borrowings SET returned_at = now() WHERE id = _borrowing_id;
  UPDATE public.books SET stock = stock + 1 WHERE id = _book_id;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username) 
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: everyone can read, users can update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles: only viewable (needed for role checks in app)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Books: everyone reads, admin CUD
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admins can insert books" ON public.books FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update books" ON public.books FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete books" ON public.books FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Borrowings: users see own, admins see all
CREATE POLICY "Users can view own borrowings" ON public.borrowings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all borrowings" ON public.borrowings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can insert borrowings" ON public.borrowings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own borrowings" ON public.borrowings FOR UPDATE USING (auth.uid() = user_id);
