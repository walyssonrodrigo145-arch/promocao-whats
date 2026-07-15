import { MessageService } from './message.service';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    sendTest(body: {
        jid: string;
        instanceName?: string;
    }): Promise<{
        success: boolean;
        result: any;
    }>;
}
