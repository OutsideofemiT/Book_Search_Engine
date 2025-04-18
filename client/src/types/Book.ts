// models/Book.ts
export interface Book {
	bookId: string;
	authors: string[];
	description?: string;
	title: string;
	image?: string;
	link?: string;
  }
  
  export interface BookInput extends Book {} // If needed for mutations
  