import { toast } from "sonner";
import { whatsappLink } from "./site";

type Msgs = { loading: string; success: string; error: string };

/** Helper único de notificações. Usar apenas no client. */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  promise<T>(promise: Promise<T>, msgs: Msgs): Promise<T> {
    toast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: () => ({
        message: msgs.error,
        action: { label: "Falar no WhatsApp", onClick: () => window.open(whatsappLink(), "_blank", "noopener") },
      }),
    });
    return promise;
  },
};
