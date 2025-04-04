export interface Book {
  authors: string[],
  description: string;
  bookId: string;
  image: string;
  link: string;
  title: string;
}
export interface BookInput {
  bookId: string;
  authors: string[];
  description?: string;
  title: string;
  image?: string;
  link?: string;
}
