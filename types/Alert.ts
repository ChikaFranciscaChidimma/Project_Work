export interface Alert {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "warning" | "success" | "info" | "error";
}