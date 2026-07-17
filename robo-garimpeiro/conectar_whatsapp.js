const fs = require('fs');

async function getQRCode() {
    console.log('🔄 Solicitando QR Code para a Evolution API...');
    
    try {
        const response = await fetch('http://76.13.228.159:8080/instance/connect/wrmusic', {
            method: 'GET',
            headers: {
                'apikey': 'minha_chave_secreta_123'
            }
        });

        if (!response.ok) {
            console.error('❌ Erro na API:', response.status, await response.text());
            return;
        }

        const data = await response.json();
        
        if (data.base64) {
            // Remove o prefixo "data:image/png;base64,"
            const base64Data = data.base64.replace(/^data:image\/png;base64,/, "");
            fs.writeFileSync('qrcode.png', base64Data, 'base64');
            console.log('✅ SUCESSO! O arquivo "qrcode.png" foi salvo nesta mesma pasta.');
            console.log('📱 Abra a imagem "qrcode.png" e escaneie com seu WhatsApp para reconectar!');
        } else if (data.instance?.state === 'open') {
            console.log('🎉 Boa notícia: A instância já está conectada (state: open)! O erro do envio era outro.');
        } else {
            console.log('⚠️ Resposta inesperada:', data);
        }
    } catch (e) {
        console.error('❌ Erro de conexão:', e.message);
    }
}

getQRCode();
