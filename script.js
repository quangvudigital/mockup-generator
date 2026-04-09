document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const generateBtn = document.getElementById('generateBtn');
    
    const uiState = {
        mockupDisplay: document.getElementById('mockupDisplay'),
        emptyState: document.querySelector('.empty-state'),
        loadingState: document.querySelector('.loading-state'),
        resultContent: document.getElementById('resultContent'),
        resultActions: document.getElementById('resultActions'),
        progressBar: document.querySelector('.progress'),
        
        // Editor UI
        editorToolbar: document.getElementById('editorToolbar'),
        editorTip: document.getElementById('editorTip')
    };

    let files = [];

    // --- 1. FILE UPLOAD LOGIC ---
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('dragover'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault(); dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFiles(e.target.files);
    });

    function handleFiles(newFiles) {
        files = [...files, ...Array.from(newFiles)];
        updateFileList();
    }

    function updateFileList() {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <span><i class="fa-regular fa-file-image"></i> ${file.name}</span>
                <i class="fa-solid fa-xmark" style="cursor: pointer;" onclick="removeFile(${index})"></i>
            `;
            fileList.appendChild(div);
        });
    }

    window.removeFile = (index) => {
        files.splice(index, 1);
        updateFileList();
    }

    // --- 2. GENERATION SIMULATION ---
    generateBtn.addEventListener('click', () => {
        const promptInfo = document.getElementById('prompt').value;
        if (!promptInfo && files.length === 0) {
            alert('Vui lòng nhập mô tả hoặc tải lên tệp tham khảo để tạo mockup!');
            return;
        }
        startGeneration();
    });

    function startGeneration() {
        // Change UI state to loading
        uiState.emptyState.classList.add('hidden');
        uiState.resultContent.classList.add('hidden');
        uiState.resultActions.classList.add('hidden');
        uiState.editorToolbar.classList.add('hidden');
        uiState.editorTip.classList.add('hidden');
        uiState.loadingState.classList.remove('hidden');
        
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo...';

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                finishGeneration();
            }
            uiState.progressBar.style.width = `${progress}%`;
        }, 500);
    }

    function finishGeneration() {
        setTimeout(() => {
            uiState.loadingState.classList.add('hidden');
            
            // Show Editor array
            uiState.resultContent.classList.remove('hidden');
            uiState.editorToolbar.classList.remove('hidden');
            uiState.editorTip.classList.remove('hidden');
            uiState.resultActions.classList.remove('hidden');
            
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Tạo lại Bản Phác Thảo <i class="fa-solid fa-rotate-right"></i>';
            uiState.progressBar.style.width = '0%';
        }, 300);
    }

    // --- 3. CUSTOMIZE & EDIT LOGIC ---
    const bgColorPicker = document.getElementById('bgColorPicker');
    const textColorPicker = document.getElementById('textColorPicker');
    const accentColorPicker = document.getElementById('accentColorPicker');
    const mockupBody = document.getElementById('mockupBody');
    const editableAccents = document.querySelectorAll('.editable-accent');

    // Change Background Color
    bgColorPicker.addEventListener('input', (e) => {
        mockupBody.style.backgroundColor = e.target.value;
    });

    // Change Global Text Color
    textColorPicker.addEventListener('input', (e) => {
        mockupBody.style.color = e.target.value;
        // The opacity of sub-text needs to be maintained via CSS inherited color
    });

    // Change Accent / Button color
    accentColorPicker.addEventListener('input', (e) => {
        editableAccents.forEach(el => {
            el.style.backgroundColor = e.target.value;
        });
    });

    // --- 4. EXPORT / DOWNLOAD LOGIC (html2canvas) ---
    const downloadBtn = document.getElementById('downloadBtn');
    
    downloadBtn.addEventListener('click', () => {
        const captureTarget = document.getElementById('captureTarget');
        const originalText = downloadBtn.innerHTML;
        
        // Temporarily remove editable borders for clean snapshot
        const editables = document.querySelectorAll('[contenteditable="true"]');
        editables.forEach(el => el.style.border = 'none');

        downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        downloadBtn.disabled = true;

        if (typeof html2canvas === 'undefined') {
            alert("Thư viện chụp ảnh (html2canvas) chưa tải xong, vui lòng thử lại sau giây lát.");
            restoreBtn();
            return;
        }

        html2canvas(captureTarget, {
            scale: 2, // High resolution
            useCORS: true,
            backgroundColor: null // transparent so it bounds to the box strictly
        }).then(canvas => {
            // Restore editable styles
            editables.forEach(el => el.style.border = '');

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = 'my-magic-mockup.png';
            link.href = image;
            link.click();
            
            restoreBtn();
        }).catch(err => {
            console.error("Lỗi khi tạo ảnh", err);
            alert("Đã có lỗi xảy ra khi tải ảnh, vui lòng thử lại!");
            editables.forEach(el => el.style.border = '');
            restoreBtn();
        });

        function restoreBtn() {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    });
});