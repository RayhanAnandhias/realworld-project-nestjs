import { AuthorResponse } from 'src/articles/dto/article-response.dto';

export class CommentResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  author: AuthorResponse;
}

export class SingleCommentResponse {
  comment: CommentResponse;
}

export class MultipleCommentResponse {
  comment: Array<CommentResponse>;
}
