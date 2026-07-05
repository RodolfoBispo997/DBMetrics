export type DatabaseHealth = {
  status: "ONLINE" | "OFFLINE" | "WARNING" | "CRITICAL";
  message: string;
  checkedAt: Date;
};
