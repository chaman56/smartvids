import { toast } from "sonner";

export function errorToast(message: string, description?: string) {
    toast.error(message, {
        description:description,
        style: {
            color: 'rgb(255, 100, 100)',
        },
    });
}

export function successToast(message: string, description?: string) {
    toast.success(message, {
        description:description,
        style: {
            color: 'rgb(70, 255, 70)',
        },
    });
}