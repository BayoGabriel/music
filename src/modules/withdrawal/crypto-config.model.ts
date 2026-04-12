export type CryptoNetworkDocument = {
  name: string;
  isEnabled: boolean;
};

export type CryptoConfigDocument = {
  id: string;
  coin: string;
  isEnabled: boolean;
  networks: CryptoNetworkDocument[];
  createdAt: Date;
  updatedAt: Date;
};
