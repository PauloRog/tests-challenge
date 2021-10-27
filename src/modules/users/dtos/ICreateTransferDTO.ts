interface ICreateTransferDTO {
  receiveUserId: string;
  senderUserId: string;
  amount: number;
  description: string;
}

export {ICreateTransferDTO}
