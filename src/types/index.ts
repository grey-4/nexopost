export interface DataRequest {
    senderId: string;
    receiverId: string;
    data: any;
}

export interface DataResponse {
    success: boolean;
    message: string;
    data?: any;
}