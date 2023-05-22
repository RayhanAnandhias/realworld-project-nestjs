export class AuthorResponse {
  username: string;

  bio?: string;

  image?: string;

  following: boolean;
}

export class ArticleResponse {
  id: string;

  slug: string;

  title: string;

  description?: string;

  body: string;

  tagList?: Array<string>;

  createdAt: string;

  updatedAt: string;

  favorited: boolean;

  favoritesCount: number;

  author: AuthorResponse;
}

export class SingleArticleResponse {
  article: ArticleResponse | null;
}

export class MultipleArticleResponse {
  articles: Array<ArticleResponse>;
  articlesCount: number;
}
