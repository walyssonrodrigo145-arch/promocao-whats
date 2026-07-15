export declare class EvolutionService {
    private readonly logger;
    private readonly apiUrl;
    private readonly apiToken;
    private readonly defaultInstance;
    private getHeaders;
    getQrCode(instanceName?: string): Promise<any>;
    createInstance(instanceName: string): Promise<any>;
    getGroups(instanceName?: string): Promise<any>;
    sendTextMessage(jid: string, text: string, instanceName?: string): Promise<any>;
    sendMediaMessage(jid: string, caption: string, mediaUrl: string, instanceName?: string): Promise<any>;
}
