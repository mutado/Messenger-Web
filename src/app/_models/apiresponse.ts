export class ApiResponse<type>{
    success?: type;
    error?: string;
}

export class Pagination<type>{
    curent_page: number;
    data: type;
    from: number;
    to: number;
    last_page: number;
    total: number;
}