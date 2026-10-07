import Swal from 'sweetalert2';

export function academySuccess(title: string) {
  return Swal.fire({ icon: 'success', iconColor: '#555b38', confirmButtonColor: '#555b38', title, showConfirmButton: false, timer: 1500 });
}

export function academyError(title: string, message = 'กรุณาลองอีกครั้ง') {
  return Swal.fire({ icon: 'error', title, text: message, confirmButtonColor: '#555b38' });
}

export function academyConfirmDelete(title: string) {
  return Swal.fire({
    icon: 'warning',
    title,
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#555b38',
    cancelButtonColor: '#6b7280',
  });
}

export function academyConfirmDiscard() {
  return Swal.fire({
    icon: 'warning', title: 'มีข้อมูลที่ยังไม่ได้บันทึก',
    text: 'ต้องการออกโดยไม่บันทึกหรือไม่?', showCancelButton: true,
    confirmButtonText: 'ออกโดยไม่บันทึก', cancelButtonText: 'แก้ไขต่อ',
    confirmButtonColor: '#555b38', cancelButtonColor: '#6b7280',
  });
}
