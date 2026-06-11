import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const alertTheme = {
    confirmButtonColor: '#0088cc',
    cancelButtonColor: '#7f8c8d',
    customClass: {
        popup: 'app-alert-popup',
        title: 'app-alert-title',
        htmlContainer: 'app-alert-content',
        confirmButton: 'app-alert-confirm',
        cancelButton: 'app-alert-cancel',
    },
};

export const showSuccessAlert = (title: string, text?: string) => {
    return Swal.fire({
        ...alertTheme,
        title,
        text,
        icon: 'success',
        timer: 2200,
        timerProgressBar: true,
    });
};

export const showErrorAlert = (title: string, text?: string) => {
    return Swal.fire({
        ...alertTheme,
        title,
        text,
        icon: 'error',
    });
};

export const showConfirmAlert = async (title: string, text?: string) => {
    const result = await Swal.fire({
        ...alertTheme,
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
    });

    return result.isConfirmed;
};
