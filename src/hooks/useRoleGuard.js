import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const useRoleGuard = () => {
  const { isAdmin, isManager, isStaff } = useContext(AuthContext);
  const toast = useToast();

  const canEdit = () => {
    if (isStaff) {
      toast.error("You don't have permission to perform this action.");
      return false;
    }
    return true;
  };

  return { canEdit, isAdmin, isManager, isStaff };
};