// ===== 아동 관리 (CRUD) =====

import { ATT_PASSWORD, getStudents, saveStudents } from '../data.js';

let manageUnlocked = false;
let editingStudentId = null;

function renderStudentList() {
  const students = getStudents();
  const list = document.getElementById('manageStudentList');

  if (students.length === 0) {
    list.innerHTML = '<div class="manage-empty">등록된 아동이 없습니다</div>';
    return;
  }

  list.innerHTML = students.map(s => `
    <div class="manage-row">
      <div class="manage-row-id">${s.id}</div>
      <div class="manage-row-info">
        <div class="manage-row-name">${s.name}</div>
        <div class="manage-row-detail">${s.school} · ${s.parent}</div>
      </div>
      <div class="manage-row-actions">
        <button class="manage-edit-btn" onclick="editStudent('${s.id}')">수정</button>
        <button class="manage-del-btn" onclick="deleteStudent('${s.id}')">삭제</button>
      </div>
    </div>
  `).join('');
}

function clearStudentForm() {
  document.getElementById('stuId').value = '';
  document.getElementById('stuName').value = '';
  document.getElementById('stuSchool').value = '';
  document.getElementById('stuParent').value = '';
}

export function unlockManage() {
  const pw = document.getElementById('managePw').value;
  if (pw === ATT_PASSWORD) {
    manageUnlocked = true;
    document.getElementById('manageLock').classList.add('hidden');
    document.getElementById('manageUnlocked').classList.remove('hidden');
    document.getElementById('managePw').value = '';
    document.getElementById('manageLockError').classList.add('hidden');
    renderStudentList();
  } else {
    document.getElementById('manageLockError').classList.remove('hidden');
  }
}

export function addStudent() {
  const id = document.getElementById('stuId').value.trim().padStart(4, '0');
  const name = document.getElementById('stuName').value.trim();
  const school = document.getElementById('stuSchool').value.trim();
  const parent = document.getElementById('stuParent').value.trim();

  if (!id || !name || !school || !parent) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const students = getStudents();

  if (editingStudentId) {
    const idx = students.findIndex(s => s.id === editingStudentId);
    if (idx !== -1) {
      if (id !== editingStudentId && students.some(s => s.id === id)) {
        alert('이미 사용 중인 번호입니다.');
        return;
      }
      students[idx] = { id, name, school, parent };
    }
    editingStudentId = null;
    document.getElementById('stuSubmitBtn').textContent = '추가';
    document.getElementById('stuCancelBtn').classList.add('hidden');
  } else {
    if (students.some(s => s.id === id)) {
      alert('이미 사용 중인 번호입니다.');
      return;
    }
    students.push({ id, name, school, parent });
  }

  saveStudents(students);
  clearStudentForm();
  renderStudentList();
}

export function editStudent(id) {
  const students = getStudents();
  const s = students.find(st => st.id === id);
  if (!s) return;

  editingStudentId = id;
  document.getElementById('stuId').value = s.id;
  document.getElementById('stuName').value = s.name;
  document.getElementById('stuSchool').value = s.school;
  document.getElementById('stuParent').value = s.parent;
  document.getElementById('stuSubmitBtn').textContent = '저장';
  document.getElementById('stuCancelBtn').classList.remove('hidden');

  document.querySelector('.manage-form').scrollIntoView({ behavior: 'smooth' });
}

export function cancelEditStudent() {
  editingStudentId = null;
  document.getElementById('stuSubmitBtn').textContent = '추가';
  document.getElementById('stuCancelBtn').classList.add('hidden');
  clearStudentForm();
}

export function deleteStudent(id) {
  if (!confirm('이 아동을 삭제하시겠습니까?')) return;
  let students = getStudents();
  students = students.filter(s => s.id !== id);
  saveStudents(students);
  renderStudentList();
}

// window 노출
window.unlockManage = unlockManage;
window.addStudent = addStudent;
window.editStudent = editStudent;
window.cancelEditStudent = cancelEditStudent;
window.deleteStudent = deleteStudent;
