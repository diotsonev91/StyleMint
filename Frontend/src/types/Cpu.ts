export interface CpuCartItem extends BaseProductCartItem {
  category: "cpu";
  socket: string;
  cores: number;
  threads: number;
  clock: string;
  turbo?: string;
}
