export type SuccessResponse = {
  data: object | Array<any> | any;
  meta: {
    status: string;
    code: number;
    message: string;
    url: string;
    method: string;
  };
};

export type ErrorResponse = {
  error: object | Array<any> | any;
  meta: {
    status: string;
    code: number;
    message: string;
    url: string;
    method: string;
  };
};
