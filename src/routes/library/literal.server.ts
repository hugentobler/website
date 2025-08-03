export const LiteralTokenQuery = `
  mutation login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			token
			profile { id }
		}
	}
`;

export interface LiteralTokenResponse {
  data: {
    login: {
      token: string;
      profile: {
        id: number;
      };
    };
  };
}

export const LiteralBookQuery = `
  query GetBookByIsbn($isbn13: String!) {
    book(where: { isbn13: $isbn13 }) {
      title
      cover
      authors {
        name
      }
    }
  }
`;

export interface LiteralBook {
  title: string;
  cover: string;
  authors: Array<{
    name: string;
  }>;
}

export interface LiteralBookResponse {
  data: {
    book: LiteralBook | null;
  };
}

// Additional types
export type Author = {
  name: string;
};
