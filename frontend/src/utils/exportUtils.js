import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Excel Export
export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  
  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 0);
  const colWidths = new Array(maxWidth).fill({ wch: 15 });
  worksheet['!cols'] = colWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAsExcelFile(excelBuffer, `${filename}.xlsx`);
};

const saveAsExcelFile = (buffer, filename) => {
  const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, filename);
};

// PDF Export
export const exportToPDF = (data, filename) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text('Task Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  // Prepare table data
  const tableData = data.map(task => [
    task.title,
    task.brand.name,
    task.edition.name,
    task.type,
    task.status,
    task.assignedTo?.name || 'Unassigned',
    new Date(task.deadline).toLocaleDateString()
  ]);

  // Add table
  doc.autoTable({
    head: [['Task', 'Brand', 'Edition', 'Type', 'Status', 'Assigned To', 'Due Date']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  doc.save(`${filename}.pdf`);
};

// Task Export with Files
export const exportTaskWithFiles = async (taskId) => {
  try {
    // Fetch task data and files
    const [taskData, files] = await Promise.all([
      axios.get(`/api/tasks/${taskId}`),
      axios.get(`/api/tasks/${taskId}/files`)
    ]);

    const zip = new JSZip();
    
    // Add task metadata
    zip.file('task-info.json', JSON.stringify(taskData.data, null, 2));

    // Create folders for different file versions
    const versions = {};
    files.data.forEach(file => {
      if (!versions[file.version]) {
        versions[file.version] = zip.folder(`version-${file.version}`);
      }
      versions[file.version].file(file.filename, file.url, { binary: true });
    });

    // Generate zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `task-${taskId}-export.zip`);
  } catch (error) {
    console.error('Error exporting task:', error);
    throw error;
  }
};

// Task Import
export const importTaskData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const zip = await JSZip.loadAsync(e.target.result);
        
        // Read task metadata
        const taskInfoFile = await zip.file('task-info.json').async('string');
        const taskData = JSON.parse(taskInfoFile);

        // Process files by version
        const files = [];
        await Promise.all(
          Object.keys(zip.files).map(async (filename) => {
            if (filename !== 'task-info.json') {
              const content = await zip.file(filename).async('blob');
              const match = filename.match(/version-(\d+)\/(.*)/);
              if (match) {
                files.push({
                  version: parseInt(match[1]),
                  filename: match[2],
                  content
                });
              }
            }
          })
        );

        resolve({ taskData, files });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Bulk Export
export const exportBulkTasks = async (taskIds) => {
  try {
    const zip = new JSZip();
    
    for (const taskId of taskIds) {
      const [taskData, files] = await Promise.all([
        axios.get(`/api/tasks/${taskId}`),
        axios.get(`/api/tasks/${taskId}/files`)
      ]);

      const taskFolder = zip.folder(`task-${taskId}`);
      taskFolder.file('task-info.json', JSON.stringify(taskData.data, null, 2));

      const versions = {};
      files.data.forEach(file => {
        if (!versions[file.version]) {
          versions[file.version] = taskFolder.folder(`version-${file.version}`);
        }
        versions[file.version].file(file.filename, file.url, { binary: true });
      });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `bulk-tasks-export.zip`);
  } catch (error) {
    console.error('Error exporting bulk tasks:', error);
    throw error;
  }
};

// Task Template Export/Import
export const exportTaskTemplate = (template) => {
  const data = {
    name: template.name,
    type: template.type,
    description: template.description,
    checklistItems: template.checklistItems,
    defaultAssignees: template.defaultAssignees,
    workflow: template.workflow
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `task-template-${template.name}.json`);
};

export const importTaskTemplate = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target.result);
        resolve(template);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}; 