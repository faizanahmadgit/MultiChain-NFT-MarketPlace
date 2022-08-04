////////Binance Mainnet
export async function bscChain() {
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }],   // chainId 56 for binance mainnet
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x38',
                        chainName: 'Binance Smart Chain',
                        nativeCurrency: {
                            name: 'BNB',
                            symbol: 'BNB',
                            decimals: 18,
                        },
                        rpcUrls: ['https://bsc-dataseed2.defibit.io'],
                        blockExplorerUrls: ['https://bscscan.com/'],
                    }]
                })
            } catch (addError) {
                console.log('Error adding Chain');
            }
        }
    }
}
///////////