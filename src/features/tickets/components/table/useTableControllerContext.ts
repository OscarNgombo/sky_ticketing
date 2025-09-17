import TableControllerContext from "./TableControllerContext";
import { useContext } from "react";

export function useTableControllerContext() {
  return useContext(TableControllerContext);
}
