const NetworkId = {
  ETHEREUM: 1,
  RINKEBY: 4,
  MATIC: 137,
  EGEM: 1987,
  AVAX: 43114,
  EVMOS: 9001,
  MOVR: 1285,
  BNB: 56,
  ETC: 61,
  XDAI: 100,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  zkSyncTestnet: 280,
  zkSyncMainnet: 324,
}

const URLS = {
  // 1: "https://mainnet.infura.io/v3/0c8149f8e63b4b818d441dd7f74ab618",
  // 3: "https://ropsten.infura.io/v3/0c8149f8e63b4b818d441dd7f74ab618",
  // 80001: "https://matic-testnet-archive-rpc.bwarelabs.com",
  // 43113: "https://api.avax-test.network/ext/bc/C/rpc",
  // 5: "https://goerli.infura.io/v3/0c8149f8e63b4b818d441dd7f74ab618",
  [NetworkId.RINKEBY]: "https://rinkeby.infura.io/v3/0c8149f8e63b4b818d441dd7f74ab618",
  [NetworkId.EGEM]: "https://lb.rpc.egem.io",
  [NetworkId.AVAX]: "https://api.avax.network/ext/bc/C/rpc",
  [NetworkId.MATIC]: "https://polygon-rpc.com",
  [NetworkId.XDAI]: "https://rpc.gnosischain.com",
  [NetworkId.ETC]: "https://www.ethercluster.com/etc",
  [NetworkId.EVMOS]: "https://eth.bd.evmos.org:8545",
  [NetworkId.MOVR]: "https://rpc.api.moonriver.moonbeam.network",
  [NetworkId.BNB]: "https://bsc-dataseed1.binance.org",
  [NetworkId.OPTIMISM]: "",
  [NetworkId.ARBITRUM]: "",
  [NetworkId.zkSyncTestnet]: "https://testnet.era.zksync.dev",
  [NetworkId.zkSyncMainnet]: "https://mainnet.era.zksync.io",
};

const getLogUrl = {
  [NetworkId.MATIC]: "https://api.polygonscan.com/api?module=logs&action=getLogs",
  [NetworkId.AVAX]: "https://api.snowtrace.io/api?module=logs&action=getLogs",
  [NetworkId.BNB]: "https://api.bscscan.com/api?module=logs&action=getLogs",
  [NetworkId.MOVR]: "https://api-moonriver.moonscan.io/api?module=logs&action=getLogs",
  [NetworkId.EVMOS]: "https://evm.evmos.org/api?module=logs&action=getLogs",
  [NetworkId.XDAI]: "https://blockscout.com/xdai/mainnet/api?module=logs&action=getLogs",
  [NetworkId.zkSyncTestnet]: "https://zksync2-testnet.zkscan.io/api?module=logs&action=getLogs",
  [NetworkId.zkSyncTestnet]: "https://zksync2-mainnet.zkscan.io/api?module=logs&action=getLogs",
}

module.exports = {
  NetworkId,
  URLS,
  getLogUrl
}