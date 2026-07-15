import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EvolutionService {
  private readonly logger = new Logger(EvolutionService.name);
  private readonly apiUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '');
  private readonly apiToken = process.env.EVOLUTION_API_TOKEN;

  // Default instance name if not provided
  private readonly defaultInstance = process.env.EVOLUTION_INSTANCE_NAME || 'wrmusic';

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiToken!,
    };
  }

  async getQrCode(instanceName: string = this.defaultInstance): Promise<any> {
    try {
      this.logger.log(`Fetching QR Code for instance: ${instanceName}`);
      const response = await fetch(`${this.apiUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Se a instância não existir, talvez precisemos criar
        if (response.status === 404 || data.message?.includes('not found')) {
          this.logger.warn(`Instance ${instanceName} not found. Trying to create it...`);
          await this.createInstance(instanceName);
          return this.getQrCode(instanceName);
        }
        throw new Error(data.message || 'Failed to connect instance');
      }

      return data;
    } catch (error) {
      this.logger.error('Error fetching QR code:', error);
      throw error;
    }
  }

  async createInstance(instanceName: string) {
    this.logger.log(`Creating instance: ${instanceName}`);
    const response = await fetch(`${this.apiUrl}/instance/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create instance');
    }
    return response.json();
  }

  async getGroups(instanceName: string = this.defaultInstance) {
    try {
      this.logger.log(`Fetching groups for instance: ${instanceName}`);
      // Na Evolution API, a rota para grupos é /group/fetchAll/{instanceName}
      const response = await fetch(`${this.apiUrl}/group/fetchAll/${instanceName}?getParticipants=false`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch groups');
      }

      return response.json();
    } catch (error) {
      this.logger.error('Error fetching groups:', error);
      throw error;
    }
  }

  async sendTextMessage(jid: string, text: string, instanceName: string = this.defaultInstance) {
    try {
      this.logger.log(`Sending message to ${jid} via instance ${instanceName}`);
      const response = await fetch(`${this.apiUrl}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          number: jid,
          options: {
            delay: 1200,
            presence: 'composing',
          },
          text: text,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      return data;
    } catch (error) {
      this.logger.error(`Error sending message to ${jid}:`, error);
      throw error;
    }
  }

  async sendMediaMessage(jid: string, caption: string, mediaUrl: string, instanceName: string = this.defaultInstance) {
    try {
      this.logger.log(`Sending media message to ${jid} via instance ${instanceName}`);
      const response = await fetch(`${this.apiUrl}/message/sendMedia/${instanceName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          number: jid,
          mediatype: "image",
          mimetype: "image/jpeg",
          caption: caption,
          media: mediaUrl,
          options: {
            delay: 1200,
            presence: 'composing',
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send media message');
      }

      return data;
    } catch (error) {
      this.logger.error(`Error sending media message to ${jid}:`, error);
      throw error;
    }
  }
}
